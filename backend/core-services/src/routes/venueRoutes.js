const express = require('express');
const pool = require('../utils/db');
const result = require('../utils/result');
const { verifyToken } = require('../utils/authUser');

const router = express.Router();

// 1. GET ALL VENUES
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM venues';
    pool.query(sql, (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        res.send(result.createResult(null, data));
    });
});

// 2. GET SINGLE VENUE
router.get('/:id', (req, res) => {
    const sql = 'SELECT * FROM venues WHERE id = ?';
    pool.query(sql, [req.params.id], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (data.length === 0) return res.status(404).send(result.createResult("Venue not found"));
        res.send(result.createResult(null, data[0]));
    });
});

// 3. ADD VENUE 
router.post('/', verifyToken, (req, res) => {
    const { sport_category_id, name, city, address, description, price_per_hour, amenities } = req.body;
    
    const vendor_user_id = req.user.id; 

    const amenitiesJson = JSON.stringify(amenities || {});

    const sql = `INSERT INTO venues 
        (vendor_user_id, sport_category_id, name, city, address, description, price_per_hour, amenities, approval_status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`;
    
    pool.query(sql, 
        [vendor_user_id, sport_category_id, name, city, address, description, price_per_hour, amenitiesJson], 
        (err, data) => {
            if (err) return res.status(500).send(result.createResult(err.message));
            res.status(201).send(result.createResult(null, { message: 'Venue created', id: data.insertId }));
        }
    );
});

// 4. UPDATE VENUE (Protected)
router.put('/:id', verifyToken, (req, res) => {
    const { name, city, address, description, price_per_hour, amenities } = req.body;
    const amenitiesJson = JSON.stringify(amenities || {});

    const sql = `UPDATE venues 
                 SET name = ?, city = ?, address = ?, description = ?, price_per_hour = ?, amenities = ? 
                 WHERE id = ? AND vendor_user_id = ?`;

    pool.query(sql, 
        [name, city, address, description, price_per_hour, amenitiesJson, req.params.id, req.user.id], 
        (err, data) => {
            if (err) return res.status(500).send(result.createResult(err.message));
            if (data.affectedRows === 0) return res.status(403).send(result.createResult("Venue not found or unauthorized"));
            
            res.send(result.createResult(null, { message: 'Venue updated successfully' }));
        }
    );
});

// 5. DELETE VENUE (Protected)
router.delete('/:id', verifyToken, (req, res) => {
    const sql = 'DELETE FROM venues WHERE id = ? AND vendor_user_id = ?';
    pool.query(sql, [req.params.id, req.user.id], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (data.affectedRows === 0) return res.status(403).send(result.createResult("Not authorized or venue not found"));
        res.send(result.createResult(null, { message: 'Venue deleted' }));
    });
});

module.exports = router;