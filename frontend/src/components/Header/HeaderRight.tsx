import React from 'react';

const HeaderRight: React.FC = () => {
  return (
    <div className="flex items-center gap-4">
      {/* Number of People in Tree */}
      <span className="text-sm">Liczba osób: 123</span>
      {/* Generation Select */}
      <select className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1">
        <option>1 pokolenie</option>
        <option>2 pokolenia</option>
        <option>3 pokolenia</option>
        <option>4 pokolenia</option>
      </select>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Znajdź osobę"
          className="bg-gray-700 text-white border border-gray-600 rounded pl-8 pr-2 py-1"
        />
        <i className="fas fa-search absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      </div>
      {/* Settings Icon */}
      <button title="Ustawienia" className="text-gray-400 hover:text-white">
        <i className="fas fa-cog"></i>
      </button>
    </div>
  );
};

export default HeaderRight;
