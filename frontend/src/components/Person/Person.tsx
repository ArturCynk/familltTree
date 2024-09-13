import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMale, faFemale, faGenderless, faPen, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useSpring, animated } from '@react-spring/web';
import PersonModal from '../Edit/Edit';
import RelationModal from '../RelationModal/RelationModal';

interface PersonBoxProps {
  _id: string;
  gender: 'male' | 'female' | 'not-binary';
  firstName: string;
  lastName: string;
  onPersonUpdated: () => void;
  handleRefreshData: () => void;
}

const PersonBox: React.FC<PersonBoxProps> = ({ _id, gender, firstName, lastName, onPersonUpdated, handleRefreshData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  const [isInfoBoxOpen, setIsInfoBoxOpen] = useState(false);

  const isMale = gender === 'male';
  const isFemale = gender === 'female';

  const boxClass = isMale ? 'border-blue-500' : isFemale ? 'border-orange-500' : 'border-purple-500';
  const icon = isMale ? faMale : isFemale ? faFemale : faGenderless;

  const handleEditClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleAddClick = () => setIsRelationModalOpen(true);
  const handleCloseRelationModal = () => setIsRelationModalOpen(false);
  const handleDeleteClick = () => {
    // Implement deletion logic here
    setIsInfoBoxOpen(false);
  };

  const toggleInfoBox = () => setIsInfoBoxOpen(prev => !prev);

  const infoBoxSpring = useSpring({
    transform: isInfoBoxOpen ? 'translateX(0)' : 'translateX(-100%)',
    opacity: isInfoBoxOpen ? 1 : 0,
    config: { tension: 300, friction: 25 },
  });

  return (
    <div className="relative flex flex-col items-center p-4">
      {/* Person Box */}
      <div
        className={`relative flex items-center p-4 border-2 rounded-lg ${boxClass} shadow-lg`}
        style={{ width: '5cm', height: '1.6cm' }}
      >
        <div
          className="absolute top-0 right-0 flex items-center justify-center w-8 h-8 cursor-pointer"
          title="Relacje"
          onClick={handleAddClick}
          style={{ zIndex: 2 }} // Ensure it's above the InfoBox
        >
          <FontAwesomeIcon icon={faPlus} size="sm" color="#333" />
        </div>
        <div className="flex-shrink-0 mr-3">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-full ${isMale ? 'bg-blue-500' : isFemale ? 'bg-orange-500' : 'bg-purple-500'}`}
            style={{ width: '1cm', height: '1cm' }}
          >
            <FontAwesomeIcon icon={icon} size="lg" color="#fff" />
          </div>
        </div>
        <div className="flex-1 text-gray-800 flex items-center">
          <p className="text-sm font-semibold">{firstName} {lastName}</p>
        </div>
        <div
          className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 cursor-pointer"
          title="Edytuj"
          onClick={handleEditClick}
          style={{ zIndex: 2 }} // Ensure it's above the InfoBox
        >
          <FontAwesomeIcon icon={faPen} size="sm" color="#333" />
        </div>
        <div
          className="absolute top-0 left-0 w-full h-full cursor-pointer bg-gray-900 bg-opacity-0"
          title="Toggle Info"
          onClick={toggleInfoBox}
        />
      </div>

      {/* Modal Edycji */}
      {isModalOpen && (
        <PersonModal id={_id} onClose={() => {
          handleCloseModal();
          onPersonUpdated();
        }} />
      )}

      {/* Modal Relacji */}
      {isRelationModalOpen && (
        <RelationModal
          isOpen={isRelationModalOpen}
          onClose={() => {
            handleCloseRelationModal();
            handleRefreshData();
          }}
          personName={`${firstName} ${lastName}`}
          personGender={gender}
          id={_id}
        />
      )}
    </div>
  );
};

export default PersonBox;
