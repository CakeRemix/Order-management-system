const db = require('../config/db');
const bcrypt = require('bcrypt');

class UserModel {
  // Create a new user
  static async create({ email, password, role = 'customer' }) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (email, password, role, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id, email, role, created_at
    `;

    const result = await db.query(query, [email, hashedPassword, role]);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT id, email, role, created_at, updated_at FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user
  static async update(id, updates) {
    const { email, role } = updates;
    const query = `
      UPDATE users 
      SET email = COALESCE($1, email),
          role = COALESCE($2, role),
          updated_at = NOW()
      WHERE id = $3
      RETURNING id, email, role, updated_at
    `;

    const result = await db.query(query, [email, role, id]);
    return result.rows[0];
  }

  // Delete user
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = UserModel;
