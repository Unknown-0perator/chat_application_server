const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../model/User');

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

        res.status(201).json({ 'success': `New user '${username}' created` });

    } catch (err) {
        res.status(500).json({ 'error': `Internal Server Error: ${err.message}` });
    }
});

module.exports = router;
