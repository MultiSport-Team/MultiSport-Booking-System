import React from 'react';
import './Slots.css'; // We'll create this CSS file next

const Slots = ({ slots, selectedSlot, onSelectSlot }) => {
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="slots-container">
      {slots.length > 0 ? (
        slots.map((slot) => (
          <button
            key={slot.id}
            className={`slot-item btn ${
              selectedSlot && selectedSlot.id === slot.id
                ? 'btn-primary'
                : 'btn-outline-primary'
            }`}
            onClick={() => onSelectSlot(slot)}
            disabled={!slot.is_available}
          >
            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
            {!slot.is_available && ' (Booked)'}
          </button>
        ))
      ) : (
        <p className="text-muted">No slots available for the selected date.</p>
      )}
    </div>
  );
};

export default Slots;
