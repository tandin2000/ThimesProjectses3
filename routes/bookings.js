const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const router = express.Router();
const Notification = require("../models/Notification");

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

        const affectedUser = booking.user.toString();
        if (affectedUser) {
            const notifications = {
                user: affectedUser,
                message: `New booking logged`,
                }
            await Notification.insertMany(notifications);
        }

        res.send(booking);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// Get all bookings
router.get('/', verifyToken, async (req, res) => {
    try {
        const bookings = await Booking.find().populate('room resources user', 'name name username');
        res.json(bookings);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// Get a single booking by ID (Authenticated users)
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const bookings = await Booking.findById(req.params.id).populate('room resources user', 'name name username');
        if (!bookings) return res.status(404).send('Bookings not found');

        res.send(bookings);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// Delete a booking by ID
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('room', 'name');

        if (!booking) {
            return res.status(404).send('Booking not found');
        }
        // Assuming req.user is populated by the verifyToken middleware
        // and it includes the user's id and isAdmin flag
        if (booking.user.toString() === req.user._id || req.user.role === "Admin") {
            await Booking.findByIdAndDelete(req.params.id);
            const affectedUser = booking.user.toString();
            console.log(booking.room.name)
            if (affectedUser) {
                const notifications = {
                    user: affectedUser,
                    message: `The Booking canceled for  ${booking.room.name}.`,
                    }
                await Notification.insertMany(notifications);
            }
            res.send('Booking deleted successfully');
        }else{
            return res.status(401).send('Unauthorized: Cannot delete another user\'s booking unless admin');
        }

       
    } catch (error) {
        console.error(error.message);

        if (error.kind === 'ObjectId') {
            return res.status(404).send('Booking not found');
        }

        res.status(500).send('Server error');
    }
});


module.exports = router;
