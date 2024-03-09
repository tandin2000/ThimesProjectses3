const express = require('express');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Notification = require('../models/Notification')
const router = express.Router();
const logger = require('../logger');

// Enroll in a course (Students)
router.post('/', verifyToken, async (req, res) => {
    const { course, student } = req.body;
    try {
        const user = await User.findById(student);
        if (!user){
            logger.info('User not found');

            return res.status(404).send('User not found');
        }
        if(user.role !== "Student"){
            logger.info('Only applicable to Students');
            return res.status(400).send('Only applicable to Students');
        }

        const courseDetails = await Course.findById(course).exec();
        if (!courseDetails) {
            logger.info('Course not found');

            return res.status(404).send('Course not found');
        }


        const existingEnrollment = await Enrollment.findOne({ student, course });
        if (existingEnrollment) {
            logger.info('Student is already enrolled in this course.');

            return res.status(400).send('Student is already enrolled in this course.');
        }

        const enrollment = new Enrollment({ student, course });
        await enrollment.save();
        const notifications = {
            user: student,
            message: `${courseDetails.name} has been assigned.`,
            }
        await Notification.insertMany(notifications);
        res.status(201).send(enrollment);
    } catch (error) {
        logger.error(error.message);
        res.status(500).send('Server error');
    }
});

// View enrollments for a student (Students, Faculty, Admins)
router.get('/my-enrollments', [verifyToken], async (req, res) => {
    let studentId
    try {
    if(req.user.role === "Admin" || req.user.role === "Faculty" ){
        studentId = req.body.studentId;
    }else{
       studentId = req.user._id;
    }    
        const enrollments = await Enrollment.find({ student: studentId }).populate('course', 'name code');
        res.send(enrollments);
    } catch (error) {
        logger.error(error.message);
        res.status(500).send('Server error');
    }
});

// View all students enrolled in a specific course (Faculty, Admins)
router.get('/course/:courseId', [verifyToken, checkRole(['Faculty', 'Admin'])], async (req, res) => {
    try {
        const { courseId } = req.params;
        const enrollments = await Enrollment.find({ course: courseId }).populate('student course', 'username name');
        res.send(enrollments);
    } catch (error) {
        logger.error(error.message);
        res.status(500).send('Server error');
    }
});




// Delete an enrollment by ID (Admins, Faculty)
router.delete('/:enrollmentId', [verifyToken, checkRole(['Admin', 'Faculty'])], async (req, res) => {
    const { enrollmentId } = req.params;

    try {
        // Attempt to delete the specified enrollment
        const deletedEnrollment = await Enrollment.findByIdAndDelete(enrollmentId).populate('course', '_id name');

        if (!deletedEnrollment) {
            logger.info('Enrollment not found')
            return res.status(404).send('Enrollment not found');
        }

        const notifications = {
            user: deletedEnrollment.student,
            message: `${deletedEnrollment.course.name} has been removed.`,
            }
        await Notification.insertMany(notifications);

        res.status(200).send(`Enrollment deleted successfully.`);
    } catch (error) {
        logger.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
