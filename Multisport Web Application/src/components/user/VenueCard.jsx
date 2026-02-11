import React from 'react';
import { useNavigate } from 'react-router-dom';
import './user.css'; // Assuming you'll create this for user-specific styles

const VenueCard = ({ venue }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/venue-details/${venue.id}`);
  };

  return (
    <div className="venue-card card mb-3">
      <img
        src={venue.image_url || 'https://via.placeholder.com/400x200'}
        className="card-img-top"
        alt={venue.name}
      />
      <div className="card-body">
        <h5 className="card-title">{venue.name}</h5>
        <p className="card-text text-muted">{venue.city}, {venue.state}</p>
        <p className="card-text"><strong>Price:</strong> ₹{venue.price_per_hour} / hour</p>
        <button onClick={handleViewDetails} className="btn btn-primary btn-sm">
          View Details
        </button>
      </div>
    </div>
  );
};

export default VenueCard;
