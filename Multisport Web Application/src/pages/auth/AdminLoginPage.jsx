import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import { loginSuccess } from '../../store/authSlice';
import './Auth.css';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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
        
        // Check if user is actually an admin
        if (userData.role !== 'ADMIN') {
          toast.error('This account is not an admin account. Please use user or vendor login.');
          setFormData({ email: '', password: '' });
          setLoading(false);
          return;
        }
        
        dispatch(loginSuccess({ user: userData, token: userData.token }));
        toast.success('Admin login successful!');
        navigate('/admin/dashboard');
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
          <div className="admin-icon">🔐</div>
          <h1 className="auth-title">Admin Login</h1>
          <p className="auth-subtitle">Sign in to Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-admin w-100 mb-3"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Login as Admin'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an admin account?{' '}
            <Link to="/signup/admin" className="auth-link">
              Register here
            </Link>
          </p>
          <p className="mt-2">
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={() => navigate('/')}
            >
              Back to role selection
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
