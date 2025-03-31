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
  totalUsers: string;
  onToggleAlphabetFilter: () => void;
  onToggleSearch: () => void;
  onToggleSettingsPanel: () => void;
  isSearchOpen: boolean;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchEnter: () => void;
}

const Header: React.FC<HeaderProps> = ({
  totalUsers,
  onToggleAlphabetFilter,
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

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full max-w-6xl mb-6 gap-4 px-4">
      {/* Left Section - Users Info */}
      <div className="flex items-center gap-3 bg-indigo-50 px-4 py-3 rounded-lg border border-indigo-100">
        <FontAwesomeIcon 
          icon={faUsers} 
          className="text-indigo-600 text-lg" 
        />
        <span className="text-gray-700 text-sm">
          Wyświetlanie <span className="font-medium text-indigo-700">1-25</span> z{' '}
          <span className="font-medium text-indigo-700">{totalUsers}</span> osób
        </span>
      </div>
      
      {/* Right Section - Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch w-full md:w-auto">
        {/* Enhanced Search Bar */}
        <div className={`relative transition-all duration-300 ease-out ${isSearchOpen ? 'flex-1 max-w-xl' : 'w-12'}`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-400">
            <FontAwesomeIcon icon={faSearch} />
          </div>
          <input
            type="text"
            className={`block w-full h-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-black shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 ${
              !isSearchOpen ? 'opacity-0 cursor-pointer' : 'opacity-100'
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
                className="text-indigo-500 hover:text-indigo-700 transition-colors" 
              />
            </div>
          )}
        </div>

        {/* Action Buttons Group */}
        <div className="flex gap-2">
          <button
            onClick={onToggleAlphabetFilter}
            className="p-3 rounded-lg bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Filtruj alfabetycznie"
          >
            <FontAwesomeIcon icon={faSortAlphaDown} />
            <span className="hidden sm:inline-block text-sm">Filtr</span>
          </button>
          


          <button
            onClick={onToggleSettingsPanel}
            className="p-3 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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