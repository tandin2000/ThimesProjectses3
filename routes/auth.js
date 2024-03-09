const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../logger');


const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        let user = await User.findOne({ username });
        if (user){
            logger.info('User already exists');
            return res.status(400).send('User already exists');
        } 


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            password: hashedPassword,
            role
        });

        await user.save();

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.header('Authorization', token).send({ message: "User registered successfully", token });
    } catch (err) {
        res.status(500).send('Server Error');
        logger.error(err.message);
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            logger.info('Invalid credentials');
            return res.status(400).send('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            logger.info('Invalid credentials');
            return res.status(400).send('Invalid credentials');
        } 


        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.header('Authorization', token).send({ message: "Logged in successfully", token });
    } catch (err) {
        res.status(500).send('Server Error');
        logger.error(err.message);

    }
});

module.exports = router;
