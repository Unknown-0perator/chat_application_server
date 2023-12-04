const jwt = require('jsonwebtoken');
require('dotenv').config();

const { JWT_SECRET } = process.env;

const authorize = (req, res, next) => {
    const authToken = req.headers.authorization;

    if (!authToken) {
        return res.status(401).json({ message: 'No token found' });
    }

    jwt.verify(authToken, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Invalid Token:', err);
            return res.status(403).json({ message: `Invalid Token ${err}` });
        } else {
            req.payload = decoded;
        }
        next();
    });
};

module.exports = authorize;
