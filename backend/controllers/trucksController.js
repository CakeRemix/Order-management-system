const db = require('../config/db');

/**
 * Get all food trucks
 * GET /api/trucks
 */
const getAllTrucks = async (req, res, next) => {
  try {
    // Using Knex Query Builder
    const trucks = await db('foodtruck.trucks')
      .select(
        'truckid as id',
        'truckname as name',
        'trucklogo as image_url',
        'ownerid',
        'truckstatus as status',
        'orderstatus',
        'createdat as created_at'
      )
      .orderBy('truckname', 'asc');
    
    res.json({
      success: true,
      count: trucks.length,
      data: trucks
    });
  } catch (error) {
    console.error('Error fetching food trucks:', error);
    next(error);
  }
};

/**
 * Get a single food truck by ID
 * GET /api/trucks/:id
 */
const getTruckById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Using Knex Query Builder
    const truck = await db('foodtruck.trucks')
      .select(
        'truckid as id',
        'truckname as name',
        'trucklogo as image_url',
        'ownerid',
        'truckstatus as status',
        'orderstatus',
        'createdat as created_at'
      )
      .where({ truckid: id })
      .first();
    
    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Food truck not found'
      });
    }
    
    res.json({
      success: true,
      data: truck
    });
  } catch (error) {
    console.error('Error fetching food truck:', error);
    next(error);
  }
};

/**
 * Get a single food truck by name
 * GET /api/trucks/name/:name
 */
const getTruckByName = async (req, res, next) => {
  try {
    const { name } = req.params;
    
    // Using Knex Query Builder
    const truck = await db('foodtruck.trucks')
      .select(
        'truckid as id',
        'truckname as name',
        'trucklogo as image_url',
        'ownerid',
        'truckstatus as status',
        'orderstatus',
        'createdat as created_at'
      )
      .where({ truckname: name })
      .first();
    
    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Food truck not found'
      });
    }
    
    res.json({
      success: true,
      data: truck
    });
  } catch (error) {
    console.error('Error fetching food truck by name:', error);
    next(error);
  }
};

/**
 * Get all menu items for a specific food truck
 * GET /api/trucks/:id/menu
 */
const getMenuItemsByTruckId = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Using Knex Query Builder - First verify the truck exists
    const truck = await db('foodtruck.trucks')
      .select('truckid as id', 'truckname as name', 'truckstatus as status')
      .where({ truckid: id })
      .first();
    
    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Food truck not found'
      });
    }
    
    // Get menu items using Knex Query Builder
    const menuItems = await db('foodtruck.menuitems')
      .select(
        'itemid as id',
        'truckid as food_truck_id',
        'name',
        'description',
        'price',
        'category',
        'status as is_available',
        'createdat as created_at'
      )
      .where({ truckid: id })
      .orderBy(['category', 'name']);
    
    res.json({
      success: true,
      truck: truck,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    next(error);
  }
};

/**
 * Get all menu items for a specific food truck by name
 * GET /api/trucks/name/:name/menu
 */
const getMenuItemsByTruckName = async (req, res, next) => {
  try {
    const { name } = req.params;
    
    // Using Knex Query Builder - First verify the truck exists and get its ID
    const truck = await db('foodtruck.trucks')
      .select('truckid as id', 'truckname as name', 'truckstatus as status')
      .where({ truckname: name })
      .first();
    
    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Food truck not found'
      });
    }
    
    // Get menu items using Knex Query Builder
    const menuItems = await db('foodtruck.menuitems')
      .select(
        'itemid as id',
        'truckid as food_truck_id',
        'name',
        'description',
        'price',
        'category',
        'status as is_available',
        'createdat as created_at'
      )
      .where({ truckid: truck.id })
      .orderBy(['category', 'name']);
    
    res.json({
      success: true,
      truck: truck,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    console.error('Error fetching menu items by truck name:', error);
    next(error);
  }
};

module.exports = {
  getAllTrucks,
  getTruckById,
  getTruckByName,
  getMenuItemsByTruckId,
  getMenuItemsByTruckName
};
