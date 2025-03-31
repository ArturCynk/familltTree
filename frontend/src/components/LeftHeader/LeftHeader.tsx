import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faTree, faFan, faList, faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import LogoutButton from '../LogoutButton/LogoutButton';

const LeftHeader: React.FC = () => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation buttons configuration
  const navButtons = [
    { path: '/family-view', icon: faTree, tooltip: 'Widok rodzinny' },
    { path: '/ancestry-view', icon: faUsers, tooltip: 'Widok rodowodu' },
    { path: '/fan-view', icon: faFan, tooltip: 'Widok wentylatora' },
    { path: '/list-view', icon: faList, tooltip: 'Widok listy' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="relative z-40">
      <div className="fixed top-0 left-0 h-full bg-gradient-to-b from-white to-gray-50 shadow-xl w-16 flex flex-col items-center py-8">
        <div className="flex flex-col items-center space-y-6 flex-grow">
          {navButtons.map((button) => (
            <div key={button.path} className="relative group">
              <button
                className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${
                  isActive(button.path)
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white hover:bg-gray-100 text-gray-700 shadow-md hover:shadow-lg'
                }`}
                onClick={() => navigate(button.path)}
                onMouseEnter={() => setActiveTooltip(button.tooltip)}
                onMouseLeave={() => setActiveTooltip(null)}
                aria-label={button.tooltip}
              >
                <FontAwesomeIcon 
                  icon={button.icon} 
                  className={`transition-transform duration-300 ${isActive(button.path) ? 'scale-110' : 'group-hover:scale-110'}`}
                />
              </button>

              {/* Tooltip */}
              {activeTooltip === button.tooltip && (
                <div className="absolute left-full top-1/2 ml-3 transform -translate-y-1/2">
                  <div className="bg-gray-800 text-white text-sm font-medium rounded-lg py-1.5 px-3 whitespace-nowrap shadow-lg">
                    {button.tooltip}
                    <div className="absolute right-full top-1/2 w-2 h-2 -mt-1 -mr-1 bg-gray-800 transform rotate-45"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-auto">
          <LogoutButton />
        </div>
      </div>
      <div className="ml-16">
        {/* Main content area */}
      </div>
    </header>
  );
};

export default LeftHeader;