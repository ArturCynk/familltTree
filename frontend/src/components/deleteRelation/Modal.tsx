// src/components/Modal.tsx
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMale, faFemale, faGenderless, faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { Person } from '../ListView/Types';
import type { Node, ExtNode } from 'relatives-tree/lib/types';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, person }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [relations, setRelations] = useState<{
    parents: Person[];
    siblings: Person[];
    spouses: Person[];
    children: Person[];
  }>({
    parents: [],
    siblings: [],
    spouses: [],
    children: [],
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && event.target instanceof Node && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
  
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
  
      // Fetch relations when modal is opened
      const fetchRelations = async () => {
        try {
          const token = localStorage.getItem('authToken'); // Get token from localStorage
          const response = await axios.get(`http://localhost:3001/api/person/users/relation/${person}`, {
            headers: {
              Authorization: `Bearer ${token}`, // Add authorization header
            },
          });
          setRelations(response.data);
        } catch (error) {
          console.error('Error fetching relations:', error);
        }
      };
  
      fetchRelations();
    }
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, person]);
  

  const handleSelect = (id: string) => {
    setSelectedId(id);
    console.log('Selected ID:', id); // Log selected ID to the console
  };

  const handleDelete = async () => {
    if (selectedId) {
      try {
        // Użyj personId i selectedId w trasie
        const token = localStorage.getItem('authToken'); // Get token from localStorage
        const response = await axios.delete(`http://localhost:3001/api/person/relation/${person}/${selectedId}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Add authorization header
          },
        });
        // Aktualizuj stan lub wykonaj inne operacje po udanym usunięciu
        setSelectedId(null);
        toast(response.data.message);
        onClose();
      } catch (error) {
        console.error('Error deleting relation:', error);
        // Opcjonalnie wyświetl komunikat o błędzie
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 ">
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-lg shadow-lg w-4/5 md:w-1/2 lg:w-1/3"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Usuń relacje</h2>
        <div className="space-y-4 scroll-m-0 overflow-y-auto max-h-[600px]">
          {Object.entries(relations).map(([relationType, people]) => (
            <div key={relationType}>
              {people.length > 0 ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2 capitalize">
                    {relationType}
                    :
                  </h3>
                  <ul className="space-y-2">
                  {people.map((p) => {
  console.log(p); // Logowanie do konsoli
  return (
    <li
      key={p.id}
      className={`flex items-center p-2 rounded-lg border cursor-pointer ${
        selectedId === p.id ? 'bg-gray-200' : 'hover:bg-gray-100'
      }`}
      onClick={() => handleSelect(p.id)}
    >
      <span className="mr-3 text-lg">
        {p.gender === 'male' ? (
          <FontAwesomeIcon icon={faMale} className="text-blue-500" />
        ) : p.gender === 'female' ? (
          <FontAwesomeIcon icon={faFemale} className="text-pink-500" />
        ) : (
          <FontAwesomeIcon icon={faGenderless} className="text-gray-500" />
        )}
      </span>
      <span className={`text-gray-800 ${selectedId === p.id ? 'font-semibold' : ''}`}>
        {p.firstName} {p.lastName}
      </span>
    </li>
  );
})}

                  </ul>
                </>
              ) : (
                <></>
              )}
              ;
            </div>
          ))}
        </div>
        {selectedId && (
          <button
            onClick={handleDelete}
            className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg flex items-center space-x-2 hover:bg-red-600 focus:outline-none"
          >
            <FontAwesomeIcon icon={faTrashAlt} />
            <span>Usuń</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Modal;
