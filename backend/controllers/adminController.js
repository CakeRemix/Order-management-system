const db = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * Get all users (Admin only)
 * GET /api/admin/users
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await db('foodtruck.users')
            .select('userid', 'name', 'email', 'role', 'birthdate', 'createdat')
            .orderBy('createdat', 'desc');
        
        res.json({
            success: true,
            count: users.length,
            data: users.map(user => ({
                id: user.userid,
                name: user.name,
                email: user.email,
                role: user.role,
                birthDate: user.birthdate,
                createdAt: user.createdat
            }))
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
        const users = await db('foodtruck.users')
            .select('role')
            .count('* as count')
            .groupBy('role');
        
        // Get total food trucks with status breakdown
        const trucksData = await db('foodtruck.trucks')
            .select(
                db.raw("COUNT(*) as total"),
                db.raw("COUNT(*) FILTER (WHERE truckstatus = 'available') as available"),
                db.raw("COUNT(*) FILTER (WHERE truckstatus = 'unavailable') as unavailable")
            )
            .first();
        
        // Get total orders with status breakdown
        const ordersData = await db('foodtruck.orders')
            .select(
                db.raw("COUNT(*) as total"),
                db.raw("COUNT(*) FILTER (WHERE orderstatus = 'completed') as completed"),
                db.raw("COUNT(*) FILTER (WHERE orderstatus = 'confirmed') as confirmed"),
                db.raw("COUNT(*) FILTER (WHERE orderstatus = 'pending') as pending"),
                db.raw("COUNT(*) FILTER (WHERE orderstatus = 'ready') as ready")
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
        const emailCheck = await db('foodtruck.users')
            .select('userid')
            .where('email', vendorEmail)
            .first();
            
        if (emailCheck) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Check if truck name exists
        const truckCheck = await db('foodtruck.trucks')
            .select('truckid')
            .where('truckname', truckName)
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
            const [vendor] = await trx('foodtruck.users')
                .insert({
                    name: vendorName,
                    email: vendorEmail,
                    password: hashedPassword,
                    role: 'truckOwner',
                    createdat: trx.raw('NOW()')
                })
                .returning(['userid', 'name', 'email', 'role']);

            // Create food truck
            const [truck] = await trx('foodtruck.trucks')
                .insert({
                    truckname: truckName,
                    ownerid: vendor.userid,
                    truckstatus: 'available',
                    orderstatus: 'available',
                    createdat: trx.raw('NOW()')
                })
                .returning(['truckid', 'truckname', 'ownerid', 'truckstatus', 'orderstatus']);

            return { 
                truck: {
                    id: truck.truckid,
                    name: truck.truckname,
                    ownerId: truck.ownerid,
                    truckStatus: truck.truckstatus,
                    orderStatus: truck.orderstatus
                }, 
                vendor: {
                    id: vendor.userid,
                    name: vendor.name,
                    email: vendor.email,
                    role: vendor.role
                }
            };
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
        const truck = await db('foodtruck.trucks')
            .select('truckid', 'truckname', 'ownerid')
            .where('truckid', id)
            .first();

        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'Food truck not found'
            });
        }

        // Use Knex transaction - cascade delete will handle related records
        await db.transaction(async (trx) => {
            // Delete food truck (cascade will handle menuitems, orders, etc.)
            await trx('foodtruck.trucks')
                .where('truckid', id)
                .del();

            // Delete vendor user if exists
            if (truck.ownerid) {
                await trx('foodtruck.users')
                    .where('userid', truck.ownerid)
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
 * Get all food trucks for admin
 * GET /api/admin/trucks
 */
exports.getAllTrucksAdmin = async (req, res, next) => {
    try {
        const trucks = await db('foodtruck.trucks as ft')
            .leftJoin('foodtruck.users as u', 'ft.ownerid', 'u.userid')
            .select(
                'ft.truckid',
                'ft.truckname',
                'ft.trucklogo',
                'ft.truckstatus',
                'ft.orderstatus',
                'ft.ownerid',
                'u.name as vendor_name',
                'u.email as vendor_email',
                'ft.createdat'
            )
            .orderBy('ft.createdat', 'desc');
        
        res.json({
            success: true,
            count: trucks.length,
            data: trucks.map(truck => ({
                id: truck.truckid,
                name: truck.truckname,
                logo: truck.trucklogo,
                truckStatus: truck.truckstatus,
                orderStatus: truck.orderstatus,
                ownerId: truck.ownerid,
                vendorName: truck.vendor_name,
                vendorEmail: truck.vendor_email,
                createdAt: truck.createdat
            }))
        });
    } catch (error) {
        console.error('Error fetching trucks:', error);
        next(error);
    }
};

/**
 * Update user role (Admin only)
 * PATCH /api/admin/users/:id/role
 */
exports.updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Validate role
        const validRoles = ['customer', 'truckOwner', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
            });
        }

        const [user] = await db('foodtruck.users')
            .where('userid', id)
            .update({ role })
            .returning(['userid', 'name', 'email', 'role']);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User role updated',
            data: {
                id: user.userid,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        next(error);
    }
};

/**
 * Delete user (Admin only)
 * DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Prevent deleting self
        if (req.user.id === parseInt(id)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        const [deleted] = await db('foodtruck.users')
            .where('userid', id)
            .del()
            .returning('userid');

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        next(error);
    }
};
