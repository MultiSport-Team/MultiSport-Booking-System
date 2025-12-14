const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../utils/db');
const { createResult } = require('../utils/result');
const { generateToken, verifyToken } = require('../utils/authUser');
const config = require('../utils/config');

// 1. REGISTER
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json(createResult('Email already in use', null));
        }

        const hashedPassword = await bcrypt.hash(password, config.saltRounds);
        
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.status(201).json(createResult(null, { message: 'User registered', id: result.insertId }));
    } catch (error) {
        res.status(500).json(createResult(error.message, null));
    }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) return res.status(404).json(createResult('User not found', null));

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const token = generateToken({ id: user.id, email: user.email });
            // Don't send password back
            const { password, ...userWithoutPassword } = user; 
            res.json(createResult(null, { token, user: userWithoutPassword }));
        } else {
            res.status(401).json(createResult('Invalid credentials', null));
        }
    } catch (error) {
        res.status(500).json(createResult(error.message, null));
    }
});

// 3. GET PROFILE (Protected)
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, username, email, created_at FROM users WHERE id = ?', 
            [req.user.id]
        );
        res.json(createResult(null, users[0]));
    } catch (error) {
        res.status(500).json(createResult(error.message, null));
    }
});

// 4. UPDATE PROFILE (Protected)
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { username, email } = req.body;
        await db.execute(
            'UPDATE users SET username = ?, email = ? WHERE id = ?',
            [username, email, req.user.id]
        );
        res.json(createResult(null, { message: 'Profile updated successfully' }));
    } catch (error) {
        res.status(500).json(createResult(error.message, null));
    }
});

// 5. GET ALL USERS (For Admin - Optional)
router.get('/', verifyToken, async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, username, email FROM users');
        res.json(createResult(null, users));
    } catch (error) {
        res.status(500).json(createResult(error.message, null));
    }
});

module.exports = router;