// const express = require('express');
// const pool = require('../utils/db');
// const result = require('../utils/result');
// const { verifyToken } = require('../utils/authUser');

// const router = express.Router();

// // 1. GET MY BOOKINGS
// router.get('/', verifyToken, (req, res) => {
//     const sql = `
//         SELECT b.id, b.booking_number, b.booking_date, b.total_amount, b.status, 
//                v.name as venue_name, v.city, v.address 
//         FROM bookings b 
//         JOIN venues v ON b.venue_id = v.id 
//         WHERE b.user_id = ? 
//         ORDER BY b.booking_date DESC`;
        
//     pool.query(sql, [req.user.id], (err, data) => {
//         if (err) return res.status(500).send(result.createResult(err.message));
//         res.send(result.createResult(null, data));
//     });
// });

// // 2. GET BOOKINGS FOR A VENUE (Availability)
// router.get('/venue/:venueId', (req, res) => {
//     const sql = `
//         SELECT b.booking_date, s.start_time, s.end_time 
//         FROM bookings b
//         JOIN slots s ON b.slot_id = s.id
//         WHERE b.venue_id = ? AND b.status = 'CONFIRMED'
//     `;
    
//     pool.query(sql, [req.params.venueId], (err, data) => {
//         if (err) return res.status(500).send(result.createResult(err.message));
//         res.send(result.createResult(null, data));
//     });
// });

// // 3. CREATE BOOKING
// router.post('/', verifyToken, (req, res) => {
//     const { venue_id, slot_id, booking_date, total_amount } = req.body;
//     const booking_number = 'BK-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

//     const sql = `INSERT INTO bookings 
//         (booking_number, user_id, venue_id, slot_id, booking_date, total_amount, status, payment_status) 
//         VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED', 'PENDING')`;
    
//     pool.query(sql, 
//         [booking_number, req.user.id, venue_id, slot_id, booking_date, total_amount], 
//         (err, data) => {
//             if (err) return res.status(500).send(result.createResult(err.message));
//             res.status(201).send(result.createResult(null, { 
//                 message: 'Booking created', 
//                 id: data.insertId,
//                 booking_number: booking_number 
//             }));
//         }
//     );
// });

// // 4. CANCEL BOOKING
// router.delete('/:id', verifyToken, (req, res) => {
//     const sql = "UPDATE bookings SET status = 'CANCELLED' WHERE id = ? AND user_id = ?";
//     pool.query(sql, [req.params.id, req.user.id], (err, data) => {
//         if (err) return res.status(500).send(result.createResult(err.message));
//         if (data.affectedRows === 0) return res.status(403).send(result.createResult("Booking not found or not authorized"));
//         res.send(result.createResult(null, { message: 'Booking cancelled' }));
//     });
// });

// module.exports = router;

const express = require('express');
const pool = require('../utils/db');
const result = require('../utils/result');
const { verifyToken } = require('../utils/authUser');

const router = express.Router();

//  SLOT MANAGEMENT ROUTES (VENDOR)

// GENERATE SLOTS FOR A VENUE (Vendor)
router.post('/slots', verifyToken, (req, res) => {
    const { venue_id, date, time_slots } = req.body;
    
    if (req.user.role !== 'VENDOR') {
        return res.status(403).send(result.createResult("Only vendors can create slots"));
    }
    
    if (!venue_id || !date || !time_slots || !Array.isArray(time_slots)) {
        return res.status(400).send(result.createResult("Invalid input. Required: venue_id, date, time_slots array"));
    }
    
    // Verify venue ownership
    const checkSql = 'SELECT id, price_per_hour FROM venues WHERE id = ? AND vendor_user_id = ?';
    
    pool.query(checkSql, [venue_id, req.user.id], (err, venueData) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (venueData.length === 0) {
            return res.status(403).send(result.createResult("Venue not found or unauthorized"));
        }
        
        // Prepare bulk insert
        const values = [];
        const placeholders = [];
        
        time_slots.forEach(slot => {
            if (!slot.start_time || !slot.end_time) {
                return res.status(400).send(result.createResult("Each slot must have start_time and end_time"));
            }
            
            placeholders.push('(?, ?, ?, ?, ?, ?)');
            values.push(
                venue_id,
                date,
                slot.start_time,
                slot.end_time,
                slot.price_override || null,
                1 // is_available = true
            );
        });
        
        const sql = `
            INSERT INTO slots (venue_id, date, start_time, end_time, price_override, is_available)
            VALUES ${placeholders.join(', ')}
        `;
        
        pool.query(sql, values, (err, data) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send(result.createResult("Some slots already exist for this date and time"));
                }
                return res.status(500).send(result.createResult(err.message));
            }
            
            res.status(201).send(result.createResult(null, { 
                message: `${time_slots.length} slots created successfully`,
                slots_created: time_slots.length
            }));
        });
    });
});

