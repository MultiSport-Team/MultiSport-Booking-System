import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { USER_ROLES } from '../../utils/config';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user, userRole } = useSelector((state) => state.auth);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    navigate('/login');
    window.location.reload();
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Hide navbar on auth pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container-fluid">
        <a className="navbar-brand fw-bold" href="/home" onClick={() => handleNavigation('/home')}>
          <i className="bi bi-trophy me-2"></i>MultiSport
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {/* User Navigation */}
            {isAuthenticated && userRole === USER_ROLES.USER && (
              <>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => handleNavigation('/home')}
                  >
                    Home
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => handleNavigation('/my-bookings')}
                  >
                    My Bookings
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => handleNavigation('/settings')}
                  >
                    Settings
                  </button>
                </li>
              </>
            )}

            {/* Vendor Navigation */}
            {isAuthenticated && userRole === USER_ROLES.VENDOR && (
              <>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => handleNavigation('/vendor/dashboard')}
                  >
                    Dashboard
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => handleNavigation('/vendor/venues')}
                  >
                    Venues
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => handleNavigation('/vendor/bookings')}
                  >
                    Bookings
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => handleNavigation('/vendor/payments')}
                  >
                    Payments
                  </button>
                </li>
              </>
            )}

            {/* Admin Navigation */}
            {isAuthenticated && userRole === USER_ROLES.ADMIN && (
              <>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => handleNavigation('/admin/dashboard')}
                  >
                    Dashboard
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => handleNavigation('/admin/users')}
                  >
                    Users
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => handleNavigation('/admin/pending-venues')}
                  >
                    Venues
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => handleNavigation('/admin/categories')}
                  >
                    Categories
                  </button>
                </li>
              </>
            )}

            {/* Auth Links */}
            {isAuthenticated ? (
              <>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="userDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    {user?.first_name || 'User'}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li>
                      <a className="dropdown-item" href="#" onClick={() => handleNavigation('/settings')}>
                        Profile
                      </a>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <a className="dropdown-item text-danger" href="#" onClick={handleLogout}>
                        Logout
                      </a>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => handleNavigation('/login')}
                  >
                    Login
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-primary ms-2"
                    onClick={() => handleNavigation('/signup')}
                  >
                    Sign Up
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
