import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faTree, faFan, faList, faSignOutAlt,
  faCog, faMoon, faSun
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import LogoutButton from '../LogoutButton/LogoutButton';

const LeftHeader: React.FC = () => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check local storage or system preference for initial dark mode
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Apply dark mode class to document
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Navigation buttons configuration
  const navButtons = [
    { path: '/family-view', icon: faTree, tooltip: 'Widok rodzinny' },
    { path: '/ancestry-view', icon: faUsers, tooltip: 'Widok rodowodu' },
    { path: '/fan-view', icon: faFan, tooltip: 'Widok wentylatora' },
    { path: '/list-view', icon: faList, tooltip: 'Widok listy' }
  ];

  const isActive = (path: string) => location.pathname === path;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <header className="relative z-40">
      <div className="fixed top-0 left-0 h-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-xl w-16 flex flex-col items-center py-8">
        <div className="flex flex-col items-center space-y-6 flex-grow">
          {navButtons.map((button) => (
            <div key={button.path} className="relative group">
              <button
                className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${
                  isActive(button.path)
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

              {/* Tooltip */}
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
            className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${
              isSettingsOpen
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

          {/* Settings Dropdown */}
          {isSettingsOpen && (
            <div className="absolute left-full bottom-0 ml-3 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-2 z-50">
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <span>Dark Mode</span>
                <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
              </button>
            </div>
          )}

          {/* Tooltip */}
          {activeTooltip === 'Ustawienia' && !isSettingsOpen && (
            <div className="absolute left-full top-1/2 ml-3 transform -translate-y-1/2">
              <div className="bg-gray-800 dark:bg-gray-700 text-white text-sm font-medium rounded-lg py-1.5 px-3 whitespace-nowrap shadow-lg">
                Ustawienia
                <div className="absolute right-full top-1/2 w-2 h-2 -mt-1 -mr-1 bg-gray-800 dark:bg-gray-700 transform rotate-45"></div>
              </div>
            </div>
          )}
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