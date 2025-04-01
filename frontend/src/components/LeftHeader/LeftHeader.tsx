import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faTree, faFan, faList, faSignOutAlt,
  faCog, faMoon, faSun, faFont
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import LogoutButton from '../LogoutButton/LogoutButton';

const LeftHeader: React.FC = () => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('fontSize') || 'medium';
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Apply dark mode and font size to document
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    // Apply font size
    document.documentElement.style.fontSize = 
      fontSize === 'small' ? '14px' : 
      fontSize === 'medium' ? '16px' : 
      '18px';
    localStorage.setItem('fontSize', fontSize);
  }, [darkMode, fontSize]);

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

  const changeFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
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
            <div className="absolute left-full bottom-0 ml-3 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-2 z-50 space-y-2">
              <div className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                Ustawienia wyglądu
              </div>
              
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <span>Tryb ciemny</span>
                <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
              </button>
              
              <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faFont} className="mr-2" />
                    Rozmiar tekstu
                  </span>
                </div>
                <div className="flex justify-between mt-2">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => changeFontSize(size as 'small' | 'medium' | 'large')}
                      className={`px-2 py-1 text-xs rounded-md ${
                        fontSize === size
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {size === 'small' ? 'Mały' : size === 'medium' ? 'Średni' : 'Duży'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTooltip === 'Ustawienia' && !isSettingsOpen && (
            <div className="absolute left-full top-1/2 ml-3 transform -translate-y-1/2">
              <div className="bg-gray-800 dark:bg-gray-700 text-white text-sm font-medium rounded-lg py-1.5 px-3 whitespace-nowrap shadow-lg">
                Ustawienia
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