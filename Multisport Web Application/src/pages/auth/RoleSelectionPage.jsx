import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleSelection.css';

const RoleSelectionPage = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'user',
      title: 'User Login',
      description: 'Book sports venues and manage your bookings',
      icon: '👤',
      path: '/login',
      color: 'primary',
    },
    {
      id: 'vendor',
      title: 'Vendor Login',
      description: 'Manage your venues and view bookings',
      icon: '🏢',
      path: '/login',
      color: 'success',
    },
    {
      id: 'admin',
      title: 'Admin Login',
      description: 'Manage platform and user activities',
      icon: '�',
      path: '/admin/login',
      color: 'danger',
    },
  ];

  const handleRoleSelect = (role) => {
    if (role.id === 'admin') {
      navigate('/admin/login');
    } else {
      // For user and vendor, go to login but store role preference
      localStorage.setItem('LOGIN_ROLE_PREFERENCE', role.id);
      navigate('/login');
    }
  };

  return (
    <div className="role-selection-container">
      <div className="role-selection-header">
        <h1>Welcome to MultiSport</h1>
        <p>Select your login type to continue</p>
      </div>

      <div className="role-cards-grid">
        {roles.map((role) => (
          <div key={role.id} className={`role-card role-card-${role.color}`}>
            <div className="role-icon">{role.icon}</div>
            <h2 className="role-title">{role.title}</h2>
            <p className="role-description">{role.description}</p>
            <button
              className={`btn btn-${role.color} btn-lg w-100 mt-4`}
              onClick={() => handleRoleSelect(role)}
            >
              Continue as {role.title}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelectionPage;
