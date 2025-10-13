import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMale, faFemale, faGenderless, faUserFriends, faXmark
} from '@fortawesome/free-solid-svg-icons';
import AddPersonModal from './AddPersonModal';
import SelectExistingPersonModal from './SelectExistingPersonModal';

interface RelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  personName: string;
  personGender: 'male' | 'female' | 'not-binary';
  id: string;
  persons?: any | null;
  onUpdate?: (updatedPerson: any) => void;
}

const RelationModal: React.FC<RelationModalProps> = ({
  isOpen, onClose, personName, personGender, id, persons, onUpdate
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSelectExistingOpen, setIsSelectExistingOpen] = useState<boolean>(false);
  const [selectedRelation, setSelectedRelation] = useState<string>('');
  const [relationType, setRelationType] = useState<string>('');
  const [initialGender, setInitialGender] = useState<'male' | 'female' | 'non-binary'>('non-binary');

  const handleButtonClick = (
    label: string,
    type: string,
    isExisting: boolean = false,
    genderHint?: 'male' | 'female' | 'non-binary'
  ) => {
    setSelectedRelation(label);
    setRelationType(type);
    setInitialGender(genderHint ?? getGenderFromRelationType(type));
    if (isExisting) {
      setIsSelectExistingOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const getOppositeGender = (gender: 'male' | 'female' | 'not-binary'): 'male' | 'female' | 'non-binary' => {
    switch (gender) {
      case 'male': return 'female';
      case 'female': return 'male';
      default: return 'non-binary';
    }
  };

  const getGenderFromRelationType = (type: string): 'male' | 'female' | 'non-binary' => {
    switch (type) {
      case 'Father':
      case 'Son':
      case 'Sibling': return 'male';
      case 'Mother':
      case 'Daughter': return 'female';
      default: return 'male';
    }
  };

  if (!isOpen) return null;

  // Determine the icon based on gender
  const icon = personGender === 'male' ? faMale : personGender === 'female' ? faFemale : faGenderless;
  const bgColor = personGender === 'male'
    ? 'bg-blue-500 dark:bg-blue-600'
    : personGender === 'female'
      ? 'bg-pink-500 dark:bg-pink-600'
      : 'bg-purple-500 dark:bg-purple-600';

  // Lista relacji
  const relationOptions = [
    { label: 'Ojciec', type: 'Father', icon: faMale, color: 'blue', description: 'Dodaj nową osobę' },
    { label: 'Matka', type: 'Mother', icon: faFemale, color: 'pink', description: 'Dodaj nową osobę' },
    { label: 'Małżonek', type: 'Partner', icon: faUserFriends, color: 'purple', description: 'Dodaj nową osobę', genderHint: getOppositeGender(personGender) },
    { label: 'Brat', type: 'Sibling', icon: faMale, color: 'blue', description: 'Dodaj nową osobę', genderHint: 'male' },
    { label: 'Siostra', type: 'Sibling', icon: faFemale, color: 'pink', description: 'Dodaj nową osobę', genderHint: 'female' },
    { label: 'Syn', type: 'Son', icon: faMale, color: 'blue', description: 'Dodaj nową osobę' },
    { label: 'Córka', type: 'Daughter', icon: faFemale, color: 'pink', description: 'Dodaj nową osobę' },
    { label: 'Wybierz istniejącą', type: '', icon: faUserFriends, color: 'indigo', description: 'Wybierz z listy', isExisting: true },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300';
      case 'pink':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300';
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300';
      case 'indigo':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-300';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/80 backdrop-blur-md transition-all duration-300 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex items-center justify-center w-full max-w-2xl"
      >
        {/* Desktop View - Circle Layout */}
        <div className="hidden lg:flex relative w-full max-w-2xl h-[600px] items-center justify-center">
          {/* Central Box */}
          <div className="relative flex items-center justify-center p-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-800 shadow-xl">
            <div
              className={`flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full ${bgColor} text-white shadow-inner`}
            >
              <FontAwesomeIcon icon={icon} className="text-xl sm:text-2xl" />
            </div>
          </div>

          {/* Surrounding Boxes */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Top Row */}
            <button
              className="absolute flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 shadow-lg hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 group"
              style={{ top: '10%', left: '20%', transform: 'translate(-50%, -50%)' }}
              onClick={() => handleButtonClick('Dodaj ojca', 'Father')}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 ${getColorClasses('blue')}`}>
                <FontAwesomeIcon icon={faMale} className="text-sm sm:text-base" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">Ojciec</p>
            </button>

            <button
              className="absolute flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 shadow-lg hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 group"
              style={{ top: '10%', left: '50%', transform: 'translate(-50%, -50%)' }}
              onClick={() => handleButtonClick('Dodaj małżonka', 'Partner', false, getOppositeGender(personGender))}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 ${getColorClasses('purple')}`}>
                <FontAwesomeIcon icon={faUserFriends} className="text-sm sm:text-base" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">Małżonek</p>
            </button>

            <button
              className="absolute flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 shadow-lg hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 group"
              style={{ top: '10%', right: '20%', transform: 'translate(50%, -50%)' }}
              onClick={() => handleButtonClick('Dodaj matkę', 'Mother')}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 ${getColorClasses('pink')}`}>
                <FontAwesomeIcon icon={faFemale} className="text-sm sm:text-base" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">Matka</p>
            </button>

            {/* Bottom Row */}
            <button
              className="absolute flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 shadow-lg hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 group"
              style={{ bottom: '10%', left: '20%', transform: 'translate(-50%, 50%)' }}
              onClick={() => handleButtonClick('Dodaj córkę', 'Daughter')}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 ${getColorClasses('pink')}`}>
                <FontAwesomeIcon icon={faFemale} className="text-sm sm:text-base" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">Córka</p>
            </button>

            <button
              className="absolute flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 shadow-lg hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 group"
              style={{ bottom: '10%', right: '20%', transform: 'translate(50%, 50%)' }}
              onClick={() => handleButtonClick('Dodaj syna', 'Son')}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 ${getColorClasses('blue')}`}>
                <FontAwesomeIcon icon={faMale} className="text-sm sm:text-base" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">Syn</p>
            </button>

            {/* Middle Row */}
            <button
              className="absolute flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 shadow-lg hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 group"
              style={{ top: '50%', left: '10%', transform: 'translate(-50%, -50%)' }}
              onClick={() => handleButtonClick('Dodaj brata', 'Sibling', false, 'male')}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 ${getColorClasses('blue')}`}>
                <FontAwesomeIcon icon={faMale} className="text-sm sm:text-base" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">Brat</p>
            </button>

            <button
              className="absolute flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 shadow-lg hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 group"
              style={{ top: '50%', right: '10%', transform: 'translate(50%, -50%)' }}
              onClick={() => handleButtonClick('Dodaj siostrę', 'Sibling', false, 'female')}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 ${getColorClasses('pink')}`}>
                <FontAwesomeIcon icon={faFemale} className="text-sm sm:text-base" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">Siostra</p>
            </button>

            {/* Bottom Center */}
            <button
              className="absolute flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 shadow-lg hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 group"
              style={{ bottom: '0%', left: '50%', transform: 'translate(-50%, -50%)' }}
              onClick={() => handleButtonClick('Wybierz istniejącą osobę', '', true)}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 ${getColorClasses('indigo')}`}>
                <FontAwesomeIcon icon={faUserFriends} className="text-sm sm:text-base" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 text-center">Wybierz istniejącą</p>
            </button>
          </div>
        </div>

        {/* Mobile View - Static Grid Layout */}
        <div className="lg:hidden w-full max-w-sm mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-800 px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${bgColor} text-white shadow-inner`}>
                    <FontAwesomeIcon icon={icon} className="text-lg" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Dodaj relację</h2>
                    <p className="text-indigo-100 text-sm">{personName}</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors duration-200"
                  aria-label="Zamknij"
                >
                  <FontAwesomeIcon icon={faXmark} className="h-5 w-5 text-white/90 hover:text-white" />
                </button>
              </div>
              <p className="text-indigo-100 text-xs text-center">
                Wybierz typ relacji
              </p>
            </div>

            {/* Relation Grid - Static, no scrolling */}
            <div className="p-3">
              <div className="grid grid-cols-2 gap-2">
                {relationOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleButtonClick(
                      `Dodaj ${option.label.toLowerCase()}`,
                      option.type,
                      option.isExisting,
                      option.genderHint as 'male' | 'female' | 'non-binary' | undefined
                    )}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-200 active:scale-95 min-h-[80px]"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${getColorClasses(option.color)}`}>
                      <FontAwesomeIcon icon={option.icon} className="text-sm" />
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200 text-xs text-center leading-tight">
                      {option.label}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Wybierz relację, którą chcesz dodać
              </p>
            </div>
          </div>
        </div>

        <AddPersonModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          relationLabel={selectedRelation}
          relationType={relationType}
          id={id}
          persons={persons}
          onUpdate={onUpdate}
          initialGender={initialGender}
        />

        <SelectExistingPersonModal
          isOpen={isSelectExistingOpen}
          onClose={() => setIsSelectExistingOpen(false)}
          id={id}
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
};

export default RelationModal;