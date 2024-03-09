const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Unread', 'Read'],
        default: 'Unread'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
    // You can extend this model with more fields if necessary,
    // such as a link or an action associated with the notification.
});

module.exports = mongoose.model('Notification', notificationSchema);
