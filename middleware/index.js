const { 
    verifyToken, 
    verifyRole, 
    verifyOwnerOrAdmin,
    customerOnly,
    vendorOnly,
    adminOnly,
    customerOrAdmin,
    vendorOrAdmin
} = require('./authMiddleware');
const errorHandler = require('./errorHandler');

module.exports = {
    verifyToken,
    verifyRole,
    verifyOwnerOrAdmin,
    customerOnly,
    vendorOnly,
    adminOnly,
    customerOrAdmin,
    vendorOrAdmin,
    errorHandler
};
