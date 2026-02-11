

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../utils/db');
const result = require('../utils/result');
const { verifyToken } = require('../utils/authUser');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/venues';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'venue-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and WebP allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

//  PUBLIC ROUTES

// GET ALL APPROVED VENUES (Public Search with Filters)
router.get('/', (req, res) => {
    const { city, sport_category_id, min_price, max_price, search } = req.query;
    
let sql = `
    SELECT v.*, sc.name as sport_name, 
           u.first_name as vendor_name, u.phone as vendor_phone,
           vi.id as image_id, vi.image_url, vi.is_primary
    FROM venues v
    JOIN sports_categories sc ON v.sport_category_id = sc.id
    JOIN users u ON v.vendor_user_id = u.id
    LEFT JOIN venue_images vi ON v.id = vi.venue_id AND vi.is_primary = true
    WHERE v.approval_status = 'APPROVED'
`;
    
    const params = [];
    
    if (city) {
        sql += ' AND v.city LIKE ?';
        params.push(`%${city}%`);
    }
    
    if (sport_category_id) {
        sql += ' AND v.sport_category_id = ?';
        params.push(sport_category_id);
    }
    
    if (min_price) {
        sql += ' AND v.price_per_hour >= ?';
        params.push(min_price);
    }
    
    if (max_price) {
        sql += ' AND v.price_per_hour <= ?';
        params.push(max_price);
    }
    
    if (search) {
        sql += ' AND (v.name LIKE ? OR v.description LIKE ? OR v.city LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY v.created_at DESC';
    
    pool.query(sql, params, (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        
        const venues = [];
        const venueMap = {};
        
        data.forEach(row => {
            if (!venueMap[row.id]) {
                venueMap[row.id] = {
                    ...row,
                    images: []
                };
                
                delete venueMap[row.id].image_id;
                delete venueMap[row.id].is_primary;
                venues.push(venueMap[row.id]);
            }
            
            
            if (row.image_id && row.image_url) {
                venueMap[row.id].images.push({
                    id: row.image_id,
                    image_url: row.image_url,
                    is_primary: row.is_primary
                });
            }
        });
        
        res.send(result.createResult(null, venues));
    });
});

// GET VENUE DETAILS BY ID (Public)
router.get('/details/:id', (req, res) => {
    const sql = `
        SELECT v.*, sc.name as sport_name, sc.icon_url,
               u.first_name as vendor_name, u.last_name as vendor_last_name,
               u.phone as vendor_phone, u.email as vendor_email
        FROM venues v
        JOIN sports_categories sc ON v.sport_category_id = sc.id
        JOIN users u ON v.vendor_user_id = u.id
        WHERE v.id = ? AND v.approval_status = 'APPROVED'
    `;
    
    pool.query(sql, [req.params.id], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (data.length === 0) return res.status(404).send(result.createResult("Venue not found"));
        
        const venue = data[0];
        
        // Get venue images
        const imageSql = 'SELECT * FROM venue_images WHERE venue_id = ? ORDER BY is_primary DESC';
        pool.query(imageSql, [req.params.id], (err, images) => {
            if (err) return res.status(500).send(result.createResult(err.message));
            
            venue.images = images;
            res.send(result.createResult(null, venue));
        });
    });
});

// GET ALL SPORTS CATEGORIES (Public)
router.get('/categories', (req, res) => {
    const sql = 'SELECT * FROM sports_categories ORDER BY name ASC';
    
    pool.query(sql, (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        res.send(result.createResult(null, data));
    });
});

// GET REVIEWS FOR A VENUE (Public)
router.get('/:id/reviews', (req, res) => {
    const sql = `
        SELECT r.*, u.first_name, u.last_name, b.booking_number
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN bookings b ON r.booking_id = b.id
        WHERE r.venue_id = ?
        ORDER BY r.created_at DESC
    `;
    
    pool.query(sql, [req.params.id], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        res.send(result.createResult(null, data));
    });
});

