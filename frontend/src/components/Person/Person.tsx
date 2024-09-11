import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMale, faFemale, faPen, faPlus, faUser } from '@fortawesome/free-solid-svg-icons'; // Dodano faUser
import PersonModal from '../Edit/Edit';
import RelationModal from '../RelationModal/RelationModal';

interface PersonBoxProps {
  _id: string;
  gender: 'male' | 'female' | 'not-binary';
  firstName: string;
  lastName: string;
  onPersonUpdated: () => void;
}

const PersonBox: React.FC<PersonBoxProps> = ({ _id, gender, firstName, lastName, onPersonUpdated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const isMale = gender === 'male';
  const isFemale = gender === 'female';
  
  // Definiowanie koloru i ikony na podstawie płci
  const boxClass = isMale ? 'border-blue-500' : isFemale ? 'border-orange-500' : 'border-purple-500';
  const icon = isMale ? faMale : isFemale ? faFemale : faUser; // Ikona człowieka dla niebinarnych

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddClick = () => {
    setIsRelationModalOpen(true);
  };

  const handleCloseRelationModal = () => {
    setIsRelationModalOpen(false);
  };

  const handleDoubleClickBox = () => {
    setIsRelationModalOpen(true);
  };

  const handleRelationClick = () => {
    setIsRelationModalOpen(true);
  };

  return (
    <div className="relative flex flex-col items-center p-4">
      {/* Person Box */}
      <div 
        className={`relative flex items-center p-4 border-2 rounded-lg ${boxClass} shadow-lg`}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onDoubleClick={handleDoubleClickBox}
        style={{ width: '5cm', height: '1.6cm' }}
      >
        <div className="absolute top-0 right-0 flex items-center justify-center w-8 h-8 cursor-pointer"
          title="Relacje"
          onClick={handleRelationClick}
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
        <div className="flex-1 text-gray-800">
          <p className="text-sm font-semibold">{firstName} {lastName}</p>
        </div>
        <div 
          className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 cursor-pointer"
          title="Edytuj"
          onClick={handleEditClick}
        >
          <FontAwesomeIcon icon={faPen} size="sm" color="#333" />
        </div>
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
          onClose={handleCloseRelationModal}
          onSave={(relation: any, personId: any) => {
            console.log('Save relation:', relation, personId);
            // Handle save relation
          }}
          onDelete={(relationId: any) => {
            console.log('Delete relation:', relationId);
            // Handle delete relation
          }}
          personId={_id}
        />
      )}
    </div>
  );
};

export default PersonBox;
