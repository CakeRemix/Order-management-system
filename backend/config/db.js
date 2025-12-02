const knex = require('knex');
require('dotenv').config();

// Knex configuration for PostgreSQL
const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'giu_food_truck',
  },
  searchPath: ['foodtruck', 'public'],
  pool: {
    min: 2,
    max: 20,
    afterCreate: function(connection, callback) {
      connection.query('SET search_path TO foodtruck, public;', function(err) {
        callback(err, connection);
      });
    }
  },
  acquireConnectionTimeout: 10000,
});

// Test database connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Connected to PostgreSQL database via Knex');
  })
  .catch((err) => {
    console.error('❌ Failed to connect to database:');
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    console.error('Full error:', err);
  });

module.exports = db;
