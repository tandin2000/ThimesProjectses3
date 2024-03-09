const jwt = require('jsonwebtoken');

// Middleware to validate token (i.e., isAuthenticated)
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Access denied. No token provided.');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).send('Invalid token.');
    }
};

// Middleware to check user role
const checkRole = (roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    
    const { role } = req.user;
    if (!roles.includes(role)) {
        return res.status(403).send('Forbidden');
    }
    
    next();
};

module.exports = { verifyToken, checkRole };
