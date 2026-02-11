import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';

const ManageBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    venue_id: ''
  });

  useEffect(() => {
    loadBookings();
  }, [filters]);

  const loadBookings = async () => {
    try {
      const result = await adminService.getAdminBookings(filters);
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border"></div></div>;
  }

  return (
    <div className="container py-5">
      <h2>Manage All Bookings</h2>

      <div className="row mt-4">
        <div className="col-md-4">
          <label className="form-label">Filter by Status</label>
          <select
            className="form-control"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="alert alert-info mt-4">No bookings found</div>
      ) : (
        <div className="table-responsive mt-4">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Booking ID</th>
                <th>User</th>
                <th>Venue</th>
                <th>Booking Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.user_name || `User #${booking.user_id}`}</td>
                  <td>{booking.venue_name || `Venue #${booking.venue_id}`}</td>
                  <td>{new Date(booking.booking_date).toLocaleDateString()}</td>
                  <td>₹{booking.total_amount}</td>
                  <td>
                    <span className={`badge bg-${getStatusBadgeClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge bg-${booking.payment_status === 'paid' ? 'success' : 'warning'}`}>
                      {booking.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageBookingsPage;
