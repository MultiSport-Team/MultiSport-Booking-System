import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import venueService from '../../services/venueService';

const ManageVenuesPage = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      const result = await venueService.getVendorVenues();
      if (result.success) {
        setVenues(result.data || []);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to load venues');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVenue = async (venueId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const result = await venueService.deleteVenue(venueId);
      if (result.success) {
        toast.success('Venue deleted');
        loadVenues();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete venue');
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Venues</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/vendor/add-venue')}
        >
          Add Venue
        </button>
      </div>

      {venues.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Venue Name</th>
                <th>Location</th>
                <th>Price/hr</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((venue) => (
                <tr key={venue.id}>
                  <td>{venue.name}</td>
                  <td>{venue.city}</td>
                  <td>₹{venue.price_per_hour}</td>
                  <td>
                    <span className="badge bg-success">{venue.approval_status}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-info me-2"
                      onClick={() => navigate(`/vendor/edit-venue/${venue.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteVenue(venue.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted">No venues found. Create your first venue!</p>
      )}
    </div>
  );
};

export default ManageVenuesPage;
