const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');

/**
 * User login controller
 * @route POST /api/auth/login
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check if user exists
        const result = await db.query(
            'SELECT id, email, password, name, role FROM users WHERE email = $1',
            [email]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        delete user.password;

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * User registration controller
 * @route POST /api/auth/signup
 */
exports.signup = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Input validation
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Check if user already exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const result = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, 'customer'] // Default role is customer
        );

        const newUser = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
                name: newUser.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user information
 * @route GET /api/auth/me
 */
exports.getCurrentUser = async (req, res, next) => {
    try {
        // User information is attached by auth middleware
        const user = req.user;

        // Get fresh user data from database
        const result = await db.query(
            'SELECT id, name, email, role FROM users WHERE id = $1',
            [user.id]
        );

        if (!result.rows[0]) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};