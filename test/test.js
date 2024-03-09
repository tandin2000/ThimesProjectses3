const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const logger = require('../logger');
const authRoutes = require('../routes/auth');

jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../logger');

const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

describe('Authentication Routes', () => {
    describe('POST /register', () => {
        it('should register a new user', async () => {
            User.findOne.mockResolvedValue(null);
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashedPassword');
            User.prototype.save = jest.fn().mockResolvedValue({
                _id: '1',
                username: 'testuser',
                password: 'hashedPassword',
                role: 'Student'
            });
            jwt.sign.mockReturnValue('fakeToken');

            const response = await request(app)
                .post('/api/auth/register')
                .send({ username: 'testuser', password: 'password', role: 'Student' });

            expect(response.statusCode).toBe(200);
            expect(response.headers.authorization).toBeDefined();
            expect(response.body).toEqual({
                message: "User registered successfully",
                token: 'fakeToken'
            });
        });
    });

    describe('POST /login', () => {
        it('should login an existing user', async () => {
            User.findOne.mockResolvedValue({
                _id: '1',
                username: 'testuser',
                password: 'hashedPassword',
                role: 'Student'
            });
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('fakeToken');

            const response = await request(app)
                .post('/api/auth/login')
                .send({ username: 'testuser', password: 'password' });

            expect(response.statusCode).toBe(200);
            expect(response.headers.authorization).toBeDefined();
            expect(response.body).toEqual({
                message: "Logged in successfully",
                token: 'fakeToken'
            });
        });

        it('should not login with incorrect credentials', async () => {
            // Assuming the user exists
            User.findOne.mockResolvedValue({
                _id: '1',
                username: 'existingUser',
                password: 'hashedCorrectPassword',
                role: 'Student'
            });
        
            // Simulate bcrypt's compare function to return false for incorrect password
            bcrypt.compare.mockResolvedValue(false);
        
            const response = await request(app)
                .post('/api/auth/login')
                .send({ username: 'existingUser', password: 'wrongPassword' });
        
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({});
        
            // Verify that a token is not returned
            expect(response.headers.authorization).toBeUndefined();
        });
        
    });

});
