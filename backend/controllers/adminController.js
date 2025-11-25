const db = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * Get all users (Admin only)
 * GET /api/admin/users
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const query = `
            SELECT id, name, email, role, phone, is_active, email_verified, created_at, last_login
            FROM users
            ORDER BY created_at DESC
        `;
        
        const result = await db.query(query);
        
        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        next(error);
    }
};

/**
 * Get system statistics (Admin only)
 * GET /api/admin/stats
 */
exports.getSystemStats = async (req, res, next) => {
    try {
        // Get user counts by role (all users, not just active)
        const usersQuery = `
            SELECT role, COUNT(*) as count
            FROM users
            GROUP BY role
        `;
        
        // Get total food trucks
        const trucksQuery = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'open') as open,
                COUNT(*) FILTER (WHERE status = 'closed') as closed,
                COUNT(*) FILTER (WHERE status = 'busy') as busy
            FROM food_trucks
            WHERE is_active = TRUE
        `;
        
        // Get total orders
        const ordersQuery = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'completed') as completed,
                COUNT(*) FILTER (WHERE status = 'preparing') as preparing,
                COUNT(*) FILTER (WHERE status = 'received') as received
            FROM orders
        `;
        
        const [usersResult, trucksResult, ordersResult] = await Promise.all([
            db.query(usersQuery),
            db.query(trucksQuery),
            db.query(ordersQuery)
        ]);
        
        res.json({
            success: true,
            data: {
                users: usersResult.rows,
                trucks: trucksResult.rows[0],
                orders: ordersResult.rows[0]
            }
        });
    } catch (error) {
        console.error('Error fetching system stats:', error);
        next(error);
    }
};

/**
 * Create food truck with vendor (Admin only)
 * POST /api/admin/trucks
 */
exports.createTruckWithVendor = async (req, res, next) => {
    try {
        const {
            truckName,
            description,
            location,
            prepTimeMinutes,
            vendorName,
            vendorEmail,
            vendorPassword
        } = req.body;

        // Validate required fields
        if (!truckName || !vendorName || !vendorEmail || !vendorPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate GIU email
        const allowedDomains = ['@student.giu-uni.de', '@giu-uni.de', '@giu.edu.eg'];
        const emailDomain = vendorEmail.substring(vendorEmail.lastIndexOf('@')).toLowerCase();
        if (!allowedDomains.some(domain => emailDomain === domain.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Vendor email must be a valid GIU email'
            });
        }

        // Check if email exists
        const emailCheck = await db.query('SELECT id FROM users WHERE email = $1', [vendorEmail]);
        if (emailCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Check if truck name exists
        const truckCheck = await db.query('SELECT id FROM food_trucks WHERE name = $1', [truckName]);
        if (truckCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Truck name already exists'
            });
        }

        // Start transaction
        await db.query('BEGIN');

        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(vendorPassword, 10);

            // Create vendor user
            const vendorQuery = `
                INSERT INTO users (name, email, password, role, is_active, email_verified)
                VALUES ($1, $2, $3, 'vendor', TRUE, TRUE)
                RETURNING id, name, email, role
            `;
            const vendorResult = await db.query(vendorQuery, [vendorName, vendorEmail, hashedPassword]);
            const vendor = vendorResult.rows[0];

            // Create food truck
            const truckQuery = `
                INSERT INTO food_trucks (
                    name, description, location, vendor_id, status, 
                    is_busy, prep_time_minutes, is_active
                )
                VALUES ($1, $2, $3, $4, 'closed', FALSE, $5, TRUE)
                RETURNING id, name, description, location, vendor_id, status, prep_time_minutes
            `;
            const truckResult = await db.query(truckQuery, [
                truckName,
                description || '',
                location || '',
                vendor.id,
                prepTimeMinutes || 15
            ]);
            const truck = truckResult.rows[0];

            await db.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Food truck and vendor created successfully',
                data: { truck, vendor }
            });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error creating truck with vendor:', error);
        next(error);
    }
};

/**
 * Delete food truck and its vendor (Admin only)
 * DELETE /api/admin/trucks/:id
 */
exports.deleteTruck = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get truck with vendor info
        const truckQuery = `
            SELECT id, name, vendor_id 
            FROM food_trucks 
            WHERE id = $1
        `;
        const truckResult = await db.query(truckQuery, [id]);

        if (truckResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Food truck not found'
            });
        }

        const truck = truckResult.rows[0];

        // Start transaction
        await db.query('BEGIN');

        try {
            // Delete menu items (cascade will handle order_items)
            await db.query('DELETE FROM menu_items WHERE food_truck_id = $1', [id]);

            // Delete orders and order_items (cascade)
            await db.query('DELETE FROM orders WHERE food_truck_id = $1', [id]);

            // Delete food truck
            await db.query('DELETE FROM food_trucks WHERE id = $1', [id]);

            // Delete vendor user if exists
            if (truck.vendor_id) {
                await db.query('DELETE FROM users WHERE id = $1', [truck.vendor_id]);
            }

            await db.query('COMMIT');

            res.json({
                success: true,
                message: 'Food truck and vendor deleted successfully'
            });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error deleting truck:', error);
        next(error);
    }
};

/**
 * Get all food trucks for admin (including inactive)
 * GET /api/admin/trucks
 */
exports.getAllTrucksAdmin = async (req, res, next) => {
    try {
        const query = `
            SELECT 
                ft.id,
                ft.name,
                ft.description,
                ft.location,
                ft.status,
                ft.is_busy,
                ft.prep_time_minutes,
                ft.vendor_id,
                u.name as vendor_name,
                u.email as vendor_email,
                ft.created_at
            FROM food_trucks ft
            LEFT JOIN users u ON ft.vendor_id = u.id
            ORDER BY ft.created_at DESC
        `;
        
        const result = await db.query(query);
        
        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching trucks:', error);
        next(error);
    }
};

/**
 * Toggle user active status (Admin only)
 * PATCH /api/admin/users/:id/toggle-active
 */
exports.toggleUserActive = async (req, res, next) => {
    try {
        const { id } = req.params;

        const query = `
            UPDATE users 
            SET is_active = NOT is_active
            WHERE id = $1
            RETURNING id, name, email, is_active
        `;
        
        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User status updated',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error toggling user status:', error);
        next(error);
    }
};
