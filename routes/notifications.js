const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

const router = express.Router();

// Fetch notifications for the logged-in user
router.get('/', verifyToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.send(notifications);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// Mark a notification as read
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, { status: 'Read' }, { new: true });
        res.send(notification);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
