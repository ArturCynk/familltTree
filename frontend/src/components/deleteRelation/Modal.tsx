import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMale, 
  faFemale, 
  faGenderless, 
  faTrashAlt,
  faUsers,
  faUserGroup,
  faChild,
  faHeart,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { Person } from '../ListView/Types';
import type { Node } from 'relatives-tree/lib/types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | Node;
  onSuccess?: () => void;
}

interface Relation {
  id: string;
  firstName: string;
  lastName: string;
  gender?: "male" | "female" | "unknown";
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, person, onSuccess }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
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
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && event.target instanceof Node && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setSelectedId(null);
    }, 300);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id === selectedId ? null : id);
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(
        `http://localhost:3001/api/person/relation/${person.id}/${selectedId}`, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(response.data.message || 'Relacja została usunięta pomyślnie!');
      setSelectedId(null);
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error deleting relation:', error);
      toast.error('Wystąpił błąd podczas usuwania relacji');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!isOpen && !isClosing) return null;

  const hasRelations = Object.values(relations).some(relationArray => relationArray.length > 0);

  const getRelationIcon = (type: string) => {
    switch (type) {
      case 'parents': return faUsers;
      case 'siblings': return faUserGroup;
      case 'spouses': return faHeart;
      case 'children': return faChild;
      default: return faUsers;
    }
  };

  const getRelationColor = (type: string) => {
    switch (type) {
      case 'parents': return 'from-blue-500 to-blue-600';
      case 'siblings': return 'from-green-500 to-green-600';
      case 'spouses': return 'from-pink-500 to-pink-600';
      case 'children': return 'from-purple-500 to-purple-600';
      default: return 'from-indigo-500 to-indigo-600';
    }
  };

  const getSelectedPerson = () => {
    return Object.values(relations)
      .flat()
      .find(p => p.id === selectedId);
  };

  const selectedPerson = getSelectedPerson();

  return (
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center transition-all duration-300
      ${isClosing ? 'bg-black/0 backdrop-blur-0' : 'bg-black/60 dark:bg-black/70 backdrop-blur-md'}
      p-4
    `}>
      {/* Modal Container */}
      <div
        ref={modalRef}
        className={`
          relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl 
          w-full max-w-2xl mx-auto overflow-hidden transition-all duration-300
          ${isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'}
          max-h-[85vh] flex flex-col border border-gray-200 dark:border-gray-700
        `}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-2xl backdrop-blur-sm">
                <FontAwesomeIcon 
                  icon={faUsers} 
                  className="text-white text-lg" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white truncate">
                  Zarządzaj relacjami rodzinnymi
                </h2>
                <p className="text-indigo-100 text-sm mt-1 truncate">
                  {person.firstName} {person.lastName}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 group ml-4 flex-shrink-0"
              aria-label="Zamknij"
            >
              <FontAwesomeIcon 
                icon={faXmark} 
                className="text-white text-lg group-hover:scale-110 transition-transform" 
              />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 dark:border-indigo-400 mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Ładowanie relacji...
              </p>
            </div>
          ) : !hasRelations ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                <FontAwesomeIcon 
                  icon={faUsers} 
                  className="h-8 w-8 text-gray-400 dark:text-gray-500" 
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Brak relacji rodzinnych
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
                Ta osoba nie ma jeszcze żadnych powiązań rodzinnych. 
                Dodaj relacje poprzez menu kontekstowe w liście osób.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(relations).map(([relationType, people]) => (
                people.length > 0 && (
                  <div key={relationType} className="space-y-4">
                    {/* Section Header */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r ${getRelationColor(relationType)}`}>
                        <FontAwesomeIcon 
                          icon={getRelationIcon(relationType)} 
                          className="text-white text-sm" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {(() => {
                            switch(relationType) {
                              case 'parents': return 'Rodzice';
                              case 'siblings': return 'Rodzeństwo';
                              case 'spouses': return 'Małżonkowie';
                              case 'children': return 'Dzieci';
                              default: return relationType;
                            }
                          })()}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {people.length} {people.length === 1 ? 'osoba' : people.length < 5 ? 'osoby' : 'osób'}
                        </p>
                      </div>
                    </div>

                    {/* People List */}
                    <div className="grid gap-3">
                      {people.map((p) => (
                        <div
                          key={p.id}
                          className={`
                            flex items-center p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer group
                            ${selectedId === p.id
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg scale-[1.02]'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }
                          `}
                          onClick={() => handleSelect(p.id)}
                        >
                          {/* Gender Icon */}
                          <div className={`
                            w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 mr-4
                            ${selectedId === p.id
                              ? 'bg-white shadow-lg'
                              : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600'
                            }
                          `}>
                            {p.gender === 'male' ? (
                              <FontAwesomeIcon 
                                icon={faMale} 
                                className="text-blue-500 text-lg" 
                              />
                            ) : p.gender === 'female' ? (
                              <FontAwesomeIcon 
                                icon={faFemale} 
                                className="text-pink-500 text-lg" 
                              />
                            ) : (
                              <FontAwesomeIcon 
                                icon={faGenderless} 
                                className="text-purple-500 text-lg" 
                              />
                            )}
                          </div>

                          {/* Person Info */}
                          <div className="flex-1 min-w-0">
                            <p className={`
                              font-medium truncate transition-colors
                              ${selectedId === p.id 
                                ? 'text-indigo-700 dark:text-indigo-300' 
                                : 'text-gray-800 dark:text-gray-200'
                              }
                            `}>
                              {p.firstName} {p.lastName}
                            </p>
                            <p className={`
                              text-sm truncate
                              ${selectedId === p.id
                                ? 'text-indigo-500 dark:text-indigo-400'
                                : 'text-gray-500 dark:text-gray-400'
                              }
                            `}>
                              {(() => {
                                switch(relationType) {
                                  case 'parents': return 'Rodzic';
                                  case 'siblings': return 'Rodzeństwo';
                                  case 'spouses': return 'Małżonek/Partner';
                                  case 'children': return 'Dziecko';
                                  default: return 'Krewny';
                                }
                              })()}
                            </p>
                          </div>

                          {/* Selection Indicator */}
                          <div className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ml-4
                            ${selectedId === p.id
                              ? 'bg-indigo-500 border-indigo-500'
                              : 'border-gray-300 dark:border-gray-600 group-hover:border-indigo-300'
                            }
                          `}>
                            {selectedId === p.id && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* Delete Action Section */}
        {selectedId && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm p-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <FontAwesomeIcon 
                    icon={faTrashAlt} 
                    className="text-red-500 dark:text-red-400" 
                  />
                </div>
                <div className="flex-1">
                  <p className="text-red-800 dark:text-red-300 font-medium text-sm">
                    Wybrano do usunięcia:
                  </p>
                  <p className="text-red-700 dark:text-red-400 font-semibold truncate">
                    {selectedPerson?.firstName} {selectedPerson?.lastName}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedId(null)}
                disabled={deleteLoading}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50"
              >
                Anuluj wybór
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Usuwanie...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTrashAlt} />
                    <span>Usuń relację</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer for empty state */}
        {!hasRelations && !selectedId && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm p-6">
            <button
              onClick={handleClose}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Zamknij
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;