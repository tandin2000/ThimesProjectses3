const express = require('express');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
// Include other required models

const router = express.Router();

// Enroll in a course (Students)
router.post('/', verifyToken, async (req, res) => {
    const { course } = req.body;
    const student = req.user._id; // Assuming user ID is attached to the request by the auth middleware

    const existingEnrollment = await Enrollment.findOne({ student, course });
    if (existingEnrollment) {
        return res.status(400).send('Student is already enrolled in this course.');
    }

    const enrollment = new Enrollment({ student, course });
    try {
        await enrollment.save();
        res.status(201).send(enrollment);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// View enrollments for a student (Students, Faculty, Admins)
router.get('/my-enrollments', [verifyToken], async (req, res) => {
    const studentId = req.user._id; // Use this for students. For faculty/admins, they might specify a student ID in the request

    try {
        const enrollments = await Enrollment.find({ student: studentId }).populate('course', 'name code');
        res.send(enrollments);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// View all students enrolled in a specific course (Faculty, Admins)
router.get('/course/:courseId', [verifyToken, checkRole(['Faculty', 'Admin'])], async (req, res) => {
    try {
        const { courseId } = req.params;
        const enrollments = await Enrollment.find({ course: courseId }).populate('student', 'username');
        res.send(enrollments);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
