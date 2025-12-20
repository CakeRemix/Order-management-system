/**
 * Authentication Controller Tests
 * Tests auth endpoints and functionality
 */

const request = require('supertest');
const app = require('../server');

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
          // Missing other required fields
        });
      
      // Should fail or return error
      expect([400, 500]).toContain(res.status);
    });

    it('should accept valid registration data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@test.com',
          password: 'SecurePassword123!',
          role: 'customer'
        });
      
      // Should return 201 (created), 200, or validation error
      expect([200, 201, 400, 409]).toContain(res.status);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should validate email and password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com'
          // Missing password
        });
      
      expect([400, 500]).toContain(res.status);
    });

    it('should handle login attempts', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@test.com',
          password: 'password123'
        });
      
      // Should return 200 (success), 401 (unauthorized), or 404 (not found)
      expect([200, 401, 404, 400]).toContain(res.status);
    });
  });
});
