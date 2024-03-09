const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    time: {
        type: Date,
        required: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Timetable', timetableSchema);
