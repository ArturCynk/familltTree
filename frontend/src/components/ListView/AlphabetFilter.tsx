import React from 'react';

interface AlphabetFilterProps {
  selectedLetter: string | null;
  onSelectLetter: (letter: string | null) => void;
}

const AlphabetFilter: React.FC<AlphabetFilterProps> = ({ selectedLetter, onSelectLetter }) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const handleLetterClick = (letter: string | null) => {
    onSelectLetter(letter);
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
      {alphabet.map((letter) => (
        <button
          key={letter}
          className={`
            w-10 h-10 flex items-center justify-center rounded-lg font-medium
            transition-all duration-200
            ${
              selectedLetter === letter
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          `}
          onClick={() => handleLetterClick(letter)}
        >
          {letter}
        </button>
      ))}
      <button
        className={`
          px-4 h-10 flex items-center justify-center rounded-lg font-medium
          transition-all duration-200
          ${
            selectedLetter === null
              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
          }
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        `}
        onClick={() => handleLetterClick(null)}
      >
        All
      </button>
    </div>
  );
};

export default AlphabetFilter;