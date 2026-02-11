import { useEffect, useState } from "react"
import { getAllVenues, getVenueSlots } from "../services/venueService"
import { createBooking } from "../services/bookingService"

function Venues() {
  const [venues, setVenues] = useState([])
  const [slots, setSlots] = useState([])

  useEffect(() => {
    loadVenues()
  }, [])

  const loadVenues = async () => {
    const res = await getAllVenues()
    if (res?.status === "success") setVenues(res.data)
  }

  const loadSlots = async (id) => {
    const res = await getVenueSlots(id)
    if (res?.status === "success") setSlots(res.data)
  }

  const book = async (venueId, slotId) => {
    await createBooking(venueId, slotId)
    alert("Slot booked")
  }

  return (
    <div>
      <h2>Venues</h2>

      {venues.map(v => (
        <div key={v.id} style={{border:"1px solid gray", margin:10, padding:10}}>
          <h3>{v.name} - {v.city}</h3>
          <button onClick={() => loadSlots(v.id)}>View Slots</button>
        </div>
      ))}

      <h2>Slots</h2>
      {slots.map(s => (
        <div key={s.id}>
          {s.date} | {s.start_time} - {s.end_time} | {s.status}
          {s.status === "AVAILABLE" && 
            <button onClick={() => book(s.venue_id, s.id)}>Book</button>}
        </div>
      ))}
    </div>
  )
}

export default Venues