//  USER ROUTES (AUTHENTICATED)

// POST REVIEW FOR A VENUE (User must have completed booking)
router.post('/:id/reviews', verifyToken, (req, res) => {
    const { booking_id, rating, comment } = req.body;
    const venueId = req.params.id;
    const userId = req.user.id;
    
    if (!booking_id || !rating || rating < 1 || rating > 5) {
        return res.status(400).send(result.createResult("booking_id and rating (1-5) are required"));
    }
    
    const checkSql = `
        SELECT id FROM bookings 
        WHERE id = ? AND user_id = ? AND venue_id = ? AND status = 'CONFIRMED'
    `;
    
    pool.query(checkSql, [booking_id, userId, venueId], (err, bookingData) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        
        if (bookingData.length === 0) {
            return res.status(403).send(result.createResult("Invalid booking or booking not confirmed"));
        }
        
        const existingSql = 'SELECT id FROM reviews WHERE booking_id = ?';
        
        pool.query(existingSql, [booking_id], (err, existingData) => {
            if (err) return res.status(500).send(result.createResult(err.message));
            
            if (existingData.length > 0) {
                return res.status(400).send(result.createResult("Review already submitted for this booking"));
            }
            
            const insertSql = 'INSERT INTO reviews (booking_id, user_id, venue_id, rating, comment) VALUES (?, ?, ?, ?, ?)';
            
            pool.query(insertSql, [booking_id, userId, venueId, rating, comment], (err, data) => {
                if (err) return res.status(500).send(result.createResult(err.message));
                res.status(201).send(result.createResult(null, { 
                    message: 'Review submitted successfully', 
                    id: data.insertId 
                }));
            });
        });
    });
});

// ==================== VENDOR ROUTES ====================

// ADD NEW VENUE (Vendor)
router.post('/', verifyToken, (req, res) => {
    const { sport_category_id, name, city, address, description, price_per_hour, amenities, image } = req.body;
    
    if (req.user.role !== 'VENDOR') {
        return res.status(403).send(result.createResult("Only vendors can add venues"));
    }
    
    if (!sport_category_id || !name || !city || !address || !price_per_hour) {
        return res.status(400).send(result.createResult("Missing required fields"));
    }
    
    const amenitiesJson = amenities ? JSON.stringify(amenities) : null;
    
    const sql = `
        INSERT INTO venues (vendor_user_id, sport_category_id, name, city, address, description, price_per_hour, amenities, approval_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
    `;
    
    pool.query(sql, [req.user.id, sport_category_id, name, city, address, description, price_per_hour, amenitiesJson], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        
        const venueId = data.insertId;
        
        // If image is provided, save it as well
        if (image) {
            const imageSql = 'INSERT INTO venue_images (venue_id, image_url, is_primary) VALUES (?, ?, true)';
            pool.query(imageSql, [venueId, image], (imgErr, imgData) => {
                if (imgErr) {
                    console.error('Error saving venue image:', imgErr);
                    // Still return success even if image fails to save
                }
                res.status(201).send(result.createResult(null, { 
                    message: 'Venue submitted for approval', 
                    id: venueId 
                }));
            });
        } else {
            res.status(201).send(result.createResult(null, { 
                message: 'Venue submitted for approval', 
                id: venueId 
            }));
        }
    });
});