// DELETE SLOT (Vendor - Only if not booked)
router.delete('/slots/:id', verifyToken, (req, res) => {
    if (req.user.role !== 'VENDOR') {
        return res.status(403).send(result.createResult("Only vendors can delete slots"));
    }
    
    // Check if slot belongs to vendor's venue and is not booked
    const checkSql = `
        SELECT s.id, s.venue_id, s.is_available
        FROM slots s
        JOIN venues v ON s.venue_id = v.id
        WHERE s.id = ? AND v.vendor_user_id = ?
    `;
    
    pool.query(checkSql, [req.params.id, req.user.id], (err, slotData) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (slotData.length === 0) {
            return res.status(403).send(result.createResult("Slot not found or unauthorized"));
        }
        
        // Check if slot has bookings
        const bookingSql = 'SELECT COUNT(*) as count FROM bookings WHERE slot_id = ? AND status != "CANCELLED"';
        
        pool.query(bookingSql, [req.params.id], (err, bookingData) => {
            if (err) return res.status(500).send(result.createResult(err.message));
            
            if (bookingData[0].count > 0) {
                return res.status(400).send(result.createResult("Cannot delete slot with active bookings"));
            }
            
            const sql = 'DELETE FROM slots WHERE id = ?';
            
            pool.query(sql, [req.params.id], (err, data) => {
                if (err) return res.status(500).send(result.createResult(err.message));
                res.send(result.createResult(null, { message: 'Slot deleted successfully' }));
            });
        });
    });
});

// GET VENDOR'S VENUE SLOTS (Vendor)
router.get('/vendor/slots', verifyToken, (req, res) => {
    if (req.user.role !== 'VENDOR') {
        return res.status(403).send(result.createResult("Vendor access required"));
    }
    
    const { venue_id, date } = req.query;
    
    let sql = `
        SELECT s.*, v.name as venue_name,
               COALESCE(s.price_override, v.price_per_hour) as final_price
        FROM slots s
        JOIN venues v ON s.venue_id = v.id
        WHERE v.vendor_user_id = ?
    `;
    
    const params = [req.user.id];
    
    if (venue_id) {
        sql += ' AND s.venue_id = ?';
        params.push(venue_id);
    }
    
    if (date) {
        sql += ' AND s.date = ?';
        params.push(date);
    } else {
        sql += ' AND s.date >= CURDATE()';
    }
    
    sql += ' ORDER BY s.date ASC, s.start_time ASC';
    
    pool.query(sql, params, (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        res.send(result.createResult(null, data));
    });
});

// ==================== PUBLIC ROUTES ====================

// GET AVAILABLE SLOTS FOR A VENUE (Public)
router.get('/venue/:venueId', (req, res) => {
    const { date, start_date, end_date } = req.query;
    const venueId = req.params.venueId;
    
    let sql = `
        SELECT s.*, 
               v.price_per_hour as venue_price,
               COALESCE(s.price_override, v.price_per_hour) as final_price,
               CASE 
                   WHEN b.id IS NOT NULL THEN 'BOOKED'
                   WHEN s.is_available = 1 THEN 'AVAILABLE'
                   ELSE 'UNAVAILABLE'
               END as status
        FROM slots s
        JOIN venues v ON s.venue_id = v.id
        LEFT JOIN bookings b ON s.id = b.slot_id AND b.status IN ('PENDING', 'CONFIRMED')
        WHERE s.venue_id = ?
    `;
    
    const params = [venueId];
    
    if (date) {
        sql += ' AND s.date = ?';
        params.push(date);
    } else if (start_date && end_date) {
        sql += ' AND s.date BETWEEN ? AND ?';
        params.push(start_date, end_date);
    } else {
        sql += ' AND s.date >= CURDATE()';
    }
    
    sql += ' ORDER BY s.date ASC, s.start_time ASC';
    
    pool.query(sql, params, (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        res.send(result.createResult(null, data));
    });
});


