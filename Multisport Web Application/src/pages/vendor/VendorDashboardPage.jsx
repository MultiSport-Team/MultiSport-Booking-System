import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import financeService from '../../services/financeService';
import bookingService from '../../services/bookingService';

const VendorDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // Load bookings for stats
      const result = await bookingService.getVendorBookings();
      if (result.success) {
        setBookings(result.data || []);
      }
      setStats({
        total_bookings: result.data?.length || 0,
        completed_bookings: result.data?.filter((b) => b.status === 'COMPLETED').length || 0,
        pending_bookings: result.data?.filter((b) => b.status === 'PENDING').length || 0,
      });
    } catch (error) {
      toast.error('Failed to load dashboard');
      console.error(error);
    } finally {
      setLoading(false);
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
    <div className="container py-5">
      <h2>Vendor Dashboard</h2>

      {stats && (
        <div className="row mt-4">
          <div className="col-md-4">
            <div className="card text-white bg-primary mb-3">
              <div className="card-body">
                <h5 className="card-title">Total Bookings</h5>
                <p className="card-text" style={{ fontSize: '2rem' }}>
                  {stats.total_bookings}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-success mb-3">
              <div className="card-body">
                <h5 className="card-title">Completed</h5>
                <p className="card-text" style={{ fontSize: '2rem' }}>
                  {stats.completed_bookings}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-warning mb-3">
              <div className="card-body">
                <h5 className="card-title">Pending</h5>
                <p className="card-text" style={{ fontSize: '2rem' }}>
                  {stats.pending_bookings}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row mt-5">
        <div className="col-md-12">
          <h5>Quick Actions</h5>
          <div className="btn-group" role="group">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/vendor/venues')}
            >
              Manage Venues
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/vendor/slots')}
            >
              Manage Slots
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/vendor/bookings')}
            >
              View Bookings
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/vendor/payments')}
            >
              View Payments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
