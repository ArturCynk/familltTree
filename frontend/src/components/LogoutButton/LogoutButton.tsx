// LogoutButton.tsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const LogoutButton: React.FC = () => {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <button
      className="p-2 rounded hover:bg-gray-200 relative flex items-center group"
      onClick={handleLogout}
      onMouseEnter={() => setTooltip('Wyloguj')}
      onMouseLeave={() => setTooltip(null)}
    >
      <FontAwesomeIcon icon={faSignOutAlt} className="text-gray-800" />
      {tooltip === 'Wyloguj' && (
        <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
          Wyloguj
        </div>
      )}
    </button>
  );
};

export default LogoutButton;
