import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import { loginSuccess } from '../../store/authSlice';
import './Auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [loginRole, setLoginRole] = useState('user'); // Default to user
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Get role preference from localStorage if available
  useEffect(() => {
    const rolePreference = localStorage.getItem('LOGIN_ROLE_PREFERENCE');
    if (rolePreference) {
      setLoginRole(rolePreference);
      localStorage.removeItem('LOGIN_ROLE_PREFERENCE'); // Clear it after use
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authService.login(formData.email, formData.password);

      if (result.success) {
        const userData = result.data;
        
        // Check if user role matches the login role they selected
        let userActualRole = userData.role;
        let expectedRole = loginRole === 'user' ? 'USER' : (loginRole === 'vendor' ? 'VENDOR' : 'ADMIN');
        
        if (userActualRole !== expectedRole) {
          toast.error(`This account is for ${userActualRole}, not for ${expectedRole} login`);
          setFormData({ email: '', password: '' });
          setLoading(false);
          return;
        }
        
        dispatch(loginSuccess({ user: userData, token: userData.token }));
        toast.success('Login successful!');

        // Redirect based on role
        if (userData.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (userData.role === 'VENDOR') {
          navigate('/vendor/dashboard');
        } else {
          navigate('/home');
        }
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Login as {loginRole.toUpperCase()}</h1>
          <p className="auth-subtitle">Welcome back to MultiSport</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group mb-3">
            <label className="form-label fw-bold mb-3">Select Login Type:</label>
            <div className="role-selection-inline">
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="loginRole"
                  id="userRole"
                  value="user"
                  checked={loginRole === 'user'}
                  onChange={(e) => setLoginRole(e.target.value)}
                />
                <label className="form-check-label" htmlFor="userRole">
                  👤 User
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="loginRole"
                  id="vendorRole"
                  value="vendor"
                  checked={loginRole === 'vendor'}
                  onChange={(e) => setLoginRole(e.target.value)}
                />
                <label className="form-check-label" htmlFor="vendorRole">
                  🏢 Vendor
                </label>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={() => navigate('/')}
            >
              Back to role selection
            </button>
          </p>
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Sign up here
            </Link>
          </p>
          <p className="mt-2">
            Are you an admin?{' '}
            <Link to="/signup/admin" className="auth-link">
              Admin signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
