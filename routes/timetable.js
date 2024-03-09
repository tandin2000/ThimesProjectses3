const express = require('express');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const Timetable = require('../models/Timetable');
const router = express.Router();
const Notification = require("../models/Notification");
const logger = require('../logger');

function convertISODateToDayMonthYear(isoDateString) {
    // Create a new Date object from the ISO string
    const date = new Date(isoDateString);
  
    // Define an array of month names to convert month index to month name
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    
    // Get the day from the date
    const day = date.getDate();
  
    // Get the month name from the months array using the month index from the date
    const month = months[date.getMonth()];
  
    // Get the year from the date
    const year = date.getFullYear();
  
    // Return the formatted string
    return `${day} ${month} ${year}`;
  }

// Add a class session to the timetable (Admin and Faculty only)
router.post('/', [verifyToken, checkRole(['Admin', 'Faculty'])], async (req, res) => {
    const { course, time, faculty, location } = req.body;

    try {
        // Make sure that `time` is a valid date string
        const parsedTime = new Date(time);  //ISO 8601 format
        if (isNaN(parsedTime.getTime())) {
            logger.info('Invalid time format')
            return res.status(400).send('Invalid time format');
        }

        let session = new Timetable({
            course,
            time: parsedTime,
            faculty,
            location
        });

        await session.save();
        const affectedUser = session.faculty.toString();
        if (affectedUser) {
            const notifications = {
                user: affectedUser,
                message: `New timetable has been assigned.`,
                }
            await Notification.insertMany(notifications);
        }

        res.send(session);
    } catch (error) {
        logger.error(error.message);
        res.status(500).send('Server error');
    }
});

// Update a class session in the timetable (Admin and Faculty only)
router.put('/:id', [verifyToken, checkRole(['Admin', 'Faculty'])], async (req, res) => {
    const { time } = req.body;

    if (time) {
        const parsedTime = new Date(time);
        if (isNaN(parsedTime.getTime())) {
            logger.info("Invalid time format")
            return res.status(400).send('Invalid time format');
        }
        req.body.time = parsedTime; // Update the time field in the request body to be the parsed Date object
    }
    
    try {
        let session = await Timetable.findById(req.params.id);
        if (!session) {
            logger.info('Timetable not found')
            return res.status(404).send('Timetable not found');
        }
        const affectedUser = session.faculty.toString();
        session = await Timetable.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).populate('course', '_id name');
        if (affectedUser) {
            const notifications = {
                user: affectedUser,
                message: `The timetable for course ${session.course.name} has been updated with following changes. Location : ${session.location} , Time : ${convertISODateToDayMonthYear(session.time)}.`,
                }
            await Notification.insertMany(notifications);
        }
        res.send(session);
    } catch (error) {
        logger.error(error.message);
        res.status(500).send('Server error');
    }
});

// Delete a class session from the timetable (Admin and Faculty only)
router.delete('/:id', [verifyToken, checkRole(['Admin', 'Faculty'])], async (req, res) => {
    try {
        const session = await Timetable.findByIdAndDelete(req.params.id).populate('course', '_id name');
        if (!session) {
            logger.info('class not found')
            return res.status(404).send('class not found');
        }
        const affectedUser = session.faculty.toString();
        if (affectedUser) {
            const notifications = {
                user: affectedUser,
                message: `The timetable for course ${session.course.name} has been removed.`,
                }
            await Notification.insertMany(notifications);
        }

        res.send({ message: 'Timetable deleted successfully' });
    } catch (error) {
        logger.error(error.message);
        res.status(500).send('Server error');
    }
});

// Get the timetable (All authenticated users)
router.get('/', verifyToken, async (req, res) => {
    try {
        const sessions = await Timetable.find().populate('course faculty', 'name username');
        res.send(sessions);
    } catch (error) {
        logger.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
