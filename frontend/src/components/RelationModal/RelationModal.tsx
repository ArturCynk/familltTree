import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMale, faFemale, faGenderless, faHandshake, faUser, faUserFriends } from '@fortawesome/free-solid-svg-icons';

interface RelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  personName: string;
  personGender: 'male' | 'female' | 'not-binary';
}

const RelationModal: React.FC<RelationModalProps> = ({ isOpen, onClose, personName, personGender }) => {
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
            <div
              className="absolute flex flex-col items-center justify-center w-20 h-20 border-2 border-gray-300 rounded-full bg-white shadow-md"
              style={{ top: '10%', left: '20%', transform: 'translate(-50%, -50%)' }}
            >
              <FontAwesomeIcon icon={faMale} size="lg" color="#333" />
              <p className="mt-2 text-sm font-medium">Ojciec</p>
            </div>

            {/* Top Center */}
            <div
              className="absolute flex flex-col items-center justify-center w-20 h-20 border-2 border-gray-300 rounded-full bg-white shadow-md"
              style={{ top: '10%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
              <FontAwesomeIcon icon={faHandshake} size="lg" color="#333" />
              <p className="mt-2 text-sm font-medium">małżonek</p>
            </div>

            {/* Top Right */}
            <div
              className="absolute flex flex-col items-center justify-center w-20 h-20 border-2 border-gray-300 rounded-full bg-white shadow-md"
              style={{ top: '10%', right: '20%', transform: 'translate(50%, -50%)' }}
            >
              <FontAwesomeIcon icon={faFemale} size="lg" color="#333" />
              <p className="mt-2 text-sm font-medium">Matka</p>
            </div>

            {/* Bottom Left */}
            <div
              className="absolute flex flex-col items-center justify-center w-20 h-20 border-2 border-gray-300 rounded-full bg-white shadow-md"
              style={{ bottom: '10%', left: '20%', transform: 'translate(-50%, 50%)' }}
            >
              <FontAwesomeIcon icon={faFemale} size="lg" color="#333" />
              <p className="mt-2 text-sm font-medium">Córka</p>
            </div>

            {/* Bottom Right */}
            <div
              className="absolute flex flex-col items-center justify-center w-20 h-20 border-2 border-gray-300 rounded-full bg-white shadow-md"
              style={{ bottom: '10%', right: '20%', transform: 'translate(50%, 50%)' }}
            >
              <FontAwesomeIcon icon={faMale} size="lg" color="#333" />
              <p className="mt-2 text-sm font-medium">Syn</p>
            </div>

            {/* Middle Left */}
            <div
              className="absolute flex flex-col items-center justify-center w-20 h-20 border-2 border-gray-300 rounded-full bg-white shadow-md"
              style={{ top: '50%', left: '10%', transform: 'translate(-50%, -50%)' }}
            >
              <FontAwesomeIcon icon={faMale} size="lg" color="#333" />
              <p className="mt-2 text-sm font-medium">Brat</p>
            </div>

            {/* Middle Right */}
            <div
              className="absolute flex flex-col items-center justify-center w-20 h-20 border-2 border-gray-300 rounded-full bg-white shadow-md"
              style={{ top: '50%', right: '10%', transform: 'translate(50%, -50%)' }}
            >
              <FontAwesomeIcon icon={faFemale} size="lg" color="#333" />
              <p className="mt-2 text-sm font-medium">Siostra</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RelationModal;
