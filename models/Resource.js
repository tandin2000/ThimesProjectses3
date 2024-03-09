const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String, // e.g., Projector, Computer, Special Equipment
        required: true
    },
    quantity: Number
});

module.exports = mongoose.model('Resource', resourceSchema);
