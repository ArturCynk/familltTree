// src/components/SettingsDropdown/SettingsDropdown.tsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faFont } from '@fortawesome/free-solid-svg-icons';

export const SettingsDropdown = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('fontSize') || 'medium';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.style.fontSize = 
      fontSize === 'small' ? '14px' : 
      fontSize === 'medium' ? '16px' : 
      '18px';
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const changeFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
  };

  return (
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
  );
};