import { useState } from "react";
import { registerUser } from "../services/userService";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

function Signup() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  // const [role, setRole] = useState("");

  const signup = async () => {
    
    if (!firstName || !email || !password) {
      toast.error("First name, email and password are required");
      return;
    }
    
    const result = await registerUser(firstName,lastName,email,phone,password);

    if (!result) {
    // error toast already shown from service
    return;
  }
  
    if (result.status === "success") {
      toast.success("Signup Successful");
      navigate("/login");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="container w-75 mt-4">
      <h2 className="mb-4 text-center">Signup</h2>

      <div className="mb-3">
        <label htmlFor="firstName" className="form-label">
          First Name
        </label>
        <input
          type="text"
          className="form-control"
          id="firstName"
          placeholder="Enter first name"
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="lastName" className="form-label">
          Last Name
        </label>
        <input
          type="text"
          className="form-control"
          id="lastName"
          placeholder="Enter last name"
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          type="email"
          className="form-control"
          id="email"
          placeholder="name@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="phone" className="form-label">
          Phone
        </label>
        <input
          type="tel"
          className="form-control"
          id="phone"
          placeholder="9999999999"
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          type="password"
          id="password"
          className="form-control"
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="form-text">
          Your password must be 8–20 characters long and contain letters and
          numbers.
        </div>
      </div>

      

      <div className="mb-3">
        <button className="btn btn-success w-100" onClick={signup}>
          Signup
        </button>
      </div>

      <div className="text-center">
        <span>Already have an account? </span>
        <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

export default Signup;
