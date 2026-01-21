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


// ==================== VENDOR PROFILE ROUTES ====================

// POST/UPDATE VENDOR BUSINESS PROFILE
router.post('/vendor-profile', verifyToken, (req, res) => {
    if (req.user.role !== 'VENDOR') {
        return res.status(403).send(result.createResult("Only vendors can update business profile"));
    }
    
    const { business_name, gst_number, address } = req.body;
    
    if (!business_name || !address) {
        return res.status(400).send(result.createResult("business_name and address are required"));
    }
    
    // Check if vendor profile exists
    const checkSql = 'SELECT user_id FROM vendor_profiles WHERE user_id = ?';
    
    pool.query(checkSql, [req.user.id], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        
        if (data.length > 0) {
            // Update existing profile
            const updateSql = `
                UPDATE vendor_profiles 
                SET business_name = ?, gst_number = ?, address = ?
                WHERE user_id = ?
            `;
            
            pool.query(updateSql, [business_name, gst_number, address, req.user.id], (err) => {
                if (err) return res.status(500).send(result.createResult(err.message));
                res.send(result.createResult(null, { message: 'Vendor profile updated successfully' }));
            });
        } else {
            // Insert new profile
            const insertSql = `
                INSERT INTO vendor_profiles (user_id, business_name, gst_number, address)
                VALUES (?, ?, ?, ?)
            `;
            
            pool.query(insertSql, [req.user.id, business_name, gst_number, address], (err) => {
                if (err) return res.status(500).send(result.createResult(err.message));
                res.status(201).send(result.createResult(null, { 
                    message: 'Vendor profile created successfully'
                }));
            });
        }
    });
});

// GET VENDOR BUSINESS PROFILE
router.get('/vendor-profile', verifyToken, (req, res) => {
    if (req.user.role !== 'VENDOR') {
        return res.status(403).send(result.createResult("Only vendors can view business profile"));
    }
    
    const sql = 'SELECT * FROM vendor_profiles WHERE user_id = ?';
    
    pool.query(sql, [req.user.id], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (data.length === 0) {
            return res.status(404).send(result.createResult("Vendor profile not found"));
        }
        
        res.send(result.createResult(null, data[0]));
    });
});

// GET VENDOR'S VENUES (Vendor)
router.get('/vendor/venues', verifyToken, (req, res) => {
    if (req.user.role !== 'VENDOR') {
        return res.status(403).send(result.createResult("Only vendors can view their venues"));
    }
    
    const sql = `
        SELECT v.*, sc.name as sport_name
        FROM venues v
        JOIN sports_categories sc ON v.sport_category_id = sc.id
        WHERE v.vendor_user_id = ?
        ORDER BY v.created_at DESC
    `;
    
    pool.query(sql, [req.user.id], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        res.send(result.createResult(null, data));
    });
});

// ==================== FAVORITES ROUTES ====================

// GET USER'S FAVORITE VENUES
router.get('/favorites', verifyToken, (req, res) => {
    const sql = `
        SELECT v.*, sc.name as sport_name, f.created_at as favorited_at
        FROM user_favorites f
        JOIN venues v ON f.venue_id = v.id
        JOIN sports_categories sc ON v.sport_category_id = sc.id
        WHERE f.user_id = ? AND v.approval_status = 'APPROVED'
        ORDER BY f.created_at DESC
    `;
    
    pool.query(sql, [req.user.id], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        res.send(result.createResult(null, data));
    });
});

// ADD VENUE TO FAVORITES
router.post('/favorites', verifyToken, (req, res) => {
    const { venue_id } = req.body;
    
    if (!venue_id) {
        return res.status(400).send(result.createResult("venue_id is required"));
    }
    
    // Check if venue exists and is approved
    const checkSql = 'SELECT id FROM venues WHERE id = ? AND approval_status = "APPROVED"';
    
    pool.query(checkSql, [venue_id], (err, venueData) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (venueData.length === 0) {
            return res.status(404).send(result.createResult("Venue not found or not approved"));
        }
        
        // Check if already favorited
        const checkFavSql = 'SELECT user_id FROM user_favorites WHERE user_id = ? AND venue_id = ?';
        
        pool.query(checkFavSql, [req.user.id, venue_id], (err, favData) => {
            if (err) return res.status(500).send(result.createResult(err.message));
            if (favData.length > 0) {
                return res.status(400).send(result.createResult("Venue already in favorites"));
            }
            
            const insertSql = 'INSERT INTO user_favorites (user_id, venue_id) VALUES (?, ?)';
            
            pool.query(insertSql, [req.user.id, venue_id], (err, data) => {
                if (err) return res.status(500).send(result.createResult(err.message));
                res.status(201).send(result.createResult(null, { 
                    message: 'Venue added to favorites'
                }));
            });
        });
    });
});

