const express = require('express');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const Timetable = require('../models/Timetable');
const router = express.Router();

// Add a class session to the timetable (Admin and Faculty only)
router.post('/', [verifyToken, checkRole(['Admin', 'Faculty'])], async (req, res) => {
    const { course, time, faculty, location } = req.body;

    try {
        // Make sure that `time` is a valid date string
        const parsedTime = new Date(time);  //ISO 8601 format
        if (isNaN(parsedTime.getTime())) {
            return res.status(400).send('Invalid time format');
        }

        let session = new Timetable({
            course,
            time: parsedTime,
            faculty,
            location
        });

        await session.save();
        res.send(session);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// Update a class session in the timetable (Admin and Faculty only)
router.put('/:id', [verifyToken, checkRole(['Admin', 'Faculty'])], async (req, res) => {
    const { time } = req.body;

    if (time) {
        const parsedTime = new Date(time);
        if (isNaN(parsedTime.getTime())) {
            return res.status(400).send('Invalid time format');
        }
        req.body.time = parsedTime; // Update the time field in the request body to be the parsed Date object
    }
    
    try {
        let session = await Timetable.findById(req.params.id);
        if (!session) return res.status(404).send('class not found');

        session = await Timetable.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.send(session);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// Delete a class session from the timetable (Admin and Faculty only)
router.delete('/:id', [verifyToken, checkRole(['Admin', 'Faculty'])], async (req, res) => {
    try {
        const session = await Timetable.findByIdAndDelete(req.params.id);
        if (!session) return res.status(404).send('class not found');
        res.send({ message: 'class deleted successfully' });
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
