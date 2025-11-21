const db = require('../config/db');

/**
 * Get all food trucks
 * GET /api/trucks
 */
const getAllTrucks = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        id,
        name,
        description,
        location,
        image_url,
        status,
        is_busy,
        prep_time_minutes,
        operating_hours,
        is_active,
        created_at,
        updated_at
      FROM food_trucks
      WHERE is_active = TRUE
      ORDER BY name ASC
    `;
    
    const result = await db.query(query);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
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
    
    const query = `
      SELECT 
        id,
        name,
        description,
        location,
        image_url,
        status,
        is_busy,
        prep_time_minutes,
        operating_hours,
        is_active,
        created_at,
        updated_at
      FROM food_trucks
      WHERE id = $1 AND is_active = TRUE
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Food truck not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
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
    
    const query = `
      SELECT 
        id,
        name,
        description,
        location,
        image_url,
        status,
        is_busy,
        prep_time_minutes,
        operating_hours,
        is_active,
        created_at,
        updated_at
      FROM food_trucks
      WHERE name = $1 AND is_active = TRUE
    `;
    
    const result = await db.query(query, [name]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Food truck not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
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
    
    // First verify the truck exists
    const truckQuery = 'SELECT id, name, status FROM food_trucks WHERE id = $1 AND is_active = TRUE';
    const truckResult = await db.query(truckQuery, [id]);
    
    if (truckResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Food truck not found'
      });
    }
    
    const truck = truckResult.rows[0];
    
    // Get menu items
    const menuQuery = `
      SELECT 
        id,
        food_truck_id,
        name,
        description,
        price,
        image_url,
        category,
        prep_time_minutes,
        is_available,
        stock_quantity,
        calories,
        allergens,
        created_at,
        updated_at
      FROM menu_items
      WHERE food_truck_id = $1 AND is_active = TRUE
      ORDER BY category ASC, name ASC
    `;
    
    const menuResult = await db.query(menuQuery, [id]);
    
    res.json({
      success: true,
      truck: truck,
      count: menuResult.rows.length,
      data: menuResult.rows
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
    
    // First verify the truck exists and get its ID
    const truckQuery = 'SELECT id, name, status, description FROM food_trucks WHERE name = $1 AND is_active = TRUE';
    const truckResult = await db.query(truckQuery, [name]);
    
    if (truckResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Food truck not found'
      });
    }
    
    const truck = truckResult.rows[0];
    
    // Get menu items
    const menuQuery = `
      SELECT 
        id,
        food_truck_id,
        name,
        description,
        price,
        image_url,
        category,
        prep_time_minutes,
        is_available,
        stock_quantity,
        calories,
        allergens,
        created_at,
        updated_at
      FROM menu_items
      WHERE food_truck_id = $1 AND is_active = TRUE
      ORDER BY category ASC, name ASC
    `;
    
    const menuResult = await db.query(menuQuery, [truck.id]);
    
    res.json({
      success: true,
      truck: truck,
      count: menuResult.rows.length,
      data: menuResult.rows
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
