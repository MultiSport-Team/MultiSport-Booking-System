const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../utils/db');
const result = require('../utils/result');
const config = require('../utils/config');
const { verifyToken } = require('../utils/authUser');

const router = express.Router();
const SaltRounds = 10;

// REGISTER
router.post('/register', (req, res) => {
    console.log("Register Body:", req.body);
    const { first_name, last_name, email, phone, password, role } = req.body;

    if (!password || !email || !first_name) {
        return res.status(400).send(result.createResult("Missing required fields: first_name, email, and password"));
    }
    const userRole = role || 'USER'; 

    bcrypt.hash(password, SaltRounds, (err, hash) => {
        if (err) return res.status(500).send(result.createResult(err.message));

        const sql = 'INSERT INTO users (first_name, last_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)';
        
        pool.query(sql, [first_name, last_name, email, phone, hash, userRole], (err, data) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send(result.createResult("Email or Phone already exists"));
                }
                return res.status(500).send(result.createResult(err.message));
            }
            res.status(201).send(result.createResult(null, { message: 'User registered', id: data.insertId }));
        });
    });
});

// LOGIN
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';

    pool.query(sql, [email], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (data.length === 0) return res.status(404).send(result.createResult("User not found"));

        const user = data[0];

        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) return res.status(500).send(result.createResult(err.message));
            
            if (isMatch) {
                const payload = { id: user.id, email: user.email, role: user.role };
                const token = jwt.sign(payload, config.secret, { expiresIn: '24h' });
                
                const userResponse = {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.role,
                    token
                };
                res.send(result.createResult(null, userResponse));
            } else {
                res.status(401).send(result.createResult("Invalid credentials"));
            }
        });
    });
});

// GET PROFILE
router.get('/profile', verifyToken, (req, res) => {
    const sql = 'SELECT id, first_name, last_name, email, phone, role, created_at FROM users WHERE id = ?';
    pool.query(sql, [req.user.id], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (data.length === 0) return res.status(404).send(result.createResult("User not found"));
        
        res.send(result.createResult(null, data[0]));
    });
});



// GET ALL USERS (Admin usage)
router.get('/', verifyToken, (req, res) => {
    const sql = 'SELECT id, first_name, last_name, email, role, is_active FROM users';
    pool.query(sql, (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        res.send(result.createResult(null, data));
    });
});

// UPDATE PROFILE
router.put('/profile', verifyToken, (req, res) => {
    const { first_name, last_name, phone } = req.body;
    
    const sql = 'UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?';
    
    pool.query(sql, [first_name, last_name, phone, req.user.id], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        res.send(result.createResult(null, { message: 'Profile updated successfully' }));
    });
});

module.exports = router;