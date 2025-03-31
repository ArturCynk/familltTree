import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMale, faFemale, faGenderless, faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { Person } from '../ListView/Types';

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
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && event.target instanceof Node && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      fetchRelations();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, person]);

  const fetchRelations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:3001/api/person/users/relation/${person}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRelations(response.data);
    } catch (error) {
      console.error('Error fetching relations:', error);
      toast.error('Nie udało się załadować relacji');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id === selectedId ? null : id);
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`http://localhost:3001/api/person/relation/${person}/${selectedId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      toast.success(response.data.message);
      fetchRelations(); // Refresh relations after deletion
      setSelectedId(null);
    } catch (error) {
      console.error('Error deleting relation:', error);
      toast.error('Wystąpił błąd podczas usuwania relacji');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 bg-gray-900/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] scale-95 opacity-0 animate-modalEnter"
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
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(relations).map(([relationType, people]) => (
                people.length > 0 && (
                  <div key={relationType} className="space-y-3">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center">
                      <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                      {relationType.charAt(0).toUpperCase() + relationType.slice(1)}
                    </h3>
                    <ul className="space-y-2">
                      {people.map((p) => (
                        <li
                          key={p.id}
                          className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer ${
                            selectedId === p.id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => handleSelect(p.id)}
                        >
                          <span className="mr-3">
                            {p.gender === 'male' ? (
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <FontAwesomeIcon icon={faMale} />
                              </div>
                            ) : p.gender === 'female' ? (
                              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                                <FontAwesomeIcon icon={faFemale} />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                <FontAwesomeIcon icon={faGenderless} />
                              </div>
                            )}
                          </span>
                          <span className={`flex-1 ${
                            selectedId === p.id ? 'text-indigo-700 font-medium' : 'text-gray-800'
                          }`}>
                            {p.firstName} {p.lastName}
                          </span>
                          {selectedId === p.id && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
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
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleDelete}
                disabled={loading}
                className={`w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
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