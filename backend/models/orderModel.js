const db = require('../config/db');

class OrderModel {
  /**
   * Get order by ID with all details
   * @param {number} orderId
   * @returns {Promise<Object>} Order with items
   */
  static async findById(orderId) {
    const query = `
      SELECT 
        o.id,
        o.customer_id,
        o.food_truck_id,
        o.order_number,
        o.status,
        o.subtotal,
        o.tax,
        o.total,
        o.pickup_time,
        o.estimated_prep_time,
        o.actual_completion_time,
        o.notes,
        o.payment_method,
        o.created_at,
        o.updated_at,
        ft.name as truck_name,
        ft.location as truck_location
      FROM orders o
      LEFT JOIN food_trucks ft ON o.food_truck_id = ft.id
      WHERE o.id = $1
    `;
    
    const result = await db.query(query, [orderId]);
    return result.rows[0];
  }

  /**
   * Get order status only (lightweight query)
   * Used for frequent polling
   * @param {number} orderId
   * @returns {Promise<Object>} { status, updated_at }
   */
  static async getStatus(orderId) {
    const query = `
      SELECT 
        id,
        status,
        estimated_prep_time,
        actual_completion_time,
        updated_at
      FROM orders
      WHERE id = $1
    `;
    
    const result = await db.query(query, [orderId]);
    return result.rows[0];
  }

  /**
   * Get order status with progress info
   * @param {number} orderId
   * @returns {Promise<Object>} Status with completion percentage
   */
  static async getStatusWithProgress(orderId) {
    const query = `
      SELECT 
        id,
        status,
        created_at,
        estimated_prep_time,
        actual_completion_time,
        updated_at,
        CASE 
          WHEN status = 'completed' THEN 100
          WHEN status = 'cancelled' THEN 0
          WHEN status = 'ready' THEN 90
          WHEN status = 'preparing' THEN 50
          ELSE 10
        END as progress_percent,
        EXTRACT(EPOCH FROM (NOW() - created_at)) / 60 as elapsed_minutes
      FROM orders
      WHERE id = $1
    `;
    
    const result = await db.query(query, [orderId]);
    return result.rows[0];
  }

  /**
   * Get multiple orders status (batch query)
   * @param {number[]} orderIds
   * @returns {Promise<Object[]>} Array of orders
   */
  static async getStatusBatch(orderIds) {
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return [];
    }

    const placeholders = orderIds.map((_, i) => `$${i + 1}`).join(',');
    const query = `
      SELECT 
        id,
        status,
        estimated_prep_time,
        actual_completion_time,
        updated_at
      FROM orders
      WHERE id = ANY(ARRAY[${placeholders}]::int[])
      ORDER BY id
    `;
    
    const result = await db.query(query, orderIds);
    return result.rows;
  }

  /**
   * Get orders by customer ID
   * @param {number} customerId
   * @param {Object} options - { limit, offset, status }
   * @returns {Promise<Object[]>} Orders
   */
  static async getByCustomerId(customerId, options = {}) {
    const { limit = 50, offset = 0, status = null } = options;
    
    let query = `
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.total,
        o.created_at,
        o.updated_at,
        ft.name as truck_name
      FROM orders o
      LEFT JOIN food_trucks ft ON o.food_truck_id = ft.id
      WHERE o.customer_id = $1
    `;

    const params = [customerId];
    
    if (status) {
      query += ` AND o.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Create a new order
   * @param {Object} orderData
   * @returns {Promise<Object>} Created order
   */
  static async create(orderData) {
    const {
      customer_id,
      food_truck_id,
      order_number,
      subtotal,
      tax,
      total,
      pickup_time,
      estimated_prep_time,
      notes,
      payment_method
    } = orderData;

    const query = `
      INSERT INTO orders (
        customer_id,
        food_truck_id,
        order_number,
        status,
        subtotal,
        tax,
        total,
        pickup_time,
        estimated_prep_time,
        notes,
        payment_method,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, 'received', $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *
    `;

    const result = await db.query(query, [
      customer_id,
      food_truck_id,
      order_number,
      subtotal,
      tax,
      total,
      pickup_time,
      estimated_prep_time,
      notes,
      payment_method
    ]);

    return result.rows[0];
  }

  /**
   * Update order status
   * @param {number} orderId
   * @param {string} newStatus
   * @returns {Promise<Object>} Updated order
   */
  static async updateStatus(orderId, newStatus) {
    const validStatuses = ['received', 'preparing', 'ready', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const query = `
      UPDATE orders
      SET 
        status = $1,
        actual_completion_time = CASE 
          WHEN $1 IN ('completed', 'cancelled') THEN NOW()
          ELSE actual_completion_time
        END,
        updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [newStatus, orderId]);
    return result.rows[0];
  }

  /**
   * Get recent order updates for a customer
   * Used to detect changes for polling
   * @param {number} customerId
   * @param {Date} since
   * @returns {Promise<Object[]>} Recent updates
   */
  static async getRecentUpdates(customerId, since) {
    const query = `
      SELECT 
        id,
        status,
        updated_at
      FROM orders
      WHERE customer_id = $1 AND updated_at > $2
      ORDER BY updated_at DESC
    `;

    const result = await db.query(query, [customerId, since]);
    return result.rows;
  }
}

module.exports = OrderModel;
