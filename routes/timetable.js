const express = require('express');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const Timetable = require('../models/Timetable');

const Notification = require("../models/Notification");

const router = express.Router();

// Add a class session to the timetable (Admin and Faculty only)
router.post('/', [verifyToken, checkRole(['Admin', 'Faculty'])], async (req, res) => {
    const { course, time, faculty, location } = req.body;

    try {
        let session = new Timetable({
            course,
            time,
            faculty,
            location
        });

        const newNotification = new Notification({
            user: faculty,
            message: `A new timetable has been added ${course}.`,
            status: 'Unread'
        });
        await newNotification.save();

        await session.save();
        res.send(session);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// Update a class session in the timetable (Admin and Faculty only)
router.put('/:id', [verifyToken, checkRole(['Admin', 'Faculty'])], async (req, res) => {
    try {
        let session = await Timetable.findById(req.params.id);
        if (!session) return res.status(404).send('Session not found');

        session = await Timetable.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });

        const newNotification = new Notification({
            user: session.faculty,
            message: `timetable has been update -  ${session.course}.`,
            status: 'Unread'
        });
        await newNotification.save();

        res.send(session);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// Delete a class session from the timetable (Admin and Faculty only)
router.delete('/:id', [verifyToken, checkRole(['Admin', 'Faculty'])], async (req, res) => {
    try {
        const session = await Timetable.findById(req.params.id);
        if (!session) return res.status(404).send('Session not found');

        const newNotification = new Notification({
            user: session.faculty,
            message: `timetable has been deleted -  ${session.course}.`,
            status: 'Unread'
        });
        await newNotification.save();


        await session.remove();
        res.send({ message: 'Session deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// Get the timetable (All authenticated users)
router.get('/', verifyToken, async (req, res) => {
    try {
        const sessions = await Timetable.find().populate('course faculty', 'name username');
        res.send(sessions);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
