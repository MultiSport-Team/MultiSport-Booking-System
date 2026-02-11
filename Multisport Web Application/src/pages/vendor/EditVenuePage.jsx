import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const EditVenuePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.success('Venue updated!');
    navigate('/vendor/venues');
  };

  return (
    <div className="container py-5">
      <h2>Edit Venue</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label className="form-label">Venue Name</label>
          <input type="text" className="form-control" required />
        </div>
        <button type="submit" className="btn btn-primary">Update Venue</button>
      </form>
    </div>
  );
};

export default EditVenuePage;
