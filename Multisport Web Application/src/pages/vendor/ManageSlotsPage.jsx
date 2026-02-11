import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import venueService from '../../services/venueService';
import bookingService from '../../services/bookingService';
import './VendorPages.css';

const ManageSlotsPage = () => {
  // State Management
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    date: '',
    timeSlots: [{ start_time: '10:00', end_time: '11:00' }],
  });

  // Load vendor venues on mount
  useEffect(() => {
    loadVenues();
  }, []);

  // Load slots when venue is selected
  useEffect(() => {
    if (selectedVenue?.id) {
      loadSlots();
    } else {
      setSlots([]);
    }
  }, [selectedVenue]);

  const loadVenues = async () => {
    setLoading(true);
    try {
      const result = await venueService.getVendorVenues();
      if (result.success) {
        const venuesList = result.data || [];
        setVenues(venuesList);
        // Auto-select first venue if available
        if (venuesList.length > 0) {
          setSelectedVenue(venuesList[0]);
        }
      } else {
        toast.error(result.message || 'Failed to load venues');
      }
    } catch (error) {
      toast.error('Failed to load venues');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async () => {
    if (!selectedVenue) return;
    setLoading(true);
    try {
      const result = await bookingService.getVendorSlots({
        venue_id: selectedVenue.id,
      });
      if (result.success) {
        setSlots(result.data || []);
      } else {
        toast.error(result.message || 'Failed to load slots');
      }
    } catch (error) {
      toast.error('Failed to load slots');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVenueChange = (venueId) => {
    const venue = venues.find(v => v.id === parseInt(venueId));
    setSelectedVenue(venue);
  };

  const handleDateChange = (e) => {
    setFormData(prev => ({
      ...prev,
      date: e.target.value,
    }));
  };

  const handleAddTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { start_time: '12:00', end_time: '13:00' }],
    }));
  };

  const handleRemoveTimeSlot = (index) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index),
    }));
  };

  const handleTimeSlotChange = (index, field, value) => {
    setFormData(prev => {
      const updatedSlots = [...prev.timeSlots];
      updatedSlots[index] = { ...updatedSlots[index], [field]: value };
      return { ...prev, timeSlots: updatedSlots };
    });
  };

  const handleCreateSlots = async () => {
    if (!selectedVenue) {
      toast.error('Please select a venue');
      return;
    }

    if (!formData.date) {
      toast.error('Please select a date');
      return;
    }

    if (formData.timeSlots.length === 0) {
      toast.error('Please add at least one time slot');
      return;
    }

    // Validate time slots
    for (let slot of formData.timeSlots) {
      if (!slot.start_time || !slot.end_time) {
        toast.error('Please fill in all time slot fields');
        return;
      }
      if (slot.start_time >= slot.end_time) {
        toast.error('End time must be after start time');
        return;
      }
    }

    setSubmitting(true);
    try {
      const result = await bookingService.createSlots({
        venue_id: selectedVenue.id,
        date: formData.date,
        time_slots: formData.timeSlots,
      });

      if (result.success) {
        toast.success(`${formData.timeSlots.length} slot(s) created successfully!`);
        setShowModal(false);
        setFormData({
          date: '',
          timeSlots: [{ start_time: '10:00', end_time: '11:00' }],
        });
        loadSlots();
      } else {
        toast.error(result.message || 'Failed to create slots');
      }
    } catch (error) {
      toast.error('Failed to create slots');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) {
      return;
    }

    try {
      const result = await bookingService.deleteSlot(slotId);
      if (result.success) {
        toast.success('Slot deleted successfully');
        loadSlots();
      } else {
        toast.error(result.message || 'Failed to delete slot');
      }
    } catch (error) {
      toast.error('Failed to delete slot');
      console.error(error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      date: '',
      timeSlots: [{ start_time: '10:00', end_time: '11:00' }],
    });
  };

  const getSlotStatus = (slot) => {
    return slot.is_available ? 'Available' : 'Booked';
  };

  const getStatusBadgeClass = (slot) => {
    return slot.is_available ? 'badge-success' : 'badge-warning';
  };

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-md-8">
          <h2>📅 Manage Slots</h2>
          <p className="text-muted">Create and manage time slots for your venues</p>
        </div>
      </div>

      {/* Venue Selection */}
      <div className="card mb-4">
        <div className="card-body">
          <label className="form-label fw-bold">Select Venue</label>
          {venues.length === 0 ? (
            <div className="alert alert-info mb-0">
              📍 No venues found. <a href="/vendor/venues">Create a venue first</a>
            </div>
          ) : (
            <select
              className="form-select"
              value={selectedVenue?.id || ''}
              onChange={(e) => handleVenueChange(e.target.value)}
            >
              <option value="">-- Select a venue --</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} - {venue.city}, {venue.state}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Action Button */}
      {selectedVenue && (
        <div className="mb-4">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setShowModal(true)}
            disabled={loading}
          >
            ➕ Create New Slot
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading slots...</p>
        </div>
      )}

      {/* Slots List */}
      {!loading && selectedVenue && (
        <>
          {slots.length === 0 ? (
            <div className="alert alert-info text-center py-5">
              <h5>⏰ No slots created yet</h5>
              <p className="text-muted mb-0">Create your first slot to start accepting bookings</p>
            </div>
          ) : (
            <div className="row">
              {slots.map(slot => (
                <div key={slot.id} className="col-md-6 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="card-title mb-1">
                            📅 {new Date(slot.date).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </h6>
                          <p className="card-text">
                            <strong>⏱️ {slot.start_time} - {slot.end_time}</strong>
                          </p>
                        </div>
                        <span className={`badge ${getStatusBadgeClass(slot)}`}>
                          {getSlotStatus(slot)}
                        </span>
                      </div>
                      <hr />
                      <p className="card-text mb-2">
                        <small className="text-muted">
                          💰 Price: ₹{slot.final_price || slot.price_override || 'Standard'}
                        </small>
                      </p>
                      {slot.is_available && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteSlot(slot.id)}
                          disabled={loading}
                        >
                          🗑️ Delete
                        </button>
                      )}
                      {!slot.is_available && (
                        <small className="text-muted">❌ Cannot delete (already booked)</small>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Slots Modal */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">📅 Create New Slots</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseModal}
                disabled={submitting}
              />
            </div>

            <div className="modal-body">
              {/* Date Input */}
              <div className="mb-4">
                <label className="form-label fw-bold">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleDateChange}
                  disabled={submitting}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Time Slots */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label fw-bold mb-0">Time Slots</label>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleAddTimeSlot}
                    disabled={submitting}
                  >
                    ➕ Add Slot
                  </button>
                </div>

                {formData.timeSlots.map((slot, index) => (
                  <div key={index} className="d-flex gap-2 mb-2">
                    <input
                      type="time"
                      className="form-control"
                      value={slot.start_time}
                      onChange={(e) => handleTimeSlotChange(index, 'start_time', e.target.value)}
                      disabled={submitting}
                    />
                    <span className="input-group-text">to</span>
                    <input
                      type="time"
                      className="form-control"
                      value={slot.end_time}
                      onChange={(e) => handleTimeSlotChange(index, 'end_time', e.target.value)}
                      disabled={submitting}
                    />
                    {formData.timeSlots.length > 1 && (
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleRemoveTimeSlot(index)}
                        disabled={submitting}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseModal}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateSlots}
                disabled={submitting}
              >
                {submitting ? '⏳ Creating...' : '✅ Create Slots'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      {showModal && <div className="modal-backdrop fade show" />}
    </div>
  );
};

export default ManageSlotsPage;
