const db = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * Get all users (Admin only)
 * GET /api/admin/users
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await db('public.users')
            .select('id', 'name', 'email', 'role', 'phone', 'is_active', 'email_verified', 'created_at', 'last_login')
            .orderBy('created_at', 'desc');
        
        res.json({
            success: true,
            count: users.length,
            data: users
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
        // Get user counts by role
        const users = await db('public.users')
            .select('role')
            .count('* as count')
            .groupBy('role');
        
        // Get total food trucks with status breakdown
        const trucksData = await db('public.food_trucks')
            .where('is_active', true)
            .select(
                db.raw("COUNT(*) as total"),
                db.raw("COUNT(*) FILTER (WHERE status = 'open') as open"),
                db.raw("COUNT(*) FILTER (WHERE status = 'closed') as closed"),
                db.raw("COUNT(*) FILTER (WHERE status = 'busy') as busy")
            )
            .first();
        
        // Get total orders with status breakdown
        const ordersData = await db('public.orders')
            .select(
                db.raw("COUNT(*) as total"),
                db.raw("COUNT(*) FILTER (WHERE status = 'completed') as completed"),
                db.raw("COUNT(*) FILTER (WHERE status = 'preparing') as preparing"),
                db.raw("COUNT(*) FILTER (WHERE status = 'received') as received")
            )
            .first();
        
        res.json({
            success: true,
            data: {
                users: users,
                trucks: trucksData,
                orders: ordersData
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
        const emailCheck = await db('public.users')
            .select('id')
            .where('email', vendorEmail)
            .first();
            
        if (emailCheck) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Check if truck name exists
        const truckCheck = await db('public.food_trucks')
            .select('id')
            .where('name', truckName)
            .first();
            
        if (truckCheck) {
            return res.status(409).json({
                success: false,
                message: 'Truck name already exists'
            });
        }

        // Use Knex transaction
        const result = await db.transaction(async (trx) => {
            // Hash password
            const hashedPassword = await bcrypt.hash(vendorPassword, 10);

            // Create vendor user
            const vendors = await trx('public.users')
                .insert({
                    name: vendorName,
                    email: vendorEmail,
                    password: hashedPassword,
                    role: 'vendor',
                    is_active: true,
                    email_verified: true
                })
                .returning(['id', 'name', 'email', 'role']);
            
            const vendor = vendors[0];

            // Create food truck
            const trucks = await trx('public.food_trucks')
                .insert({
                    name: truckName,
                    description: description || '',
                    location: location || '',
                    vendor_id: vendor.id,
                    status: 'closed',
                    is_busy: false,
                    prep_time_minutes: prepTimeMinutes || 15,
                    is_active: true
                })
                .returning(['id', 'name', 'description', 'location', 'vendor_id', 'status', 'prep_time_minutes']);
            
            const truck = trucks[0];

            return { truck, vendor };
        });

        res.status(201).json({
            success: true,
            message: 'Food truck and vendor created successfully',
            data: result
        });
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
        const truck = await db('public.food_trucks')
            .select('id', 'name', 'vendor_id')
            .where('id', id)
            .first();

        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'Food truck not found'
            });
        }

        // Use Knex transaction
        await db.transaction(async (trx) => {
            // Delete menu items (cascade will handle order_items)
            await trx('public.menu_items')
                .where('food_truck_id', id)
                .del();

            // Delete orders and order_items (cascade)
            await trx('public.orders')
                .where('food_truck_id', id)
                .del();

            // Delete food truck
            await trx('public.food_trucks')
                .where('id', id)
                .del();

            // Delete vendor user if exists
            if (truck.vendor_id) {
                await trx('public.users')
                    .where('id', truck.vendor_id)
                    .del();
            }
        });

        res.json({
            success: true,
            message: 'Food truck and vendor deleted successfully'
        });
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
        const trucks = await db('public.food_trucks as ft')
            .leftJoin('public.users as u', 'ft.vendor_id', 'u.id')
            .select(
                'ft.id',
                'ft.name',
                'ft.description',
                'ft.location',
                'ft.status',
                'ft.is_busy',
                'ft.prep_time_minutes',
                'ft.vendor_id',
                'u.name as vendor_name',
                'u.email as vendor_email',
                'ft.created_at'
            )
            .orderBy('ft.created_at', 'desc');
        
        res.json({
            success: true,
            count: trucks.length,
            data: trucks
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

        const users = await db('public.users')
            .where('id', id)
            .update({
                is_active: db.raw('NOT is_active')
            })
            .returning(['id', 'name', 'email', 'is_active']);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User status updated',
            data: users[0]
        });
    } catch (error) {
        console.error('Error toggling user status:', error);
        next(error);
    }
};
