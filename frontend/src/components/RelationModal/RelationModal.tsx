import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useSpring, animated } from '@react-spring/web'; // Import react-spring

interface RelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (relation: string, personId: string) => void;
  onDelete: (relationId: string) => void;
  personId: string; // ID osoby, z którą związana jest relacja
  existingRelation?: { relationId: string; relation: string }; // Opcjonalnie, istniejąca relacja do edycji
}

const RelationModal: React.FC<RelationModalProps> = ({ isOpen, onClose, onSave, onDelete, personId, existingRelation }) => {
  const [relation, setRelation] = useState(existingRelation?.relation || '');
  const [isDeleting, setIsDeleting] = useState(false);

  // Animacja dla modal
  const modalAnimation = useSpring({
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'translateY(0%)' : 'translateY(-50%)',
    config: { duration: 300 }
  });

  const handleSave = () => {
    onSave(relation, personId);
    onClose();
  };

  const handleDelete = () => {
    if (existingRelation?.relationId) {
      onDelete(existingRelation.relationId);
      onClose();
    }
  };

  return (
    <animated.div
      className={`fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? 'block' : 'hidden'}`}
      style={modalAnimation}
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Zarządzaj Relacją</h2>
          <button onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="lg" color="#333" />
          </button>
        </div>
        <div className="mb-4">
          <label htmlFor="relation" className="block text-gray-700">Relacja:</label>
          <input
            id="relation"
            type="text"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
          />
        </div>
        <div className="flex justify-between">
          {existingRelation && (
            <button
              onClick={handleDelete}
              className="flex items-center bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              Usuń
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex items-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            Zapisz
          </button>
        </div>
      </div>
    </animated.div>
  );
};

export default RelationModal;
