import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios do obsługi zapytań HTTP
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faTree, faFan, faList, faSearch, faCog } from '@fortawesome/free-solid-svg-icons';

const Header: React.FC = () => {
  const [personCount, setPersonCount] = useState<number>(0);

  // Funkcja do pobierania liczby osób
  const fetchPersonCount = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/person/count'); // Zamień '/count' na pełny URL, jeśli jest to wymagane
      setPersonCount(response.data.count); // Zakładając, że odpowiedź zawiera 'count'
    } catch (error) {
      console.error('Error fetching person count:', error);
    }
  };

  // Pobierz liczbę osób po zamontowaniu komponentu
  useEffect(() => {
    fetchPersonCount();
  }, []);

  return (
    <header className="w-full sticky top-0">
      {/* First Section */}
      <div className="bg-white text-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Drzewo genealogiczne</h1>
        <div className="flex space-x-4">
          <button title="Widok rodzinny" className="p-2 rounded hover:bg-gray-200">
            <FontAwesomeIcon icon={faTree} className="text-gray-800" />
          </button>
          <button title="Widok rodowodu" className="p-2 rounded hover:bg-gray-200">
            <FontAwesomeIcon icon={faUsers} className="text-gray-800" />
          </button>
          <button title="Widok wentylatora" className="p-2 rounded hover:bg-gray-200">
            <FontAwesomeIcon icon={faFan} className="text-gray-800" />
          </button>
          <button title="Widok listy" className="p-2 rounded hover:bg-gray-200">
            <FontAwesomeIcon icon={faList} className="text-gray-800" />
          </button>
        </div>
      </div>

      {/* Second Section */}
      <div className="bg-[#f2f2f2] text-gray-800 p-4 flex justify-between items-center">
        <div className="text-lg font-medium">Liczba osób: {personCount}</div>
        <div className="flex items-center space-x-4">
          <select className="bg-gray-200 text-gray-800 border border-gray-400 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="1">1 Pokolenie</option>
            <option value="2">2 Pokolenia</option>
            <option value="3">3 Pokolenia</option>
            {/* Add more options as needed */}
          </select>
          <div className="relative">
            <input
              type="text"
              placeholder="Znajdź osobę"
              className="bg-gray-200 text-gray-800 border border-gray-400 rounded p-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </div>
          <button title="Ustawienia" className="p-2 rounded hover:bg-gray-300">
            <FontAwesomeIcon icon={faCog} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
