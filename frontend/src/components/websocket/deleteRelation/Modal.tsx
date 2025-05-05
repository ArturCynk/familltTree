import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMale, faFemale, faGenderless, faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { Person } from '../../ListView/Types';
import type { Node } from 'relatives-tree/lib/types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | Node;
}

interface Relation {
  id: string;
  firstName: string;
  lastName: string;
  gender?: "male" | "female" | "unknown";
}



const Modal: React.FC<ModalProps> = ({ isOpen, onClose, person }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [relations, setRelations] = useState<{
    parents: Relation[];
    siblings: Relation[];
    spouses: Relation[];
    children: Relation[];
  }>({
    parents: person?.parents
      ? person.parents.map((p) => ({
          id: p.id,
          firstName: p.firstName ?? '',
          lastName: p.lastName ?? '',
          gender: (p as Relation).gender ?? 'unknown', 
        }))
      : [],
  
    siblings: person?.siblings
      ? person.siblings.map((s) => ({
          id: s.id,
          firstName: s.firstName ?? '',
          lastName: s.lastName ?? '',
          gender: (s as Relation).gender ?? 'unknown',
        }))
      : [],
  
    spouses: person?.spouses
      ? person.spouses.map((sp) => ({
          id: sp.id,
          firstName: sp.firstName ?? '',
          lastName: sp.lastName ?? '',
          gender: (sp as Relation).gender ?? 'unknown',
        }))
      : [],
  
    children: person?.children
      ? person.children.map((c) => ({
          id: c.id,
          firstName: c.firstName ?? '',
          lastName: c.lastName ?? '',
          gender: (c as Relation).gender ?? 'unknown',
        }))
      : [],
  });
  
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && event.target instanceof Node && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, person]);


  const handleSelect = (id: string) => {
    setSelectedId(id === selectedId ? null : id);
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`http://localhost:3001/api/person/relation/${person.id}/${selectedId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(response.data.message);
      setSelectedId(null);
      onClose();
    } catch (error) {
      console.error('Error deleting relation:', error);
      toast.error('Wystąpił błąd podczas usuwania relacji');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 bg-gray-900/50 dark:bg-gray-900/70 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="absolute top-14 right-1/3 ml-1 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] scale-95 opacity-0 animate-modalEnter"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-700 to-purple-800 px-6 py-4">
          <div className="relative flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Zarządzaj relacjami</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Zamknij"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/90 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading && !selectedId ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(relations).map(([relationType, people]) => (
                people.length > 0 && (
                  <div key={relationType} className="space-y-3">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
                      <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                      {relationType.charAt(0).toUpperCase() + relationType.slice(1)}
                    </h3>
                    <ul className="space-y-2">
                      {people.map((p) => (
                        <li
                          key={p.id}
                          className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer ${
                            selectedId === p.id
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-700'
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => handleSelect(p.id)}
                        >
                          <span className="mr-3">
                            {p.gender === 'male' ? (
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                <FontAwesomeIcon icon={faMale} />
                              </div>
                            ) : p.gender === 'female' ? (
                              <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-300">
                                <FontAwesomeIcon icon={faFemale} />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-300">
                                <FontAwesomeIcon icon={faGenderless} />
                              </div>
                            )}
                          </span>
                          <span className={`flex-1 ${
                            selectedId === p.id 
                              ? 'text-indigo-700 dark:text-indigo-300 font-medium' 
                              : 'text-gray-800 dark:text-gray-200'
                          }`}>
                            {p.firstName} {p.lastName}
                          </span>
                          {selectedId === p.id && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Delete Button */}
          {selectedId && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleDelete}
                disabled={loading}
                className={`w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTrashAlt} />
                    <span>Usuń wybraną relację</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;