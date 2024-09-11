import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMale, faFemale, faGenderless } from '@fortawesome/free-solid-svg-icons';

interface RelationBoxProps {
  gender: 'male' | 'female' | 'not-binary';
  relationType: string; // Opis relacji (np. Ojciec, Matka, Syn, Córka)
}

const RelationBox: React.FC<RelationBoxProps> = ({ gender, relationType }) => {
  const isMale = gender === 'male';
  const isFemale = gender === 'female';
  
  // Definiowanie koloru i ikony na podstawie płci
  const boxClass = isMale ? 'border-blue-500' : isFemale ? 'border-orange-500' : 'border-purple-500';
  const icon = isMale ? faMale : isFemale ? faFemale : faGenderless;

  return (
    <div 
      className={`relative flex items-center p-4 border-2 rounded-lg ${boxClass} shadow-lg`}
      style={{ width: '5cm', height: '1.6cm' }}
    >
      <div className="flex-shrink-0 mr-3">
        <div 
          className={`flex items-center justify-center w-12 h-12 rounded-full ${isMale ? 'bg-blue-500' : isFemale ? 'bg-orange-500' : 'bg-purple-500'}`}
          style={{ width: '1cm', height: '1cm' }}
        >
          <FontAwesomeIcon icon={icon} size="lg" color="#fff" />
        </div>
      </div>
      <div className="flex-1 text-gray-800">
        <p className="text-sm font-semibold">{relationType}</p>
      </div>
    </div>
  );
};

export default RelationBox;
