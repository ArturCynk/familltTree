// src/components/LeftHeader/LeftHeader.tsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faTree, faFan, faList, faCog, faSliders,
  faBars, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import LogoutButton from '../LogoutButton/LogoutButton';
import { SettingsDropdown } from '../Settings/SettingsDropdown';

const LeftHeader: React.FC = () => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sprawdzanie rozmiaru ekranu
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Blokowanie scrolla gdy menu mobilne jest otwarte
  useEffect(() => {
    if (isMobileMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isMobile]);

  const navButtons = [
    { path: '/family-view', icon: faTree, tooltip: 'Widok rodzinny', mobileLabel: 'Rodzina' },
    { path: '/ancestry-view', icon: faUsers, tooltip: 'Widok rodowodu', mobileLabel: 'Rodowód' },
    { path: '/fan-view', icon: faFan, tooltip: 'Widok wentylatora', mobileLabel: 'Wentylator' },
    { path: '/list-view', icon: faList, tooltip: 'Widok listy', mobileLabel: 'Lista' },
    { path: '/collaborative-tree', icon: faUsers, tooltip: 'Wspólne drzewo', mobileLabel: 'Wspólne' }
  ];

  const isActive = (path: string) => location.pathname === path;

  // Wersja na telefon - dolna nawigacja
  if (isMobile) {
    return (
      <>
        {/* Przycisk menu hamburger (tylko na mobile) */}
        

        {/* Mobilne menu pełnoekranowe */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu */}
            <div className="fixed inset-0 bg-white dark:bg-gray-800 z-50 flex flex-col">
              {/* Nagłówek menu */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Zamknij menu"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-gray-600 dark:text-gray-300 text-lg" />
                </button>
              </div>

              {/* Przyciski nawigacji */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {navButtons.map((button) => (
                  <button
                    key={button.path}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 ${
                      isActive(button.path)
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                    }`}
                    onClick={() => {
                      navigate(button.path);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <FontAwesomeIcon icon={button.icon} className="text-xl" />
                    <span className="text-lg font-medium">{button.mobileLabel}</span>
                  </button>
                ))}
              </div>

              {/* Sekcja ustawień i wylogowania */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <button
                  className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 ${
                    isActive('/settings-page')
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  onClick={() => {
                    navigate('/settings-page');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <FontAwesomeIcon icon={faSliders} className="text-xl" />
                  <span className="text-lg font-medium">Ustawienia zaawansowane</span>
                </button>

                <div className="pt-2">
                  <LogoutButton />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Dolny pasek nawigacji (skrócona wersja) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-30">
          <div className="flex justify-around items-center p-2">
            {navButtons.slice(0, 4).map((button) => (
              <button
                key={button.path}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                  isActive(button.path)
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400'
                }`}
                onClick={() => navigate(button.path)}
                aria-label={button.tooltip}
              >
                <FontAwesomeIcon icon={button.icon} className="text-sm mb-1" />
                <span className="text-xs text-center truncate w-full">{button.mobileLabel}</span>
              </button>
            ))}

            
            <button
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                isMobileMenuOpen
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400'
              }`}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Więcej"
            >
              <FontAwesomeIcon icon={faBars} className="text-sm mb-1" />
              <span className="text-xs text-center">Więcej</span>
            </button>
          </div>
        </div>

        {/* Miejsce na dolną nawigację */}
        <div className="pb-16"></div>
      </>
    );
  }

  // Wersja na desktop - oryginalny lewy pasek
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
                  className={`transition-transform duration-300 ${
                    isActive(button.path) ? 'scale-110' : 'group-hover:scale-110'
                  }`}
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
              className={`transition-transform duration-300 ${
                isSettingsOpen ? 'rotate-90 scale-110' : 'group-hover:scale-110'
              }`}
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
            className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${
              isActive('/settings-page')
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
              className={`transition-transform duration-300 ${
                isActive('/settings-page') ? 'scale-110' : 'group-hover:scale-110'
              }`}
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