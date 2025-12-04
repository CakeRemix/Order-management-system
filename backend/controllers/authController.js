const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const UserModel = require('../models/userModel');

// Allowed GIU email domains
const ALLOWED_DOMAINS = ['@student.giu-uni.de', '@giu-uni.de', '@giu.edu.eg'];

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.userid, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '24h' }
  );
};

// Validate GIU email
const isGIUEmail = (email) => {
  const emailDomain = email.substring(email.lastIndexOf('@')).toLowerCase();
  return ALLOWED_DOMAINS.some(domain => emailDomain === domain.toLowerCase());
};

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

        // Check if user exists - Using Knex Query Builder with FoodTruck schema
        const user = await db('foodtruck.users')
            .select('userid', 'email', 'password', 'name', 'role')
            .where({ email })
            .first();

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
                id: user.userid,
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
                id: user.userid,
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
        const { name, email, password, confirmPassword, role, birthDate } = req.body;
        
        console.log('Signup request body:', { name, email, role, birthDate });

        // Input validation
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if email is from GIU
        if (!isGIUEmail(email)) {
            return res.status(403).json({
                success: false,
                message: 'Only GIU students and staff can register. Please use your GIU email address.'
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers'
            });
        }

        // Check if user already exists - Using Knex Query Builder with FoodTruck schema
        const existingUser = await db('foodtruck.users')
            .select('userid')
            .where({ email })
            .first();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user - default role is customer - Using Knex Query Builder with FoodTruck schema
        const [newUser] = await db('foodtruck.users')
            .insert({
                name,
                email,
                password: hashedPassword,
                role: role || 'customer',
                birthdate: birthDate || null,
                createdat: db.raw('NOW()')
            })
            .returning(['userid', 'name', 'email', 'role']);

        // Generate JWT token
        const token = generateToken(newUser);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.userid,
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

        // Get fresh user data from database - Using Knex Query Builder with FoodTruck schema
        const userData = await db('foodtruck.users')
            .select('userid', 'name', 'email', 'role')
            .where({ userid: user.id })
            .first();

        if (!userData) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: userData.userid,
                name: userData.name,
                email: userData.email,
                role: userData.role
            }
        });
    } catch (error) {
        next(error);
    }
};