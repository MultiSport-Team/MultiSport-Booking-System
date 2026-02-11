import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getVenueSlots, createBooking } from "../services/bookingService"
import { toast } from "react-toastify"

function Booking() {
  const { venueId } = useParams()
  const [slots, setSlots] = useState([])
  const [date, setDate] = useState("")
  const [loading, setLoading] = useState(false)

  // Load slots from backend
  const loadSlots = async () => {
    setLoading(true)
    const result = await getVenueSlots(venueId, date)
    console.log("Slots API result:", result)

    if (result && result.status === "success") {
      setSlots(result.data)
    } else {
      setSlots([])
    }
    setLoading(false)
  }

  // Load slots initially
  useEffect(() => {
    loadSlots()
  }, [])

  // Book slot
  const bookSlot = async (slotId) => {
    const result = await createBooking(venueId, slotId)

    if (!result) return

    if (result.status === "success") {
      toast.success("Booking successful")
      loadSlots() // refresh slots
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="container mt-4">

      <h2 className="mb-3">Book a Slot</h2>

      {/* Date filter */}
      <div className="mb-3 w-25">
        <label className="form-label">Select Date</label>
        <input
          type="date"
          className="form-control"
          onChange={(e) => setDate(e.target.value)}
        />
        <button className="btn btn-primary mt-2" onClick={loadSlots}>
          Search Slots
        </button>
      </div>

      <hr />

      {loading && <p>Loading slots...</p>}

      {!loading && slots.length === 0 && (
        <p className="text-danger">No slots found</p>
      )}

      {/* Slot list */}
      {slots.map(slot => (
        <div
          key={slot.id}
          className="border rounded p-2 mb-2 d-flex justify-content-between align-items-center"
        >
          <div>
            <b>{slot.date}</b> | {slot.start_time} - {slot.end_time}
            <span className="ms-3">₹ {slot.final_price}</span>
            <span className="ms-3 badge bg-info">{slot.status}</span>
          </div>

          {slot.status === "AVAILABLE" && (
            <button
              className="btn btn-success"
              onClick={() => bookSlot(slot.id)}
            >
              Book
            </button>
          )}
        </div>
      ))}

    </div>
  )
}

export default Booking
