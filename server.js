require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// DB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/notifications', require('./routes/notifications'));



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
