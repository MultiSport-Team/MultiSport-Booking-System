import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import bookingService from '../../services/bookingService';

const VendorBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const result = await bookingService.getVendorBookings();
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

  const handleConfirmBooking = async (bookingId) => {
    try {
      const result = await bookingService.confirmBooking(bookingId);
      if (result.success) {
        toast.success('Booking confirmed!');
        loadBookings();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to confirm booking');
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border"></div></div>;
  }

  return (
    <div className="container py-5">
      <h2>Bookings for Your Venues</h2>
      {bookings.length > 0 ? (
        <table className="table table-striped mt-4">
          <thead>
            <tr>
              <th>Booking #</th>
              <th>User</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.booking_number}</td>
                <td>{booking.user_name}</td>
                <td>{booking.booking_date}</td>
                <td>₹{booking.total_amount}</td>
                <td>{booking.status}</td>
                <td>
                  {booking.status === 'PENDING' && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleConfirmBooking(booking.id)}
                    >
                      Confirm
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-muted mt-4">No bookings yet</p>
      )}
    </div>
  );
};

export default VendorBookingsPage;
