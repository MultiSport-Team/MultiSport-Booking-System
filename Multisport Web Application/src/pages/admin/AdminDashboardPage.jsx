import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const result = await adminService.getAdminStats();
      if (result.success) {
        setStats(result.data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to load statistics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border"></div></div>;
  }

  return (
    <div className="container py-5">
      <h2>Admin Dashboard</h2>

      {stats && (
        <div className="row mt-4">
          <div className="col-md-3">
            <div className="card text-white bg-primary mb-3">
              <div className="card-body">
                <h5 className="card-title">Total Users</h5>
                <p style={{ fontSize: '2rem' }}>{stats.total_users || 0}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-success mb-3">
              <div className="card-body">
                <h5 className="card-title">Total Venues</h5>
                <p style={{ fontSize: '2rem' }}>{stats.total_venues || 0}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-info mb-3">
              <div className="card-body">
                <h5 className="card-title">Total Bookings</h5>
                <p style={{ fontSize: '2rem' }}>{stats.total_bookings || 0}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-warning mb-3">
              <div className="card-body">
                <h5 className="card-title">Total Revenue</h5>
                <p style={{ fontSize: '2rem' }}>₹{stats.total_revenue || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row mt-5">
        <div className="col-md-12">
          <h5>Management</h5>
          <div className="btn-group" role="group">
            <a href="/admin/users" className="btn btn-primary">Manage Users</a>
            <a href="/admin/pending-venues" className="btn btn-primary">Approve Venues</a>
            <a href="/admin/bookings" className="btn btn-primary">View Bookings</a>
            <a href="/admin/categories" className="btn btn-primary">Sport Categories</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