// ADD VENUE IMAGES (Vendor) - File Upload with Multer
router.post('/:id/images', verifyToken, upload.single('image'), (req, res) => {
    if (req.user.role !== 'VENDOR') {
        return res.status(403).send(result.createResult("Only vendors can add images"));
    }
    
    const venueId = req.params.id;
    
    if (!req.file) {
        return res.status(400).send(result.createResult("Image file is required"));
    }
    
 
    const image_url = `/uploads/venues/${req.file.filename}`;
    const is_primary = req.body.is_primary ? 1 : 0;
    

    const checkSql = 'SELECT id FROM venues WHERE id = ? AND vendor_user_id = ?';
    
    pool.query(checkSql, [venueId, req.user.id], (err, venueData) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (venueData.length === 0) {
            return res.status(403).send(result.createResult("Venue not found or unauthorized"));
        }
        
        const sql = 'INSERT INTO venue_images (venue_id, image_url, is_primary) VALUES (?, ?, ?)';
        
        pool.query(sql, [venueId, image_url, is_primary], (err, data) => {
            if (err) return res.status(500).send(result.createResult(err.message));
            res.status(201).send(result.createResult(null, { 
                message: 'Image added successfully',
                id: data.insertId,
                image_url: image_url
            }));
        });
    });
});

// GET VENUE IMAGES (Public)
router.get('/:id/images', (req, res) => {
    const venueId = req.params.id;
    const sql = 'SELECT id, image_url, is_primary FROM venue_images WHERE venue_id = ? ORDER BY is_primary DESC, created_at ASC';
    
    pool.query(sql, [venueId], (err, images) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        res.status(200).send(result.createResult(null, images));
    });
});

// UPDATE VENUE (Vendor - Only their own venues)
router.put('/:id', verifyToken, (req, res) => {
    const { name, city, address, description, price_per_hour, amenities } = req.body;
    
    if (req.user.role !== 'VENDOR') {
        return res.status(403).send(result.createResult("Only vendors can update venues"));
    }
    
    // Check if venue belongs to this vendor
    const checkSql = 'SELECT id FROM venues WHERE id = ? AND vendor_user_id = ?';
    
    pool.query(checkSql, [req.params.id, req.user.id], (err, checkData) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (checkData.length === 0) {
            return res.status(403).send(result.createResult("Venue not found or unauthorized"));
        }
        
        const amenitiesJson = amenities ? JSON.stringify(amenities) : null;
        
        const sql = `
            UPDATE venues 
            SET name = ?, city = ?, address = ?, description = ?, price_per_hour = ?, amenities = ?
            WHERE id = ?
        `;
        
        pool.query(sql, [name, city, address, description, price_per_hour, amenitiesJson, req.params.id], (err, data) => {
            if (err) return res.status(500).send(result.createResult(err.message));
            res.send(result.createResult(null, { message: 'Venue updated successfully' }));
        });
    });
});

// DELETE VENUE (Vendor - Only their own venues with no bookings)
router.delete('/:id', verifyToken, (req, res) => {
    if (req.user.role !== 'VENDOR') {
        return res.status(403).send(result.createResult("Only vendors can delete venues"));
    }
    
    // Check if venue belongs to this vendor
    const checkSql = 'SELECT id FROM venues WHERE id = ? AND vendor_user_id = ?';
    
    pool.query(checkSql, [req.params.id, req.user.id], (err, checkData) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (checkData.length === 0) {
            return res.status(403).send(result.createResult("Venue not found or unauthorized"));
        }
        
        
        const bookingSql = 'SELECT COUNT(*) as count FROM bookings WHERE venue_id = ?';
        
        pool.query(bookingSql, [req.params.id], (err, bookingData) => {
            if (err) return res.status(500).send(result.createResult(err.message));
            
            if (bookingData[0].count > 0) {
                return res.status(400).send(result.createResult("Cannot delete venue with existing bookings"));
            }
            
            const sql = 'DELETE FROM venues WHERE id = ?';
            
            pool.query(sql, [req.params.id], (err, data) => {
                if (err) return res.status(500).send(result.createResult(err.message));
                res.send(result.createResult(null, { message: 'Venue deleted successfully' }));
            });
        });
    });
});

