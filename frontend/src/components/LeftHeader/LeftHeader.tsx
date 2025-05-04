// src/components/LeftHeader/LeftHeader.tsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faTree, faFan, faList, faCog, faSliders
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import LogoutButton from '../LogoutButton/LogoutButton';
import { SettingsDropdown } from '../Settings/SettingsDropdown';

const LeftHeader: React.FC = () => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navButtons = [
    { path: '/family-view', icon: faTree, tooltip: 'Widok rodzinny' },
    { path: '/ancestry-view', icon: faUsers, tooltip: 'Widok rodowodu' },
    { path: '/fan-view', icon: faFan, tooltip: 'Widok wentylatora' },
    { path: '/list-view', icon: faList, tooltip: 'Widok listy' },
    { path: '/collaborative-tree', icon: faUsers, tooltip: 'Wspólne drzewo' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="relative z-40">
      <div className="fixed top-0 left-0 h-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-xl w-16 flex flex-col items-center py-8">
        <div className="flex flex-col items-center space-y-6 flex-grow">
          {navButtons.map((button) => (
            <div key={button.path} className="relative group">
              <button
                className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${isActive(button.path)
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 shadow-md hover:shadow-lg'
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

              {activeTooltip === button.tooltip && (
                <div className="absolute left-full top-1/2 ml-3 transform -translate-y-1/2">
                  <div className="bg-gray-800 dark:bg-gray-700 text-white text-sm font-medium rounded-lg py-1.5 px-3 whitespace-nowrap shadow-lg">
                    {button.tooltip}
                    <div className="absolute right-full top-1/2 w-2 h-2 -mt-1 -mr-1 bg-gray-800 dark:bg-gray-700 transform rotate-45"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Settings Button */}
        <div className="mb-4 relative">
          <button
            className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${isSettingsOpen
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 shadow-md hover:shadow-lg'
              }`}
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            onMouseEnter={() => setActiveTooltip('Ustawienia')}
            onMouseLeave={() => setActiveTooltip(null)}
            aria-label="Ustawienia"
          >
            <FontAwesomeIcon
              icon={faCog}
              className={`transition-transform duration-300 ${isSettingsOpen ? 'rotate-90 scale-110' : 'group-hover:scale-110'}`}
            />
          </button>

          {isSettingsOpen && <SettingsDropdown />}

          {activeTooltip === 'Ustawienia' && !isSettingsOpen && (
            <div className="absolute left-full top-1/2 ml-3 transform -translate-y-1/2">
              <div className="bg-gray-800 dark:bg-gray-700 text-white text-sm font-medium rounded-lg py-1.5 px-3 whitespace-nowrap shadow-lg">
                Ustawienia
                <div className="absolute right-full top-1/2 w-2 h-2 -mt-1 -mr-1 bg-gray-800 dark:bg-gray-700 transform rotate-45"></div>
              </div>
            </div>
          )}
        </div>
        <div className="mb-4 relative">
          <button
            className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${isActive('/settings-page')
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 shadow-md hover:shadow-lg'
              }`}
            onClick={() => navigate('/settings-page')}
            onMouseEnter={() => setActiveTooltip('Ustawienia zaawansowane')}
            onMouseLeave={() => setActiveTooltip(null)}
            aria-label="Ustawienia zaawansowane"
          >
            <FontAwesomeIcon
              icon={faSliders}
              className={`transition-transform duration-300 ${isActive('/settings-page') ? 'scale-110' : 'group-hover:scale-110'}`}
            />
          </button>

          {activeTooltip === 'Ustawienia zaawansowane' && (
            <div className="absolute left-full top-1/2 ml-3 transform -translate-y-1/2">
              <div className="bg-gray-800 dark:bg-gray-700 text-white text-sm font-medium rounded-lg py-1.5 px-3 whitespace-nowrap shadow-lg">
                Ustawienia zaawansowane
                <div className="absolute right-full top-1/2 w-2 h-2 -mt-1 -mr-1 bg-gray-800 dark:bg-gray-700 transform rotate-45"></div>
              </div>
            </div>
          )}
        </div>


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