const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    capacity: Number,
    type: {
        type: String,
        enum: ['Classroom', 'Lab', 'Auditorium'],
        required: true
    }
});

module.exports = mongoose.model('Room', roomSchema);
