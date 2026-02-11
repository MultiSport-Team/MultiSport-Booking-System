import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';

const ManagePendingVenuesPage = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState(null);

  useEffect(() => {
    loadPendingVenues();
  }, []);

  const loadPendingVenues = async () => {
    try {
      const result = await adminService.getPendingVenues();
      if (result.success) {
        setVenues(result.data || []);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to load pending venues');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (venueId, approval_status) => {
    try {
      const result = await adminService.updateVenueApproval(venueId, approval_status);
      if (result.success) {
        setVenues(venues.filter(v => v.id !== venueId));
        const statusText = approval_status === 'APPROVED' ? 'approved' : 'rejected';
        toast.success(`Venue ${statusText} successfully`);
        setSelectedVenue(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update venue approval');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border"></div></div>;
  }

  return (
    <div className="container py-5">
      <h2>Approve Pending Venues</h2>

      {venues.length === 0 ? (
        <div className="alert alert-info">No pending venues to approve</div>
      ) : (
        <div className="row mt-4">
          {venues.map(venue => (
            <div key={venue.id} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{venue.name}</h5>
                  <p className="card-text">
                    <strong>Location:</strong> {venue.city}, {venue.state}<br />
                    <strong>Address:</strong> {venue.address}<br />
                    <strong>Price:</strong> ₹{venue.price_per_hour}/hour<br />
                    <strong>Description:</strong> {venue.description}
                  </p>
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => setSelectedVenue(venue)}
                    data-bs-toggle="modal"
                    data-bs-target="#venueModal"
                  >
                    View Details
                  </button>
                  <button
                    className="btn btn-sm btn-success ms-2"
                    onClick={() => handleApproveReject(venue.id, 'APPROVED')}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-sm btn-danger ms-2"
                    onClick={() => handleApproveReject(venue.id, 'REJECTED')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for venue details */}
      {selectedVenue && (
        <div className="modal fade" id="venueModal" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedVenue.name}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                <p><strong>City:</strong> {selectedVenue.city}</p>
                <p><strong>State:</strong> {selectedVenue.state}</p>
                <p><strong>Address:</strong> {selectedVenue.address}</p>
                <p><strong>Price per Hour:</strong> ₹{selectedVenue.price_per_hour}</p>
                <p><strong>Sport Category:</strong> {selectedVenue.sport_category_id}</p>
                <p><strong>Description:</strong> {selectedVenue.description}</p>
                <p><strong>Vendor ID:</strong> {selectedVenue.vendor_id}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePendingVenuesPage;
