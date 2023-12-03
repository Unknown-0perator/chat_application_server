const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../model/User');
const authorize = require('../controllers/authorize');
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env;

router.post('/login', async (req, res) => {
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

router.post('/sign-up', async (req, res) => {
    const { username, password, full_name } = req.body;

    if (!username || !password || !full_name) {
        return res.status(400).json({ 'error': "Username, password, and full name are required fields" });
    }

    try {
        const duplicate = await User.findOne({ username }).exec();
        if (duplicate) {
            return res.status(409).json({ 'error': 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            password: hashedPassword,
            fullName: full_name
        });

        const token = jwt.sign({ username: newUser.username }, process.env.JWT_SECRET);

        res.status(201).json({
            'success': `New user '${username}' created`,
            'token': token,
            'user': newUser
        });


    } catch (err) {
        res.status(500).json({ 'error': `Internal Server Error: ${err.message}` });
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


router.get('/all', authorize, async (req, res) => {
    try {
        const loggedInUser = req.payload.username;
        const users = await User.find({ username: { $ne: loggedInUser } });
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/search', authorize, async (req, res) => {
    try {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({ message: 'Username parameter is required for search' });
        }

        const users = await User.find({
            username: { $regex: new RegExp(username, 'i') },
            username: { $ne: req.payload.username }
        });

        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = router;