// CREATE BOOKING (User)
router.post('/', verifyToken, (req, res) => {
    const { venue_id, slot_id, idempotency_key } = req.body;
    const userId = req.user.id;
    
    if (!venue_id || !slot_id) {
        return res.status(400).send(result.createResult("venue_id and slot_id are required"));
    }
    
    
    if (idempotency_key) {
        const dupSql = 'SELECT id, booking_number FROM bookings WHERE idempotency_key = ?';
        pool.query(dupSql, [idempotency_key], (err, dupData) => {
            if (err) return res.status(500).send(result.createResult(err.message));
            if (dupData.length > 0) {
                return res.status(200).send(result.createResult(null, {
                    message: 'Booking already exists',
                    booking_id: dupData[0].id,
                    booking_number: dupData[0].booking_number
                }));
            }
            createBooking();
        });
    } else {
        createBooking();
    }
    
    function createBooking() {
       
        const checkSql = `
            SELECT s.*, v.price_per_hour, v.approval_status,
                   COALESCE(s.price_override, v.price_per_hour) as final_price
            FROM slots s
            JOIN venues v ON s.venue_id = v.id
            WHERE s.id = ? AND s.venue_id = ? AND s.is_available = 1
              AND v.approval_status = 'APPROVED' AND s.date >= CURDATE()
        `;
        
        pool.query(checkSql, [slot_id, venue_id], (err, slotData) => {
            if (err) return res.status(500).send(result.createResult(err.message));
            if (slotData.length === 0) {
                return res.status(400).send(result.createResult("Slot not available or venue not approved"));
            }
            
            const slot = slotData[0];
            
           
            const bookingCheckSql = 'SELECT id FROM bookings WHERE slot_id = ? AND status IN ("PENDING", "CONFIRMED")';
            
            pool.query(bookingCheckSql, [slot_id], (err, existingBooking) => {
                if (err) return res.status(500).send(result.createResult(err.message));
                if (existingBooking.length > 0) {
                    return res.status(400).send(result.createResult("This slot is already booked"));
                }
                
                const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
                
                const insertSql = `
                    INSERT INTO bookings 
                    (booking_number, user_id, venue_id, slot_id, booking_date, total_amount, status, payment_status, idempotency_key)
                    VALUES (?, ?, ?, ?, ?, ?, 'PENDING', 'PENDING', ?)
                `;
                
                pool.query(insertSql, [bookingNumber, userId, venue_id, slot_id, slot.date, slot.final_price, idempotency_key || null], (err, data) => {
                    if (err) return res.status(500).send(result.createResult(err.message));
                    
                    const updateSlotSql = 'UPDATE slots SET is_available = 0 WHERE id = ?';
                    
                    pool.query(updateSlotSql, [slot_id], (err) => {
                        if (err) {
                            pool.query('DELETE FROM bookings WHERE id = ?', [data.insertId]);
                            return res.status(500).send(result.createResult("Booking failed, please try again"));
                        }
                        
                        res.status(201).send(result.createResult(null, {
                            message: 'Booking created successfully',
                            booking_id: data.insertId,
                            booking_number: bookingNumber,
                            amount: slot.final_price
                        }));
                    });
                });
            });
        });
    }
});

// GET USER'S BOOKINGS (User)
router.get('/', verifyToken, (req, res) => {
    const { status } = req.query;
    
    let sql = `
        SELECT b.*, 
               v.name as venue_name, v.city, v.address,
               s.date as slot_date, s.start_time, s.end_time,
               sc.name as sport_name
        FROM bookings b
        JOIN venues v ON b.venue_id = v.id
        JOIN slots s ON b.slot_id = s.id
        JOIN sports_categories sc ON v.sport_category_id = sc.id
        WHERE b.user_id = ?
    `;
    
    const params = [req.user.id];
    
    if (status) {
        sql += ' AND b.status = ?';
        params.push(status);
    }
    
    sql += ' ORDER BY b.created_at DESC';
    
    pool.query(sql, params, (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        res.send(result.createResult(null, data));
    });
});

// GET SINGLE BOOKING DETAILS (User)
router.get('/:id', verifyToken, (req, res) => {
    const sql = `
        SELECT b.*, 
               v.name as venue_name, v.city, v.address, v.amenities,
               s.date as slot_date, s.start_time, s.end_time,
               sc.name as sport_name,
               u.first_name as vendor_name, u.phone as vendor_phone
        FROM bookings b
        JOIN venues v ON b.venue_id = v.id
        JOIN slots s ON b.slot_id = s.id
        JOIN sports_categories sc ON v.sport_category_id = sc.id
        JOIN users u ON v.vendor_user_id = u.id
        WHERE b.id = ? AND b.user_id = ?
    `;
    
    pool.query(sql, [req.params.id, req.user.id], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (data.length === 0) {
            return res.status(404).send(result.createResult("Booking not found"));
        }
        res.send(result.createResult(null, data[0]));
    });
});

