import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMale, faFemale, faPen } from '@fortawesome/free-solid-svg-icons'; // Font Awesome icons
import PersonModal from '../Edit/Edit'; // Importuj swój komponent modalny

interface PersonBoxProps {
  _id: string; // Identyfikator użytkownika
  gender: 'male' | 'female' | 'not-binary';
  firstName: string;
  lastName: string;
  onPersonUpdated: () => void;
}

const PersonBox: React.FC<PersonBoxProps> = ({ _id, gender, firstName, lastName, onPersonUpdated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isMale = gender === 'male';
  const boxClass = isMale ? 'border-blue-500' : 'border-orange-500';
  const icon = isMale ? faMale : faFemale;

  const handleEditClick = () => {
    setIsModalOpen(true); // Otwiera modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Zamknięcie modalu
  };

  return (
    <div>
      <div 
        className={`relative flex items-center p-2 border-2 rounded-lg ${boxClass} shadow-md`}
        style={{ width: '5cm', height: '1.5cm' }} // Set dimensions here
      >
        <div className="flex-shrink-0 mr-2">
          <div 
            className={`flex items-center justify-center w-12 h-12 rounded-full ${isMale ? 'bg-blue-500' : 'bg-orange-500'}`}
            style={{ width: '1cm', height: '1cm' }} // Adjust icon size if necessary
          >
            <FontAwesomeIcon icon={icon} size="lg" color="#fff" />
          </div>
        </div>
        <div className="flex-1 text-gray-800 text-align">
          <p className="text-xs font-semibold">{firstName} {lastName}</p>
        </div>
        <div 
          className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 cursor-pointer"
          title="Edytuj" // Tooltip text in Polish
          onClick={handleEditClick} // Wywołanie funkcji edycji
        >
          <FontAwesomeIcon icon={faPen} size="sm" color="#333" />
        </div>
      </div>

      {/* Modal Edycji */}
      {isModalOpen && (
        <PersonModal id={_id} onClose={()=> {
            handleCloseModal();
            onPersonUpdated();
        }} />
      )}
    </div>
  );
};

export default PersonBox;
