import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSearch, faCog } from '@fortawesome/free-solid-svg-icons';

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
  onSearchEnter
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchEnter();  // Wywołanie wyszukiwania po kliknięciu Enter
    }
  };

  return (
    <div className="flex justify-between items-center w-full max-w-4xl mb-6">
      <div className="text-gray-700 text-sm">Wyświetlanie 1-10 z {totalUsers} osób</div>
      <div className="flex gap-4 items-center">
        <button
          className="p-2 rounded-full hover:bg-gray-200 transition duration-300"
          onClick={onToggleAlphabetFilter}
        >
          <FontAwesomeIcon icon={faFilter} className="text-gray-600 text-lg" />
        </button>
        <button
          className="p-2 rounded-full hover:bg-gray-200 transition duration-300"
          onClick={onToggleSearch}
        >
          <FontAwesomeIcon icon={faSearch} className="text-gray-600 text-lg" />
        </button>

        {/* Animowany input szukania */}
        <div className={`relative overflow-hidden transition-all duration-300 ${isSearchOpen ? 'w-64' : 'w-0'}`}>
          <input
            type="text"
            className="relative right-4 ml-4 p-2 pl-8 pr-4 border border-gray-300 rounded-full shadow transition-all duration-300"
            placeholder="Szukaj..."
            value={searchQuery}
            onChange={onSearchChange}
            onKeyDown={handleKeyDown}  // Obsługa naciśnięcia klawisza Enter
            style={{ width: isSearchOpen ? '100%' : '0' }}
          />
        </div>
        <button
          className="p-2 rounded-full hover:bg-gray-200 transition duration-300"
          onClick={onToggleSettingsPanel}
        >
          <FontAwesomeIcon icon={faCog} className="text-gray-600 text-lg" />
        </button>
      </div>
    </div>
  );
};

export default Header;