// CANCEL BOOKING (User)
router.delete('/:id', verifyToken, (req, res) => {
    const bookingId = req.params.id;
    const userId = req.user.id;
    
    const checkSql = 'SELECT slot_id, status FROM bookings WHERE id = ? AND user_id = ?';
    
    pool.query(checkSql, [bookingId, userId], (err, bookingData) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (bookingData.length === 0) {
            return res.status(403).send(result.createResult("Booking not found or unauthorized"));
        }
        
        const booking = bookingData[0];
        
        if (booking.status === 'CANCELLED') {
            return res.status(400).send(result.createResult("Booking already cancelled"));
        }
        
        const updateBookingSql = 'UPDATE bookings SET status = "CANCELLED" WHERE id = ?';
        
        pool.query(updateBookingSql, [bookingId], (err) => {
            if (err) return res.status(500).send(result.createResult(err.message));
            
            const updateSlotSql = 'UPDATE slots SET is_available = 1 WHERE id = ?';
            
            pool.query(updateSlotSql, [booking.slot_id], (err) => {
                if (err) {
                    console.error("Failed to release slot:", err);
                }
                
                res.send(result.createResult(null, { 
                    message: 'Booking cancelled successfully' 
                }));
            });
        });
    });
});

// UPDATE PAYMENT STATUS (After payment gateway callback)
router.put('/:id/payment', verifyToken, (req, res) => {
    const { payment_status, payment_reference } = req.body;
    const bookingId = req.params.id;
    
    if (!payment_status || !['PAID', 'REFUNDED'].includes(payment_status)) {
        return res.status(400).send(result.createResult("Invalid payment status"));
    }
    
    const checkSql = 'SELECT id, status FROM bookings WHERE id = ? AND user_id = ?';
    
    pool.query(checkSql, [bookingId, req.user.id], (err, bookingData) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (bookingData.length === 0) {
            return res.status(403).send(result.createResult("Booking not found or unauthorized"));
        }
        
        let updateSql = 'UPDATE bookings SET payment_status = ?';
        const params = [payment_status];
        
        if (payment_reference) {
            updateSql += ', payment_reference = ?';
            params.push(payment_reference);
        }
        
        if (payment_status === 'PAID') {
            updateSql += ', status = "CONFIRMED"';
        }
        
        updateSql += ' WHERE id = ?';
        params.push(bookingId);
        
        pool.query(updateSql, params, (err) => {
            if (err) return res.status(500).send(result.createResult(err.message));
            res.send(result.createResult(null, { 
                message: 'Payment status updated successfully' 
            }));
        });
    });
});

//  VENDOR ROUTES (AUTHENTICATED)

// GET BOOKINGS FOR VENDOR'S VENUES (Vendor)
router.get('/vendor/bookings', verifyToken, (req, res) => {
    if (req.user.role !== 'VENDOR') {
        return res.status(403).send(result.createResult("Vendor access required"));
    }
    
    const { status, venue_id } = req.query;
    
    let sql = `
        SELECT b.*, 
               v.name as venue_name,
               s.date as slot_date, s.start_time, s.end_time,
               u.first_name, u.last_name, u.email, u.phone
        FROM bookings b
        JOIN venues v ON b.venue_id = v.id
        JOIN slots s ON b.slot_id = s.id
        JOIN users u ON b.user_id = u.id
        WHERE v.vendor_user_id = ?
    `;
    
    const params = [req.user.id];
    
    if (status) {
        sql += ' AND b.status = ?';
        params.push(status);
    }
    
    if (venue_id) {
        sql += ' AND b.venue_id = ?';
        params.push(venue_id);
    }
    
    sql += ' ORDER BY s.date DESC, s.start_time DESC';
    
    pool.query(sql, params, (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        res.send(result.createResult(null, data));
    });
});

// CONFIRM BOOKING (Vendor)
router.put('/:id/confirm', verifyToken, (req, res) => {
    if (req.user.role !== 'VENDOR') {
        return res.status(403).send(result.createResult("Vendor access required"));
    }
    
    const bookingId = req.params.id;
    
    // Verify booking belongs to vendor's venue
    const checkSql = `
        SELECT b.id FROM bookings b
        JOIN venues v ON b.venue_id = v.id
        WHERE b.id = ? AND v.vendor_user_id = ?
    `;
    
    pool.query(checkSql, [bookingId, req.user.id], (err, data) => {
        if (err) return res.status(500).send(result.createResult(err.message));
        if (data.length === 0) {
            return res.status(403).send(result.createResult("Booking not found or unauthorized"));
        }
        
        const sql = 'UPDATE bookings SET status = "CONFIRMED" WHERE id = ?';
        
        pool.query(sql, [bookingId], (err) => {
            if (err) return res.status(500).send(result.createResult(err.message));
            res.send(result.createResult(null, { message: 'Booking confirmed successfully' }));
        });
    });
});

module.exports = router;