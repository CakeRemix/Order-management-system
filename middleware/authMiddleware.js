const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token
 * Extracts and validates the token from the Authorization header
 */
const verifyToken = (req, res, next) => {
    try {
        // Get token from Authorization header (format: "Bearer <token>")
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: 'Access denied. No token provided.' 
            });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user info to request object
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name
        };
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expired. Please login again.' 
            });
        }
        
        return res.status(401).json({ 
            success: false,
            message: 'Invalid token.' 
        });
    }
};

/**
 * Middleware to verify user role
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated.' 
            });
        }

        // Check if user's role is in the allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}`,
                userRole: req.user.role,
                requiredRoles: allowedRoles
            });
        }

        next();
    };
};

/**
 * Middleware to verify if user owns the resource or is admin
 * Useful for operations where users can only modify their own data
 */
const verifyOwnerOrAdmin = (userIdField = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated.' 
            });
        }

        const resourceUserId = req.params[userIdField] || req.body[userIdField];
        
        // Allow if user is admin or owns the resource
        if (req.user.role === 'admin' || req.user.id === parseInt(resourceUserId)) {
            next();
        } else {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied. You can only access your own resources.' 
            });
        }
    };
};

/**
 * Middleware specifically for customer-only routes
 */
const customerOnly = verifyRole('customer');

/**
 * Middleware specifically for vendor-only routes
 */
const vendorOnly = verifyRole('vendor');

/**
 * Middleware specifically for admin-only routes
 */
const adminOnly = verifyRole('admin');

/**
 * Middleware for routes accessible by customers and admins
 */
const customerOrAdmin = verifyRole('customer', 'admin');

/**
 * Middleware for routes accessible by vendors and admins
 */
const vendorOrAdmin = verifyRole('vendor', 'admin');

module.exports = {
    verifyToken,
    verifyRole,
    verifyOwnerOrAdmin,
    customerOnly,
    vendorOnly,
    adminOnly,
    customerOrAdmin,
    vendorOrAdmin
};
