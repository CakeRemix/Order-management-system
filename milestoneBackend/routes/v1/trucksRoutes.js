const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { verifyToken, verifyRole } = require('../../../middleware/authMiddleware');

/**
 * Trucks Routes - /api/v1/trucks
 */

/**
 * View all available trucks
 * GET /api/v1/trucks/view
 * Role: Customer (public)
 */
router.get('/view', async (req, res, next) => {
    try {
        const trucks = await db('foodtruck.trucks')
            .select(
                'truckid',
                'truckname',
                'trucklogo',
                'truckstatus',
                'orderstatus',
                'createdat'
            )
            .orderBy('truckname');

        res.json({
            success: true,
            count: trucks.length,
            data: trucks.map(truck => ({
                truckId: truck.truckid,
                truckName: truck.truckname,
                truckLogo: truck.trucklogo,
                truckStatus: truck.truckstatus,
                orderStatus: truck.orderstatus,
                isAvailable: truck.truckstatus === 'available' && truck.orderstatus === 'available',
                createdAt: truck.createdat
            }))
        });
    } catch (error) {
        console.error('Error fetching trucks:', error);
        next(error);
    }
});

/**
 * View my truck info
 * GET /api/v1/trucks/myTruck
 * Role: Truck Owner
 */
router.get('/myTruck', verifyToken, verifyRole('truckOwner'), async (req, res, next) => {
    try {
        const userId = req.user.id;

        const truck = await db('foodtruck.trucks')
            .select('*')
            .where('ownerid', userId)
            .first();

        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'No truck found for this owner'
            });
        }

        // Get menu items count
        const menuCount = await db('foodtruck.menuitems')
            .where('truckid', truck.truckid)
            .count('* as count')
            .first();

        // Get pending orders count
        const pendingOrders = await db('foodtruck.orders')
            .where('truckid', truck.truckid)
            .whereIn('orderstatus', ['pending', 'confirmed'])
            .count('* as count')
            .first();

        res.json({
            success: true,
            data: {
                truckId: truck.truckid,
                truckName: truck.truckname,
                truckLogo: truck.trucklogo,
                truckStatus: truck.truckstatus,
                orderStatus: truck.orderstatus,
                ownerId: truck.ownerid,
                createdAt: truck.createdat,
                menuItemsCount: parseInt(menuCount.count),
                pendingOrdersCount: parseInt(pendingOrders.count)
            }
        });
    } catch (error) {
        console.error('Error fetching truck:', error);
        next(error);
    }
});

/**
 * Update truck availability (order status)
 * PUT /api/v1/trucks/updateOrderStatus
 * Role: Truck Owner
 */
router.put('/updateOrderStatus', verifyToken, verifyRole('truckOwner'), async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { orderStatus, truckStatus } = req.body;

        // Get truck owned by this user
        const truck = await db('foodtruck.trucks')
            .select('truckid')
            .where('ownerid', userId)
            .first();

        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'No truck found for this owner'
            });
        }

        // Build update object
        const updateData = {};
        
        if (orderStatus !== undefined) {
            if (!['available', 'unavailable'].includes(orderStatus)) {
                return res.status(400).json({
                    success: false,
                    message: 'orderStatus must be "available" or "unavailable"'
                });
            }
            updateData.orderstatus = orderStatus;
        }

        if (truckStatus !== undefined) {
            if (!['available', 'unavailable'].includes(truckStatus)) {
                return res.status(400).json({
                    success: false,
                    message: 'truckStatus must be "available" or "unavailable"'
                });
            }
            updateData.truckstatus = truckStatus;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide orderStatus or truckStatus to update'
            });
        }

        // Update truck
        const [updatedTruck] = await db('foodtruck.trucks')
            .where('truckid', truck.truckid)
            .update(updateData)
            .returning('*');

        res.json({
            success: true,
            message: 'Truck status updated successfully',
            data: {
                truckId: updatedTruck.truckid,
                truckName: updatedTruck.truckname,
                truckStatus: updatedTruck.truckstatus,
                orderStatus: updatedTruck.orderstatus
            }
        });
    } catch (error) {
        console.error('Error updating truck status:', error);
        next(error);
    }
});

module.exports = router;
