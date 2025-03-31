import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMale, faFemale, faGenderless, faUserFriends,
} from '@fortawesome/free-solid-svg-icons';
import AddPersonModal from './AddPersonModal';
import SelectExistingPersonModal from './SelectExistingPersonModal';

interface RelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  personName: string;
  personGender: 'male' | 'female' | 'not-binary';
  id: string;
}

const RelationModal: React.FC<RelationModalProps> = ({
  isOpen, onClose, personName, personGender, id,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSelectExistingOpen, setIsSelectExistingOpen] = useState<boolean>(false);
  const [selectedRelation, setSelectedRelation] = useState<string>('');
  const [relationType, setRelationType] = useState<string>('');

  const handleButtonClick = (label: string, type: string, isExisting: boolean = false) => {
    setSelectedRelation(label);
    setRelationType(type);
    if (isExisting) {
      setIsSelectExistingOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  if (!isOpen) return null;

  // Determine the icon based on gender
  const icon = personGender === 'male' ? faMale : personGender === 'female' ? faFemale : faGenderless;
  const bgColor = personGender === 'male' ? 'bg-blue-500' : personGender === 'female' ? 'bg-pink-500' : 'bg-purple-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md transition-all duration-300"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex items-center justify-center p-6"
      >
        <div className="relative w-[600px] h-[600px] flex items-center justify-center">
          {/* Central Box */}
          <div className="relative flex items-center justify-center p-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl">
            <div
              className={`flex items-center justify-center w-24 h-24 rounded-full ${bgColor} text-white shadow-inner`}
            >
              <FontAwesomeIcon icon={icon} size="2x" />
            </div>
          </div>

          {/* Surrounding Boxes */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Top Row */}
            <button
              className="absolute flex flex-col items-center justify-center w-24 h-24 rounded-full bg-white border-2 border-indigo-200 shadow-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
              style={{ top: '10%', left: '20%', transform: 'translate(-50%, -50%)' }}
              onClick={() => handleButtonClick('Dodaj ojca', 'Father')}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-1">
                <FontAwesomeIcon icon={faMale} size="lg" />
              </div>
              <p className="text-sm font-medium text-gray-700">Ojciec</p>
            </button>

            <button
              className="absolute flex flex-col items-center justify-center w-24 h-24 rounded-full bg-white border-2 border-indigo-200 shadow-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
              style={{ top: '10%', left: '50%', transform: 'translate(-50%, -50%)' }}
              onClick={() => handleButtonClick('Dodaj małżonka', 'Partner')}
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-1">
                <FontAwesomeIcon icon={faUserFriends} size="lg" />
              </div>
              <p className="text-sm font-medium text-gray-700">Małżonek</p>
            </button>

            <button
              className="absolute flex flex-col items-center justify-center w-24 h-24 rounded-full bg-white border-2 border-indigo-200 shadow-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
              style={{ top: '10%', right: '20%', transform: 'translate(50%, -50%)' }}
              onClick={() => handleButtonClick('Dodaj matkę', 'Mother')}
            >
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mb-1">
                <FontAwesomeIcon icon={faFemale} size="lg" />
              </div>
              <p className="text-sm font-medium text-gray-700">Matka</p>
            </button>

            {/* Bottom Row */}
            <button
              className="absolute flex flex-col items-center justify-center w-24 h-24 rounded-full bg-white border-2 border-indigo-200 shadow-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
              style={{ bottom: '10%', left: '20%', transform: 'translate(-50%, 50%)' }}
              onClick={() => handleButtonClick('Dodaj córkę', 'Daughter')}
            >
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mb-1">
                <FontAwesomeIcon icon={faFemale} size="lg" />
              </div>
              <p className="text-sm font-medium text-gray-700">Córka</p>
            </button>

            <button
              className="absolute flex flex-col items-center justify-center w-24 h-24 rounded-full bg-white border-2 border-indigo-200 shadow-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
              style={{ bottom: '10%', right: '20%', transform: 'translate(50%, 50%)' }}
              onClick={() => handleButtonClick('Dodaj syna', 'Son')}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-1">
                <FontAwesomeIcon icon={faMale} size="lg" />
              </div>
              <p className="text-sm font-medium text-gray-700">Syn</p>
            </button>

            {/* Middle Row */}
            <button
              className="absolute flex flex-col items-center justify-center w-24 h-24 rounded-full bg-white border-2 border-indigo-200 shadow-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
              style={{ top: '50%', left: '10%', transform: 'translate(-50%, -50%)' }}
              onClick={() => handleButtonClick('Dodaj brata', 'Sibling')}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-1">
                <FontAwesomeIcon icon={faMale} size="lg" />
              </div>
              <p className="text-sm font-medium text-gray-700">Brat</p>
            </button>

            <button
              className="absolute flex flex-col items-center justify-center w-24 h-24 rounded-full bg-white border-2 border-indigo-200 shadow-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
              style={{ top: '50%', right: '10%', transform: 'translate(50%, -50%)' }}
              onClick={() => handleButtonClick('Dodaj siostrę', 'Sibling')}
            >
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mb-1">
                <FontAwesomeIcon icon={faFemale} size="lg" />
              </div>
              <p className="text-sm font-medium text-gray-700">Siostra</p>
            </button>

            {/* Bottom Center */}
            <button
              className="absolute flex flex-col items-center justify-center w-24 h-24 rounded-full bg-white border-2 border-indigo-200 shadow-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
              style={{ bottom: '0%', left: '50%', transform: 'translate(-50%, -50%)' }}
              onClick={() => handleButtonClick('Wybierz istniejącą osobę', '', true)}
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-1">
                <FontAwesomeIcon icon={faUserFriends} size="lg" />
              </div>
              <p className="text-sm font-medium text-gray-700 text-center">Wybierz istniejącą</p>
            </button>
          </div>
        </div>

        <AddPersonModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          relationLabel={selectedRelation}
          relationType={relationType}
          id={id}
        />

        <SelectExistingPersonModal
          isOpen={isSelectExistingOpen}
          onClose={() => setIsSelectExistingOpen(false)}
          id={id}
        />
      </div>
    </div>
  );
};

export default RelationModal;