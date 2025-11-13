#!/usr/bin/env node

/**
 * Database Connection Test
 * Tests the connection to PostgreSQL database
 */

require('dotenv').config();
const { Pool } = require('pg');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    header: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}\n`)
};

// Database configuration
const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'giu_food_truck_db',
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

async function testDatabase() {
    log.header('🔍 Database Connection Test');

    // Check if .env exists
    const fs = require('fs');
    if (!fs.existsSync('.env')) {
        log.warn('.env file not found! Copy .env.example to .env');
    }

    // Display configuration
    console.log('Configuration:');
    console.log(`  Host:     ${config.host}`);
    console.log(`  Port:     ${config.port}`);
    console.log(`  User:     ${config.user}`);
    console.log(`  Database: ${config.database}`);
    console.log();

    if (!config.password) {
        log.error('DB_PASSWORD not set in .env file!');
        process.exit(1);
    }

    const pool = new Pool(config);

    try {
        // Test 1: Basic connection
        log.info('Testing database connection...');
        const client = await pool.connect();
        log.success('Successfully connected to PostgreSQL');
        client.release();

        // Test 2: Check database exists
        log.info('Checking database...');
        const dbResult = await pool.query(
            'SELECT current_database() as db, current_user as user, version()'
        );
        log.success(`Connected to database: ${dbResult.rows[0].db}`);
        log.success(`Connected as user: ${dbResult.rows[0].user}`);

        // Test 3: Check tables exist
        log.info('Checking tables...');
        const tablesResult = await pool.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename
        `);

        const expectedTables = ['users', 'food_trucks', 'menu_items', 'orders', 'order_items'];
        const existingTables = tablesResult.rows.map(r => r.tablename);

        expectedTables.forEach(table => {
            if (existingTables.includes(table)) {
                log.success(`Table '${table}' exists`);
            } else {
                log.error(`Table '${table}' NOT FOUND!`);
            }
        });

        // Test 4: Check data
        log.info('Checking data...');
        const counts = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as users,
                (SELECT COUNT(*) FROM food_trucks) as trucks,
                (SELECT COUNT(*) FROM menu_items) as items,
                (SELECT COUNT(*) FROM orders) as orders
        `);

        const data = counts.rows[0];
        console.log();
        console.log('Record counts:');
        console.log(`  Users:       ${data.users}`);
        console.log(`  Food Trucks: ${data.trucks}`);
        console.log(`  Menu Items:  ${data.items}`);
        console.log(`  Orders:      ${data.orders}`);

        if (parseInt(data.users) === 0) {
            log.warn('No users found. Run seed scripts to populate database.');
        } else {
            log.success('Database contains data');
        }

        // Test 5: Check views and functions
        log.info('Checking views and functions...');
        
        const viewsResult = await pool.query(`
            SELECT viewname 
            FROM pg_views 
            WHERE schemaname = 'public'
        `);
        log.success(`Found ${viewsResult.rows.length} views`);

        const functionsResult = await pool.query(`
            SELECT proname 
            FROM pg_proc 
            WHERE pronamespace = 'public'::regnamespace
        `);
        log.success(`Found ${functionsResult.rows.length} functions`);

        // Test 6: Test a query
        log.info('Testing sample query...');
        const testQuery = await pool.query(`
            SELECT 
                ft.name AS truck,
                COUNT(mi.id) AS menu_items
            FROM food_trucks ft
            LEFT JOIN menu_items mi ON ft.id = mi.food_truck_id
            GROUP BY ft.id, ft.name
            LIMIT 3
        `);

        if (testQuery.rows.length > 0) {
            log.success('Sample query executed successfully');
            console.log();
            console.log('Sample data:');
            testQuery.rows.forEach(row => {
                console.log(`  ${row.truck}: ${row.menu_items} items`);
            });
        }

        log.header('✅ All tests passed! Database is ready.');
        
        // Show next steps
        console.log('Next steps:');
        console.log('  1. Start the server: npm start');
        console.log('  2. Test API: http://localhost:5000/health');
        console.log('  3. Open app: http://localhost:5000');
        console.log();

    } catch (error) {
        log.error(`Test failed: ${error.message}`);
        console.error(error);
        
        // Provide helpful error messages
        if (error.code === 'ECONNREFUSED') {
            log.warn('PostgreSQL server is not running or not accessible');
            log.info('Try: Start PostgreSQL service in Windows Services');
        } else if (error.code === '28P01') {
            log.warn('Invalid password');
            log.info('Check DB_PASSWORD in .env file');
        } else if (error.code === '3D000') {
            log.warn('Database does not exist');
            log.info('Run: cd database && .\\setup.ps1');
        }
        
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run the test
testDatabase();
