import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMale, faFemale, faGenderless, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import AddPersonModal from './AddPersonModal';
import SelectExistingPersonModal from './SelectExistingPersonModal'

interface RelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  personName: string;
  personGender: 'male' | 'female' | 'not-binary';
  id: string;
}

const RelationModal: React.FC<RelationModalProps> = ({ isOpen, onClose, personName, personGender, id }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSelectExistingOpen, setIsSelectExistingOpen] = useState<boolean>(false);
  const [selectedRelation, setSelectedRelation] = useState<string>('');
  const [relationType, setRelationType] = useState<string>('');

  const handleButtonClick = (label: string, type: string, isExisting: boolean = false) => {
    setSelectedRelation(label);
    setRelationType(type); 
    if (isExisting) {
      setIsSelectExistingOpen(true); // Open modal for selecting existing person
    } else {
      setIsModalOpen(true); // Open modal for adding a new person
    }
  };

  



  if (!isOpen) return null;

  // Determine the icon based on gender
  const icon = personGender === 'male' ? faMale : personGender === 'female' ? faFemale : faGenderless;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
      style={{ zIndex: 1000 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex items-center justify-center p-6"
        style={{ zIndex: 1001 }}
      >
        <div className="relative w-[600px] h-[600px] flex items-center justify-center">
          {/* Central Box */}
          <div
            className="relative flex items-center justify-center p-4 border-4 border-gray-300 rounded-full bg-white shadow-lg"
            style={{ width: '120px', height: '120px' }}
          >
            <div
              className={`flex items-center justify-center w-20 h-20 rounded-full ${personGender === 'male' ? 'bg-blue-500' : personGender === 'female' ? 'bg-pink-500' : 'bg-gray-500'}`}
              style={{ width: '80px', height: '80px' }}
            >
              <FontAwesomeIcon icon={icon} size="2x" color="#fff" />
            </div>
          </div>

          {/* Surrounding Boxes */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Top Left */}
            <button
              className="absolute flex flex-col items-center justify-center w-20 h-20 border-2 border-gray-300 rounded-full bg-white shadow-md hover:bg-gray-100 focus:outline-none"
              style={{ top: '10%', left: '20%', transform: 'translate(-50%, -50%)' }}
              onClick={() => handleButtonClick('Dodaj ojca', 'Father')}
            >
              <FontAwesomeIcon icon={faMale} size="lg" color="#333" />
              <p className="mt-2 text-sm font-medium">Ojciec</p>
            </button>

            <button
              className="absolute flex flex-col items-center justify-center w-20 h-20 border-2 border-gray-300 rounded-full bg-white shadow-md hover:bg-gray-100 focus:outline-none"
              style={{ top: '10%', left: '50%', transform: 'translate(-50%, -50%)' }}
              onClick={() => handleButtonClick('Dodaj małżonka', 'Partner')}
            >
              <FontAwesomeIcon icon={faUserFriends} size="lg" color="#333" />
              <p className="mt-2 text-sm font-medium">Małżonek</p>
            </button>

            <button
              className="absolute flex flex-col items-center justify-center w-20 h-20 border-2 border-gray-300 rounded-full bg-white shadow-md hover:bg-gray-100 focus:outline-none"
              style={{ top: '10%', right: '20%', transform: 'translate(50%, -50%)' }}
              onClick={() => handleButtonClick('Dodaj matkę', 'Mother')}
            >
              <FontAwesomeIcon icon={faFemale} size="lg" color="#333" />
              <p className="mt-2 text-sm font-medium">Matka</p>
            </button>

            <button
              className="absolute flex flex-col items-center justify-center w-20 h-20 border-2 border-gray-300 rounded-full bg-white shadow-md hover:bg-gray-100 focus:outline-none"
              style={{ bottom: '10%', left: '20%', transform: 'translate(-50%, 50%)' }}
              onClick={() => handleButtonClick('Dodaj córkę', 'Daughter')}
            >
              <FontAwesomeIcon icon={faFemale} size="lg" color="#333" />
              <p className="mt-2 text-sm font-medium">Córka</p>
            </button>

            <button
              className="absolute flex flex-col items-center justify-center w-20 h-20 border-2 border-gray-300 rounded-full bg-white shadow-md hover:bg-gray-100 focus:outline-none"
              style={{ bottom: '10%', right: '20%', transform: 'translate(50%, 50%)' }}
              onClick={() => handleButtonClick('Dodaj syna', 'Son')}
            >
              <FontAwesomeIcon icon={faMale} size="lg" color="#333" />
              <p className="mt-2 text-sm font-medium">Syn</p>
            </button>

            <button
              className="absolute flex flex-col items-center justify-center w-20 h-20 border-2 border-gray-300 rounded-full bg-white shadow-md hover:bg-gray-100 focus:outline-none"
              style={{ top: '50%', left: '10%', transform: 'translate(-50%, -50%)' }}
              onClick={() => handleButtonClick('Dodaj brata', 'Sibling')}
            >
              <FontAwesomeIcon icon={faMale} size="lg" color="#333" />
              <p className="mt-2 text-sm font-medium">Brat</p>
            </button>

            <button
              className="absolute flex flex-col items-center justify-center w-20 h-20 border-2 border-gray-300 rounded-full bg-white shadow-md hover:bg-gray-100 focus:outline-none"
              style={{ top: '50%', right: '10%', transform: 'translate(50%, -50%)' }}
              onClick={() => handleButtonClick('Dodaj siostrę', 'Sibling')}
            >
              <FontAwesomeIcon icon={faFemale} size="lg" color="#333" />
              <p className="mt-2 text-sm font-medium">Siostra</p>
            </button>

            <button
              className="absolute flex flex-col items-center justify-center w-20 h-20 border-2 border-gray-300 rounded-full bg-white shadow-md hover:bg-gray-100 focus:outline-none"
              style={{ bottom: '0%', left: '50%', transform: 'translate(-50%, -50%)' }}
              onClick={() => handleButtonClick('Wybierz istniejącą osobę', '', true)}
            >
              <FontAwesomeIcon icon={faUserFriends} size="lg" color="#333" />
              <p className="mt-2 text-sm font-medium text-center">Wybierz istniejącą</p>
            </button>
          </div>
        </div>
        <AddPersonModal
          isOpen={isModalOpen}
          onClose={onClose}
          relationLabel={selectedRelation} // Przekaż etykietę relacji
          relationType={relationType} // Przekaż typ relacji w języku angielskim
          id={id}
        />

        <SelectExistingPersonModal
          isOpen={isSelectExistingOpen}
          onClose={onClose}
          id={id}
        />
      </div>
    </div>
  );
};

export default RelationModal;
