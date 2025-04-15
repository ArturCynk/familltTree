import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const LogoutButton: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsActive(true);
    setTimeout(() => {
      localStorage.removeItem('authToken');
      toast.success('Wylogowano pomyślnie!', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: true,
      });
      navigate('/login'); // Redirect to login instead of home
    }, 300);
  };

  return (
    <div className="relative">
      <button
        className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${
          isHovered 
            ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md' 
            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
        } ${
          isActive ? 'transform scale-95' : ''
        }`}
        onClick={handleLogout}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Wyloguj"
      >
        <FontAwesomeIcon 
          icon={faSignOutAlt} 
          className={`transition-transform duration-300 ${isHovered ? 'transform rotate-180' : ''}`}
        />
      </button>

      {/* Tooltip */}
      <div className={`absolute left-full top-1/2 transform -translate-y-1/2 ml-3 ${
        isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'
      } transition-all duration-300 pointer-events-none`}>
        <div className="bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-100 text-sm font-medium rounded-lg py-1.5 px-3 whitespace-nowrap shadow-lg">
          Wyloguj się
          <div className="absolute right-full top-1/2 w-2 h-2 -mt-1 -mr-1 bg-gray-800 dark:bg-gray-700 transform rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

export default LogoutButton;