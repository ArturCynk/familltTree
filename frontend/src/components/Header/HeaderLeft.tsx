import React from 'react';

const HeaderLeft: React.FC = () => {
  return (
    <div className="flex items-center gap-4">
      <h1 className="text-xl font-bold">Drzewo genealogiczne</h1>
      <div className="flex gap-4">
        {/* Family View Icon */}
        <button title="Widok rodzinny" className="text-gray-400 hover:text-white">
          <i className="fas fa-users"></i>
        </button>
        {/* Pedigree View Icon */}
        <button title="Widok rodowodu" className="text-gray-400 hover:text-white">
          <i className="fas fa-tree"></i>
        </button>
        {/* Fan View Icon */}
        <button title="Widok wentylatora" className="text-gray-400 hover:text-white">
          <i className="fas fa-fan"></i>
        </button>
        {/* List View Icon */}
        <button title="Widok listy" className="text-gray-400 hover:text-white">
          <i className="fas fa-list"></i>
        </button>
      </div>
    </div>
  );
};

export default HeaderLeft;
