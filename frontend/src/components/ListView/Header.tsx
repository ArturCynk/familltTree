import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilter,
  faSearch,
  faCog,
  faUsers,
  faSlidersH,
  faUserPlus,
  faSortAlphaDown
} from '@fortawesome/free-solid-svg-icons';

interface HeaderProps {
  totalUsers: number;
  currentPage: number;
  itemsPerPage: number;
  onToggleSearch: () => void;
  onToggleSettingsPanel: () => void;
  isSearchOpen: boolean;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchEnter: () => void;
}

const Header: React.FC<HeaderProps> = ({
  totalUsers,
  currentPage,
  itemsPerPage,
  onToggleSearch,
  onToggleSettingsPanel,
  isSearchOpen,
  searchQuery,
  onSearchChange,
  onSearchEnter,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchEnter();
    }
  };

  // Obliczanie zakresu wyświetlanych rekordów
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalUsers);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full max-w-6xl mb-6 gap-4 px-4">
      {/* Left Section - Users Info */}
      <div className="flex items-center gap-3 bg-indigo-50 dark:bg-gray-800/80 px-4 py-2.5 rounded-lg border border-indigo-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900/50">
        <FontAwesomeIcon
          icon={faUsers}
          className="text-indigo-600 dark:text-indigo-400 text-lg"
        />
        <span className="text-gray-700 dark:text-gray-200 text-sm">
          Wyświetlanie{' '}
          <span className="font-semibold text-indigo-700 dark:text-indigo-300">
            {startItem}-{endItem}
          </span>{' '}
          z{' '}
          <span className="font-semibold text-indigo-700 dark:text-indigo-300">
            {totalUsers.toLocaleString()}
          </span>{' '}
          <span className="hidden sm:inline">osób</span>
          <span className="sm:hidden">os.</span>
        </span>
      </div>

      {/* Right Section - Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch w-full md:w-auto">
        {/* Enhanced Search Bar */}
        <div className={`relative transition-all duration-300 ease-out ${isSearchOpen ? 'flex-1 max-w-xl' : 'w-12'}`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-400 dark:text-indigo-300">
            <FontAwesomeIcon icon={faSearch} />
          </div>
          <input
            type="text"
            className={`block w-full h-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 ${!isSearchOpen ? 'opacity-0 cursor-pointer' : 'opacity-100'
              }`}
            placeholder="Wyszukaj osoby..."
            value={searchQuery}
            onChange={onSearchChange}
            onKeyDown={handleKeyDown}
            onClick={!isSearchOpen ? onToggleSearch : undefined}
          />
          {!isSearchOpen && (
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={onToggleSearch}
            >
              <FontAwesomeIcon
                icon={faSearch}
                className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Action Buttons Group */}
        <div className="flex gap-2">
          <button
            onClick={onToggleSettingsPanel}
            className="p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            aria-label="Ustawienia"
          >
            <FontAwesomeIcon icon={faSlidersH} />
            <span className="hidden sm:inline-block text-sm">Ustawienia</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;