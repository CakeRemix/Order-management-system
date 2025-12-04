const db = require('../config/db');
const bcrypt = require('bcrypt');

class UserModel {
  // Create a new user
  static async create({ name, email, password, role = 'customer', birthDate = null }) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await db('foodtruck.users')
      .insert({
        name: name || email.split('@')[0], // Use email prefix if name not provided
        email,
        password: hashedPassword,
        role,
        birthdate: birthDate,
        createdat: db.raw('NOW()')
      })
      .returning(['userid', 'name', 'email', 'role', 'createdat']);
    
    return result;
  }

  // Find user by email
  static async findByEmail(email) {
    const result = await db('foodtruck.users')
      .select('*')
      .where('email', email)
      .first();
    return result;
  }

  // Find user by ID
  static async findById(id) {
    const result = await db('foodtruck.users')
      .select('userid', 'name', 'email', 'role', 'birthdate', 'createdat')
      .where('userid', id)
      .first();
    return result;
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user
  static async update(id, updates) {
    const { name, email, role } = updates;
    
    const [result] = await db('foodtruck.users')
      .where('userid', id)
      .update({
        name: name || db.raw('name'),
        email: email || db.raw('email'),
        role: role || db.raw('role')
      })
      .returning(['userid', 'name', 'email', 'role', 'createdat']);
    
    return result;
  }

  // Delete user
  static async delete(id) {
    const [result] = await db('foodtruck.users')
      .where('userid', id)
      .del()
      .returning('userid');
    
    return result;
  }

  // Get user's truck (for truckOwner role)
  static async getUserTruck(userId) {
    const result = await db('foodtruck.trucks')
      .select('*')
      .where('ownerid', userId)
      .first();
    return result;
  }
}

module.exports = UserModel;