// REMOVE VENUE FROM FAVORITES
router.delete('/favorites/:venueId', verifyToken, (req, res) => {
    const sql = 'DELETE FROM user_favorites WHERE user_id = ? AND venue_id = ?';
    
    pool.query(sql, [req.user.id, req.params.venueId], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (data.affectedRows === 0) {
            return res.status(404).send(result.createResult("Favorite not found"));
        }
        
        res.send(result.createResult(null, { message: 'Venue removed from favorites' }));
    });
});

// CHECK IF VENUE IS FAVORITED
router.get('/favorites/check/:venueId', verifyToken, (req, res) => {
    const sql = 'SELECT user_id FROM user_favorites WHERE user_id = ? AND venue_id = ?';
    
    pool.query(sql, [req.user.id, req.params.venueId], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        
        res.send(result.createResult(null, { 
            is_favorited: data.length > 0 
        }));
    });
});

// ==================== ADMIN ROUTES ====================

// UPDATE USER STATUS (Block/Unblock)
router.put('/:id/status', verifyToken, (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).send(result.createResult("Admin access required"));
    }
    
    const { is_active } = req.body;
    
    if (typeof is_active !== 'boolean' && is_active !== 0 && is_active !== 1) {
        return res.status(400).send(result.createResult("is_active must be 0 or 1"));
    }
    
    const sql = 'UPDATE users SET is_active = ? WHERE id = ?';
    
    pool.query(sql, [is_active ? 1 : 0, req.params.id], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (data.affectedRows === 0) {
            return res.status(404).send(result.createResult("User not found"));
        }
        
        const status = is_active ? 'activated' : 'blocked';
        res.send(result.createResult(null, { message: `User ${status} successfully` }));
    });
});

// GET ALL BOOKINGS (Admin)
router.get('/admin/bookings', verifyToken, (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).send(result.createResult("Admin access required"));
    }
    
    const { status, venue_id } = req.query;
    
    let sql = `
        SELECT b.*, 
               v.name as venue_name,
               s.date as slot_date, s.start_time, s.end_time,
               u.first_name as user_name, u.email as user_email,
               vendor.first_name as vendor_name
        FROM bookings b
        JOIN venues v ON b.venue_id = v.id
        JOIN slots s ON b.slot_id = s.id
        JOIN users u ON b.user_id = u.id
        JOIN users vendor ON v.vendor_user_id = vendor.id
        WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
        sql += ' AND b.status = ?';
        params.push(status);
    }
    
    if (venue_id) {
        sql += ' AND b.venue_id = ?';
        params.push(venue_id);
    }
    
    sql += ' ORDER BY b.created_at DESC';
    
    pool.query(sql, params, (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        res.send(result.createResult(null, data));
    });
});

// GET PLATFORM STATISTICS (Admin)
router.get('/admin/stats', verifyToken, (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).send(result.createResult("Admin access required"));
    }
    
    const statsSql = `
        SELECT 
            (SELECT COUNT(*) FROM users WHERE role = 'USER') as total_users,
            (SELECT COUNT(*) FROM users WHERE role = 'VENDOR') as total_vendors,
            (SELECT COUNT(*) FROM venues WHERE approval_status = 'APPROVED') as total_venues,
            (SELECT COUNT(*) FROM venues WHERE approval_status = 'PENDING') as pending_venues,
            (SELECT COUNT(*) FROM bookings WHERE status = 'CONFIRMED') as total_bookings,
            (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE payment_status = 'PAID') as total_revenue
    `;
    
    pool.query(statsSql, (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        res.send(result.createResult(null, data[0]));
    });
});

module.exports = router;