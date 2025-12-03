const db = require('../config/db');

/**
 * Get vendor's own truck
 * GET /api/vendor/my-truck
 */
const getMyTruck = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // Find truck owned by this user
        const truck = await db('foodtruck.trucks')
            .select('truckid', 'truckname', 'truckstatus', 'orderstatus', 'createdat')
            .where({ ownerid: userId })
            .first();
        
        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'No truck found for this vendor'
            });
        }
        
        res.json({
            success: true,
            truck: truck
        });
    } catch (error) {
        console.error('Error fetching vendor truck:', error);
        next(error);
    }
};

/**
 * Get menu items for vendor's truck
 * GET /api/vendor/my-truck/menu
 */
const getMyMenuItems = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // First get the truck
        const truck = await db('foodtruck.trucks')
            .select('truckid')
            .where({ ownerid: userId })
            .first();
        
        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'No truck found for this vendor'
            });
        }
        
        // Get menu items for this truck
        const menuItems = await db('foodtruck.menuitems')
            .select('itemid', 'name', 'price', 'description', 'category', 'status', 'createdat')
            .where({ truckid: truck.truckid })
            .orderBy('createdat', 'desc');
        
        // Map status to isavailable for frontend compatibility
        const items = menuItems.map(item => ({
            ...item,
            isavailable: item.status === 'available'
        }));
        
        res.json({
            success: true,
            count: items.length,
            menuItems: items
        });
    } catch (error) {
        console.error('Error fetching menu items:', error);
        next(error);
    }
};

/**
 * Add menu item to vendor's truck
 * POST /api/vendor/my-truck/menu
 */
const addMenuItem = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, description, price, isavailable } = req.body;
        
        // Validation
        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: 'Name and price are required'
            });
        }
        
        if (price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a positive number'
            });
        }
        
        // Get vendor's truck
        const truck = await db('foodtruck.trucks')
            .select('truckid')
            .where({ ownerid: userId })
            .first();
        
        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'No truck found for this vendor'
            });
        }
        
        // Insert menu item
        const status = isavailable !== false ? 'available' : 'unavailable';
        const [newItem] = await db('foodtruck.menuitems')
            .insert({
                truckid: truck.truckid,
                name: name,
                description: description || null,
                price: price,
                category: 'main',
                status: status
            })
            .returning(['itemid', 'name', 'price', 'description', 'category', 'status', 'createdat']);
        
        res.status(201).json({
            success: true,
            message: 'Menu item added successfully',
            menuItem: {
                ...newItem,
                isavailable: newItem.status === 'available'
            }
        });
    } catch (error) {
        console.error('Error adding menu item:', error);
        next(error);
    }
};

/**
 * Update menu item
 * PATCH /api/vendor/my-truck/menu/:itemId
 */
const updateMenuItem = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        const updates = req.body;
        
        // Get vendor's truck
        const truck = await db('foodtruck.trucks')
            .select('truckid')
            .where({ ownerid: userId })
            .first();
        
        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'No truck found for this vendor'
            });
        }
        
        // Verify the menu item belongs to this truck
        const item = await db('foodtruck.menuitems')
            .select('itemid')
            .where({ itemid: itemId, truckid: truck.truckid })
            .first();
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found or does not belong to your truck'
            });
        }
        
        // Convert isavailable to status if present
        const updateData = { ...updates };
        if ('isavailable' in updates) {
            updateData.status = updates.isavailable ? 'available' : 'unavailable';
            delete updateData.isavailable;
        }
        
        // Update the item
        const [updatedItem] = await db('foodtruck.menuitems')
            .where({ itemid: itemId })
            .update(updateData)
            .returning(['itemid', 'name', 'price', 'description', 'category', 'status']);
        
        res.json({
            success: true,
            message: 'Menu item updated successfully',
            menuItem: {
                ...updatedItem,
                isavailable: updatedItem.status === 'available'
            }
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        next(error);
    }
};

/**
 * Delete menu item
 * DELETE /api/vendor/my-truck/menu/:itemId
 */
const deleteMenuItem = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        
        // Get vendor's truck
        const truck = await db('foodtruck.trucks')
            .select('truckid')
            .where({ ownerid: userId })
            .first();
        
        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'No truck found for this vendor'
            });
        }
        
        // Verify the menu item belongs to this truck
        const item = await db('foodtruck.menuitems')
            .select('itemid')
            .where({ itemid: itemId, truckid: truck.truckid })
            .first();
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found or does not belong to your truck'
            });
        }
        
        // Delete the item
        await db('foodtruck.menuitems')
            .where({ itemid: itemId })
            .delete();
        
        res.json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        next(error);
    }
};

/**
 * Get orders for vendor's truck
 * GET /api/vendor/my-truck/orders
 */
const getMyOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // Get vendor's truck
        const truck = await db('foodtruck.trucks')
            .select('truckid')
            .where({ ownerid: userId })
            .first();
        
        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'No truck found for this vendor'
            });
        }
        
        // Get orders for this truck
        const orders = await db('foodtruck.orders')
            .select('orderid', 'userid', 'orderstatus', 'totalprice', 'scheduledpickuptime', 'createdat')
            .where({ truckid: truck.truckid })
            .orderBy('createdat', 'desc');
        
        res.json({
            success: true,
            count: orders.length,
            orders: orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        next(error);
    }
};

/**
 * Update truck info
 * PUT /api/vendor/my-truck
 */
const updateMyTruck = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { truckname, description } = req.body;
        
        // Get vendor's truck
        const truck = await db('foodtruck.trucks')
            .select('truckid')
            .where({ ownerid: userId })
            .first();
        
        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'No truck found for this vendor'
            });
        }
        
        // Update truck
        const updateData = {};
        if (truckname) updateData.truckname = truckname;
        if (description !== undefined) updateData.description = description;
        
        await db('foodtruck.trucks')
            .where({ truckid: truck.truckid })
            .update(updateData);
        
        res.json({
            success: true,
            message: 'Truck updated successfully'
        });
    } catch (error) {
        console.error('Error updating truck:', error);
        next(error);
    }
};

/**
 * Toggle busy mode
 * PUT /api/vendor/my-truck/busy-mode
 */
const toggleBusyMode = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { busy } = req.body;
        
        // Get vendor's truck
        const truck = await db('foodtruck.trucks')
            .select('truckid')
            .where({ ownerid: userId })
            .first();
        
        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'No truck found for this vendor'
            });
        }
        
        // Update truck status based on busy mode
        const newStatus = busy ? 'unavailable' : 'available';
        
        await db('foodtruck.trucks')
            .where({ truckid: truck.truckid })
            .update({ truckstatus: newStatus });
        
        res.json({
            success: true,
            message: `Busy mode ${busy ? 'enabled' : 'disabled'}`,
            status: newStatus
        });
    } catch (error) {
        console.error('Error toggling busy mode:', error);
        next(error);
    }
};

module.exports = {
    getMyTruck,
    getMyMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMyOrders,
    updateMyTruck,
    toggleBusyMode
};
