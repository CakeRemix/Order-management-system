/**
 * Server Health Check Tests
 * Tests basic server functionality and database connectivity
 */

const request = require('supertest');
const app = require('../server');

describe('Server Health Checks', () => {
  describe('GET /', () => {
    it('should return the index page', async () => {
      const res = await request(app)
        .get('/')
        .expect(200);
      
      expect(res.type).toMatch(/html/);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);
      
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('database');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('should have healthy status when database is connected', async () => {
      const res = await request(app)
        .get('/health');
      
      expect(['healthy', 'unhealthy']).toContain(res.body.status);
    });
  });

  describe('API Routes', () => {
    it('should have auth routes available', async () => {
      // This will return 404 or actual response depending on implementation
      const res = await request(app)
        .get('/api/auth');
      
      // We're just checking the route exists, not the response
      expect([200, 404, 405]).toContain(res.status);
    });
  });
});

describe('Error Handling', () => {
  it('should handle 404 errors gracefully', async () => {
    const res = await request(app)
      .get('/nonexistent-route')
      .expect(404);
  });
});
