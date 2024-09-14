// AlphabetFilter.tsx
import React from 'react';

interface AlphabetFilterProps {
  selectedLetter: string | null;
  onSelectLetter: (letter: string | null) => void;
}

const AlphabetFilter: React.FC<AlphabetFilterProps> = ({ selectedLetter, onSelectLetter }) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const handleLetterClick = (letter: string | null) => {
    onSelectLetter(letter);
    // Fetch people function should be called from parent component
  };

  return (
    <div className="flex justify-center mb-4">
      {alphabet.map(letter => (
        <button
          key={letter}
          className={`p-2 mx-1 rounded ${selectedLetter === letter ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-blue-300 transition duration-300`}
          onClick={() => handleLetterClick(letter)}
        >
          {letter}
        </button>
      ))}
      <button
        className={`p-2 mx-1 rounded ${selectedLetter === null ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-blue-300 transition duration-300`}
        onClick={() => handleLetterClick(null)}
      >
        All
      </button>
    </div>
  );
};

export default AlphabetFilter;
