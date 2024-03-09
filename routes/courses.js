const express = require('express');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const Course = require('../models/Course');

const router = express.Router();

// Create a course (Admin only)
router.post('/', [verifyToken, checkRole(['Admin'])], async (req, res) => {
    try {
        let course = new Course({ ...req.body });
        await course.save();
        res.send(course);
    } catch (error) {
        res.status(500).send('Server error');

    }
});

// Get all courses (Authenticated users)
router.get('/', verifyToken, async (req, res) => {
    try {
        const courses = await Course.find();
        res.send(courses);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// Get a single course by ID (Authenticated users)
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).send('Course not found');

        res.send(course);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});


// Update a course (Admin only)
router.put('/:id', [verifyToken, checkRole(['Admin'])], async (req, res) => {
    const { id } = req.params;
    try {
        let course = await Course.findById(id);
        if (!course) return res.status(404).send('Course not found');

        // Update course with new values. Only fields provided in the request body will be updated.
        course = await Course.findByIdAndUpdate(id, { $set: req.body }, { new: true });
        res.send(course);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// Delete a course (Admin only)
router.delete('/:id', [verifyToken, checkRole(['Admin'])], async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).send('Course not found');

        res.send({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});


// Implement other CRUD operations here

module.exports = router;
