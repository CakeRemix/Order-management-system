const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { verifyToken, verifyRole } = require('../../../middleware/authMiddleware');

/**
 * Menu Item Routes - /api/v1/menuItem
 */

// ==================== TRUCK OWNER ROUTES ====================

/**
 * Create new menu item
 * POST /api/v1/menuItem/new
 * Role: Truck Owner
 */
router.post('/new', verifyToken, verifyRole('truckOwner'), async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, description, price, category, status = 'available' } = req.body;

        // Validation
        if (!name || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'Name, price, and category are required'
            });
        }

        if (price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a positive number'
            });
        }

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

        // Create menu item
        const [newItem] = await db('foodtruck.menuitems')
            .insert({
                truckid: truck.truckid,
                name,
                description: description || null,
                price,
                category,
                status,
                createdat: db.raw('NOW()')
            })
            .returning('*');

        res.status(201).json({
            success: true,
            message: 'Menu item created successfully',
            data: {
                itemId: newItem.itemid,
                truckId: newItem.truckid,
                name: newItem.name,
                description: newItem.description,
                price: parseFloat(newItem.price),
                category: newItem.category,
                status: newItem.status,
                createdAt: newItem.createdat
            }
        });
    } catch (error) {
        console.error('Error creating menu item:', error);
        next(error);
    }
});

/**
 * View my menu items
 * GET /api/v1/menuItem/view
 * Role: Truck Owner
 */
router.get('/view', verifyToken, verifyRole('truckOwner'), async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get truck owned by this user
        const truck = await db('foodtruck.trucks')
            .select('truckid', 'truckname')
            .where('ownerid', userId)
            .first();

        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'No truck found for this owner'
            });
        }

        // Get menu items
        const menuItems = await db('foodtruck.menuitems')
            .select('*')
            .where('truckid', truck.truckid)
            .orderBy('category')
            .orderBy('name');

        res.json({
            success: true,
            truck: {
                truckId: truck.truckid,
                truckName: truck.truckname
            },
            count: menuItems.length,
            data: menuItems.map(item => ({
                itemId: item.itemid,
                name: item.name,
                description: item.description,
                price: parseFloat(item.price),
                category: item.category,
                status: item.status,
                createdAt: item.createdat
            }))
        });
    } catch (error) {
        console.error('Error fetching menu items:', error);
        next(error);
    }
});

/**
 * View specific menu item
 * GET /api/v1/menuItem/view/:itemId
 * Role: Truck Owner
 */
router.get('/view/:itemId', verifyToken, verifyRole('truckOwner'), async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;

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

        // Get menu item
        const item = await db('foodtruck.menuitems')
            .select('*')
            .where({ itemid: itemId, truckid: truck.truckid })
            .first();

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found or does not belong to your truck'
            });
        }

        res.json({
            success: true,
            data: {
                itemId: item.itemid,
                truckId: item.truckid,
                name: item.name,
                description: item.description,
                price: parseFloat(item.price),
                category: item.category,
                status: item.status,
                createdAt: item.createdat
            }
        });
    } catch (error) {
        console.error('Error fetching menu item:', error);
        next(error);
    }
});

/**
 * Edit menu item
 * PUT /api/v1/menuItem/edit/:itemId
 * Role: Truck Owner
 */
router.put('/edit/:itemId', verifyToken, verifyRole('truckOwner'), async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        const { name, description, price, category, status } = req.body;

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

        // Verify item belongs to this truck
        const existingItem = await db('foodtruck.menuitems')
            .where({ itemid: itemId, truckid: truck.truckid })
            .first();

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found or does not belong to your truck'
            });
        }

        // Build update object
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = price;
        if (category !== undefined) updateData.category = category;
        if (status !== undefined) updateData.status = status;

        // Update item
        const [updatedItem] = await db('foodtruck.menuitems')
            .where('itemid', itemId)
            .update(updateData)
            .returning('*');

        res.json({
            success: true,
            message: 'Menu item updated successfully',
            data: {
                itemId: updatedItem.itemid,
                name: updatedItem.name,
                description: updatedItem.description,
                price: parseFloat(updatedItem.price),
                category: updatedItem.category,
                status: updatedItem.status
            }
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        next(error);
    }
});

/**
 * Delete menu item
 * DELETE /api/v1/menuItem/delete/:itemId
 * Role: Truck Owner
 */
router.delete('/delete/:itemId', verifyToken, verifyRole('truckOwner'), async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;

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

        // Verify item belongs to this truck
        const existingItem = await db('foodtruck.menuitems')
            .where({ itemid: itemId, truckid: truck.truckid })
            .first();

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found or does not belong to your truck'
            });
        }

        // Delete item
        await db('foodtruck.menuitems')
            .where('itemid', itemId)
            .delete();

        res.json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        next(error);
    }
});

// ==================== CUSTOMER ROUTES ====================

/**
 * View truck's menu
 * GET /api/v1/menuItem/truck/:truckId
 * Role: Customer
 */
router.get('/truck/:truckId', async (req, res, next) => {
    try {
        const { truckId } = req.params;

        // Verify truck exists
        const truck = await db('foodtruck.trucks')
            .select('truckid', 'truckname', 'truckstatus', 'orderstatus')
            .where('truckid', truckId)
            .first();

        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'Truck not found'
            });
        }

        // Get available menu items
        const menuItems = await db('foodtruck.menuitems')
            .select('*')
            .where('truckid', truckId)
            .orderBy('category')
            .orderBy('name');

        res.json({
            success: true,
            truck: {
                truckId: truck.truckid,
                truckName: truck.truckname,
                truckStatus: truck.truckstatus,
                orderStatus: truck.orderstatus
            },
            count: menuItems.length,
            data: menuItems.map(item => ({
                itemId: item.itemid,
                name: item.name,
                description: item.description,
                price: parseFloat(item.price),
                category: item.category,
                status: item.status,
                isAvailable: item.status === 'available'
            }))
        });
    } catch (error) {
        console.error('Error fetching truck menu:', error);
        next(error);
    }
});

/**
 * Search menu by category
 * GET /api/v1/menuItem/truck/:truckId/category/:category
 * Role: Customer
 */
router.get('/truck/:truckId/category/:category', async (req, res, next) => {
    try {
        const { truckId, category } = req.params;

        // Verify truck exists
        const truck = await db('foodtruck.trucks')
            .select('truckid', 'truckname')
            .where('truckid', truckId)
            .first();

        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'Truck not found'
            });
        }

        // Get menu items by category (case-insensitive)
        const menuItems = await db('foodtruck.menuitems')
            .select('*')
            .where('truckid', truckId)
            .whereRaw('LOWER(category) = LOWER(?)', [category])
            .orderBy('name');

        res.json({
            success: true,
            truck: {
                truckId: truck.truckid,
                truckName: truck.truckname
            },
            category: category,
            count: menuItems.length,
            data: menuItems.map(item => ({
                itemId: item.itemid,
                name: item.name,
                description: item.description,
                price: parseFloat(item.price),
                category: item.category,
                status: item.status,
                isAvailable: item.status === 'available'
            }))
        });
    } catch (error) {
        console.error('Error fetching menu by category:', error);
        next(error);
    }
});

module.exports = router;