// GET VENDOR'S ALL VENUES
router.get('/vendor/venues', verifyToken, (req, res) => {
    const sql = `
        SELECT v.*, vi.id as image_id, vi.image_url, vi.is_primary
        FROM venues v
        LEFT JOIN venue_images vi ON v.id = vi.venue_id AND vi.is_primary = true
        WHERE v.vendor_user_id = ?
        ORDER BY v.created_at DESC
    `;
    
    pool.query(sql, [req.user.id], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        
        // Transform data to group images back into array format
        const venues = [];
        const venueMap = {};
        
        data.forEach(row => {
            if (!venueMap[row.id]) {
                venueMap[row.id] = {
                    ...row,
                    images: []
                };
                // Remove image-specific fields from root level
                delete venueMap[row.id].image_id;
                delete venueMap[row.id].is_primary;
                venues.push(venueMap[row.id]);
            }
            
            // Add image if it exists
            if (row.image_id && row.image_url) {
                venueMap[row.id].images.push({
                    id: row.image_id,
                    image_url: row.image_url,
                    is_primary: row.is_primary
                });
            }
        });
        
        res.send(result.createResult(null, venues));
    });
});

//  ADMIN ROUTES (AUTHENTICATED)

// ADD SPORTS CATEGORY (Admin)
router.post('/categories', verifyToken, (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).send(result.createResult("Admin access required"));
    }
    
    const { name, icon_url } = req.body;
    
    if (!name) {
        return res.status(400).send(result.createResult("Category name is required"));
    }
    
    const sql = 'INSERT INTO sports_categories (name, icon_url) VALUES (?, ?)';
    
    pool.query(sql, [name, icon_url], (err, data) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).send(result.createResult("Category already exists"));
            }
            return res.status(500).send(result.createResult(err.message));
        }
        res.status(201).send(result.createResult(null, { 
            message: 'Sports category added', 
            id: data.insertId 
        }));
    });
});

// GET PENDING VENUES (Admin)
router.get('/admin/pending', verifyToken, (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).send(result.createResult("Admin access required"));
    }
    
    const sql = `
        SELECT v.*, sc.name as sport_name, 
               u.first_name as vendor_name, u.email as vendor_email, u.phone as vendor_phone,
               vi.id as image_id, vi.image_url, vi.is_primary
        FROM venues v
        JOIN sports_categories sc ON v.sport_category_id = sc.id
        JOIN users u ON v.vendor_user_id = u.id
        LEFT JOIN venue_images vi ON v.id = vi.venue_id AND vi.is_primary = true
        WHERE v.approval_status = 'PENDING'
        ORDER BY v.created_at ASC
    `;
    
    pool.query(sql, (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        
        // Transform data to group images back into array format
        const venues = [];
        const venueMap = {};
        
        data.forEach(row => {
            if (!venueMap[row.id]) {
                venueMap[row.id] = {
                    ...row,
                    images: []
                };
                // Remove image-specific fields from root level
                delete venueMap[row.id].image_id;
                delete venueMap[row.id].is_primary;
                venues.push(venueMap[row.id]);
            }
            
            // Add image if it exists
            if (row.image_id && row.image_url) {
                venueMap[row.id].images.push({
                    id: row.image_id,
                    image_url: row.image_url,
                    is_primary: row.is_primary
                });
            }
        });
        
        res.send(result.createResult(null, venues));
    });
});

// APPROVE/REJECT VENUE (Admin)
router.put('/:id/approval', verifyToken, (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).send(result.createResult("Admin access required"));
    }
    
    const { approval_status } = req.body;
    
    if (!approval_status || !['APPROVED', 'REJECTED'].includes(approval_status)) {
        return res.status(400).send(result.createResult("Invalid approval status"));
    }
    
    const sql = 'UPDATE venues SET approval_status = ? WHERE id = ?';
    
    pool.query(sql, [approval_status, req.params.id], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (data.affectedRows === 0) {
            return res.status(404).send(result.createResult("Venue not found"));
        }
        res.send(result.createResult(null, { 
            message: `Venue ${approval_status.toLowerCase()} successfully` 
        }));
    });
});

module.exports = router;