import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import bookingService from '../../services/bookingService';
import './UserPages.css';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const result = await bookingService.getUserBookings();
      if (result.success) {
        setBookings(result.data || []);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to load bookings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const result = await bookingService.cancelBooking(bookingId);
      if (result.success) {
        toast.success('Booking cancelled');
        loadBookings();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <div className="container">
        <div className="bookings-header">
          <h2>My Bookings</h2>
          <p className="text-muted">Total: {bookings.length} bookings</p>
        </div>

        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header-row">
                <div className="booking-venue-name">{booking.venue_name}</div>
                <span className={`booking-status ${booking.status?.toLowerCase()}`}>
                  {booking.status}
                </span>
              </div>
              <div className="booking-details-row">
                <div className="booking-detail">
                  <div className="booking-detail-label">Booking #</div>
                  <div className="booking-detail-value">{booking.booking_number}</div>
                </div>
                <div className="booking-detail">
                  <div className="booking-detail-label">Date</div>
                  <div className="booking-detail-value">{booking.booking_date}</div>
                </div>
                <div className="booking-detail">
                  <div className="booking-detail-label">Amount</div>
                  <div className="booking-detail-value">₹{booking.total_amount}</div>
                </div>
                <div className="booking-detail">
                  <div className="booking-detail-label">Payment</div>
                  <div className="booking-detail-value">{booking.payment_status}</div>
                </div>
              </div>
              {booking.status === 'CONFIRMED' && (
                <div className="booking-actions">
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-5 bookings-container">
            <p className="text-muted">No bookings yet. Start booking venues!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
