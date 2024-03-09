const express = require('express');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const Course = require('../models/Course');

const router = express.Router();
const Notification = require("../models/Notification");
const logger = require('../logger');

// Create a course (Admin only)
router.post('/', [verifyToken, checkRole(['Admin'])], async (req, res) => {
    try {
        let course = new Course({ ...req.body });
        await course.save();
        const notifications = {
            user: course.faculty,
            message: `New course added, ${course.name}.`,
            }
        await Notification.insertMany(notifications);
        res.send(course);
    } catch (error) {
        logger.error(error.message);
        res.status(500).send('Server error');

    }
});

// Get all courses (Authenticated users)
router.get('/', verifyToken, async (req, res) => {
    try {
        const courses = await Course.find();
        res.send(courses);
    } catch (error) {
        logger.error(error.message);
        res.status(500).send('Server error');
    }
});

// Get a single course by ID (Authenticated users)
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            logger.info('Course not found');
            return res.status(404).send('Course not found');
        }

        res.send(course);
    } catch (error) {
        logger.error(error.message);
        res.status(500).send('Server error');
    }
});


// Update a course (Admin only)
router.put('/:id', [verifyToken, checkRole(['Admin'])], async (req, res) => {
    const { id } = req.params;
    try {
        let course = await Course.findById(id);
        if (!course) {
            logger.info('Course not found');
            return res.status(404).send('Course not found');
        }

        // Update course with new values. Only fields provided in the request body will be updated.
        course = await Course.findByIdAndUpdate(id, { $set: req.body }, { new: true });

        const notifications = {
            user: course.faculty,
            message: `${course.name}, course updated.`,
            }
        await Notification.insertMany(notifications);
        res.send(course);
    } catch (error) {
        logger.error(error.message);
        res.status(500).send('Server error');
    }
});

// Delete a course (Admin only)
router.delete('/:id', [verifyToken, checkRole(['Admin'])], async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            logger.info('Course not found');
            return res.status(404).send('Course not found');
        }
        const notifications = {
            user: course.faculty,
            message: `${course.name}, course deleted.`,
            }
        await Notification.insertMany(notifications);
        res.send({ message: 'Course deleted successfully' });
    } catch (error) {
        logger.error(error.message);
        res.status(500).send('Server error');
    }
});


// Implement other CRUD operations here

module.exports = router;
