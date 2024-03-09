require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

const Room = require("./models/Room");
const Resource = require("./models/Resource")

const initialRooms = [
    { name: 'Room 101', capacity: 30, type: 'Classroom' },
    { name: 'Room 102', capacity: 25, type: 'Classroom' },
    { name: 'Lab 201', capacity: 20, type: 'Lab' },
    { name: 'Lab 202', capacity: 15, type: 'Lab' },
    { name: 'Auditorium A', capacity: 100, type: 'Auditorium' },
    { name: 'Auditorium B', capacity: 120, type: 'Auditorium' },
    { name: 'Room 103', capacity: 40, type: 'Classroom' },
    { name: 'Lab 203', capacity: 10, type: 'Lab' },
    { name: 'Room 104', capacity: 35, type: 'Classroom' },
    { name: 'Auditorium C', capacity: 150, type: 'Auditorium' },
    { name: 'Lab 204', capacity: 18, type: 'Lab' },
    { name: 'Room 105', capacity: 50, type: 'Classroom' },
];

const initialResources = [
    { name: 'Epson Projector X200', type: 'Projector', quantity: 5 },
    { name: 'Dell Desktop Computer', type: 'Computer', quantity: 20 },
    { name: 'Logitech Conference Cam', type: 'Special Equipment', quantity: 10 },
    { name: 'HP Laptop', type: 'Computer', quantity: 30 },
    { name: 'Sony Projector S340', type: 'Projector', quantity: 7 },
    { name: 'Arduino Starter Kit', type: 'Special Equipment', quantity: 15 },
    { name: 'Raspberry Pi 4', type: 'Computer', quantity: 25 },
    { name: 'Canon DSLR Camera', type: 'Special Equipment', quantity: 8 },
    { name: 'Samsung Tablet', type: 'Computer', quantity: 12 },
    { name: 'BenQ Projector Z1050', type: 'Projector', quantity: 6 },
];


async function loadInitialData() {
    try {
        // Check if any room data already exists
        const count = await Room.countDocuments();
        const count2 = await Resource.countDocuments();
        if(count === 0) {
            // If no data exists, insert initialRooms data
            await Room.insertMany(initialRooms);
            console.log('Initial room data has been successfully loaded into the database');
        } else {
            // If data already exists, log a message and do not insert
            console.log('Initial room data already exists in the database. No new data added.');
        }

        if(count2 === 0) {
            // If no data exists, insert initialResources data
            await Resource.insertMany(initialResources);
            console.log('Initial resource data has been successfully loaded into the database');
        } else {
            // If data already exists, log a message and do not insert
            console.log('Initial resource data already exists in the database. No new data added.');
        }
    } catch (err) {
        console.error('An error occurred while loading initial data:', err);
    }
}


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


//calling dummyData loader
loadInitialData();


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
