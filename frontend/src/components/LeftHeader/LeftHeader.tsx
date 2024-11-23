import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faTree, faFan, faList, faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../LogoutButton/LogoutButton';

const LeftHeader: React.FC = () => {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const navigate = useNavigate();

  // Navigate to different views
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // Handle logout
  const handleLogout = () => {
    window.localStorage.clear();
    navigate('/');
  };

  return (
    <header className="relative">
      <div className="fixed top-0 left-0 h-full bg-white shadow-lg w-16 flex flex-col items-center">
        <div className="flex flex-col items-center mt-8 space-y-4">
          <button
            className="p-2 rounded hover:bg-gray-200 relative flex items-center group"
            onClick={() => handleNavigate('/family-view')}
            onMouseEnter={() => setTooltip('Widok rodzinny')}
            onMouseLeave={() => setTooltip(null)}
          >
            <FontAwesomeIcon icon={faTree} className="text-gray-800" />
            {tooltip === 'Widok rodzinny' && (
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Widok rodzinny
            </div>
            )}
          </button>
          <button
            className="p-2 rounded hover:bg-gray-200 relative flex items-center group"
            onClick={() => handleNavigate('/ancestry-view')}
            onMouseEnter={() => setTooltip('Widok rodowodu')}
            onMouseLeave={() => setTooltip(null)}
          >
            <FontAwesomeIcon icon={faUsers} className="text-gray-800" />
            {tooltip === 'Widok rodowodu' && (
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Widok rodowodu
            </div>
            )}
          </button>
          <button
            className="p-2 rounded hover:bg-gray-200 relative flex items-center group"
            onClick={() => handleNavigate('/fan-view')}
            onMouseEnter={() => setTooltip('Widok wentylatora')}
            onMouseLeave={() => setTooltip(null)}
          >
            <FontAwesomeIcon icon={faFan} className="text-gray-800" />
            {tooltip === 'Widok wentylatora' && (
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Widok wentylatora
            </div>
            )}
          </button>
          <button
            className="p-2 rounded hover:bg-gray-200 relative flex items-center group"
            onClick={() => handleNavigate('/list-view')}
            onMouseEnter={() => setTooltip('Widok listy')}
            onMouseLeave={() => setTooltip(null)}
          >
            <FontAwesomeIcon icon={faList} className="text-gray-800" />
            {tooltip === 'Widok listy' && (
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Widok listy
            </div>
            )}
          </button>
        </div>
        <div className="absolute bottom-0 w-full flex justify-center mb-4">
          <LogoutButton />
        </div>
      </div>
      <div className="ml-16">
        {/* Rest of your header content, if any */}
      </div>
    </header>
  );
};

export default LeftHeader;
