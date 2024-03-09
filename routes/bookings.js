const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const router = express.Router();

// Book a room (Example route)
router.post('/', verifyToken, async (req, res) => {
    const { room, resources, startTime, endTime, user } = req.body;

    // Check for overlap
    const overlap = await Booking.findOne({
        room,
        $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Overlaps existing booking
        ]
    });

    if (overlap) {
        return res.status(400).send('Room is already booked for the specified time range.');
    }

    // Proceed with booking
    const booking = new Booking({
        room,
        resources,
        startTime,
        endTime,
        user
    });

    try {
        await booking.save();
        res.send(booking);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
