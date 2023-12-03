const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { JWT_SECRET } = process.env;
const User = require('../model/User');

const authorize = (req, res, next) => {
    const authToken = req.headers.authorization;

    if (!authToken) {
        return res.status(401).json({ message: 'No token found' });
    }

    jwt.verify(authToken, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: `Invalid Token ${err}` });
        } else {
            req.payload = decoded;
        }
        next();
    });
};

router.post('/', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(403).json({ token: null, message: 'Invalid username' });
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                console.error(err);
            }

            if (result) {
                const token = jwt.sign({ username: user.username }, JWT_SECRET);

                return res.status(200).json({
                    token,
                    message: 'Logged In',
                    user,
                });
            } else {
                return res.status(403).json({ token: null, message: 'Wrong password.' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/', authorize, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.payload.username });
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(403).send(`Forbidden: ${error}`);
    }
});

module.exports = router;
