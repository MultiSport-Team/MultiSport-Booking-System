import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import bookingService from '../../services/bookingService';

const BookingPage = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation to get state
  const { venue, selectedSlot } = location.state || {}; // Destructure venue and selectedSlot

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    booking_date: selectedSlot?.date || '', // Pre-fill from selected slot
    slot_id: selectedSlot?.id || '', // Pre-fill from selected slot
  });

  useEffect(() => {
    if (!venue || !selectedSlot) {
      toast.error('Venue or slot information is missing.');
      navigate(`/venue-details/${venueId}`); // Redirect back if data is missing
    }
  }, [venue, selectedSlot, venueId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!venue || !selectedSlot) {
        toast.error('Missing venue or slot information.');
        setLoading(false);
        return;
      }

      const bookingData = {
        venue_id: venue.id,
        slot_id: selectedSlot.id,
        // No need for booking_date directly here if slot_id implies date
        // You might add an idempotency key here as well, similar to the mobile app
        idempotency_key: `booking-${venue.id}-${selectedSlot.id}-${Date.now()}`,
      };

      const result = await bookingService.createBooking(bookingData);
      if (result.success) {
        toast.success('Booking created successfully!');
        navigate(`/payment/${result.data.booking_id}`, {
          state: {
            bookingId: result.data.booking_id,
            bookingNumber: result.data.booking_number,
            amount: result.data.amount,
            venueName: venue.name,
            slotTime: `${formatTime(selectedSlot.start_time)} - ${formatTime(selectedSlot.end_time)}`,
            date: selectedSlot.date,
            // paymentMethod: selectedPayment, // This would come from a payment selection on this page
          },
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to create booking');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (!venue || !selectedSlot) {
    return (
      <div className="container py-5 text-center">
        <p>Loading booking details...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2>Confirm Your Booking</h2>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Venue: {venue.name}</h5>
          <p className="card-text"><strong>Date:</strong> {selectedSlot.date}</p>
          <p className="card-text"><strong>Time:</strong> {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}</p>
          <p className="card-text"><strong>Price:</strong> ₹{venue.price_per_hour} per hour</p>
          {/* Add more venue/slot details as needed */}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        {/* You could add payment method selection here if needed */}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Confirming...' : 'Proceed to Payment'}
        </button>
      </form>
    </div>
  );
};

export default BookingPage;
