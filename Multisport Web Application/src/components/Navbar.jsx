import { Link, useNavigate } from "react-router-dom"

function Navbar() {
  const navigate = useNavigate()
  const token = sessionStorage.getItem("token")

  const logout = () => {
    sessionStorage.clear()
    navigate("/login")
  }

  return (
    <div style={{ padding: 15, background: "#222", color: "white" }}>
      <Link to="/" style={{ margin: 10, color: "white" }}>Sports Venues</Link>
      <Link to="/bookings" style={{ margin: 10, color: "white" }}>My Bookings</Link>

      {!token && <>
        <Link to="/login" style={{ margin: 10, color: "white" }}>Login</Link>
        <Link to="/signup" style={{ margin: 10, color: "white" }}>Signup</Link>
      </>}

      {token && <button onClick={logout}>Logout</button>}
    </div>
  )
}

export default Navbar
