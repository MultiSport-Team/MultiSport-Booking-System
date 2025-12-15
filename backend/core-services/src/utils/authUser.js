const jwt = require('jsonwebtoken');
const config = require('./config');
const { createResult } = require('./result');

const generateToken = (payload) => {
    return jwt.sign(payload, config.secret, { expiresIn: '24h' });
};

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json(createResult('Access denied. No token provided.', null));
    }

    try {
        const decoded = jwt.verify(token, config.secret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json(createResult('Invalid token.', null));
    }
};

module.exports = { generateToken, verifyToken };