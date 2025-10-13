import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faPlus, faUnlink, faEllipsisV, faTrash } from '@fortawesome/free-solid-svg-icons';
import Modal from '../deleteRelation/Modal';
import LoadingSpinner from "../Loader/LoadingSpinner";
import axios from 'axios';
import { toast } from 'react-toastify';
import { Person } from './Types';

interface MobileCardProps {
  person: Person;
  showColorCoding: boolean;
  showRelatives: boolean;
  getDisplayName: (person: Person) => string;
  renderRelations: (person: Person) => JSX.Element | null;
  formatDate: (dateString: string | undefined) => string;
  onOpenRelationModal: (person: Person) => void;
  onOpenEditModal: (person: Person) => void;
  onOpenDeleteRelationModal: (person: Person) => void;
  onOpenDeletePersonModal: (person: Person) => void;
  onClickRow: () => void;
  onSuccess: () => void;
}

const MobileCard: React.FC<MobileCardProps> = ({
  person,
  showColorCoding,
  showRelatives,
  getDisplayName,
  renderRelations,
  formatDate,
  onOpenRelationModal,
  onOpenEditModal,
  onClickRow,
  onSuccess
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (selectedPerson && selectedPerson.id) {
      setIsDeleting(true);
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`http://localhost:3001/api/person/delete/${selectedPerson.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('Osoba została pomyślnie usunięta!');
        onSuccess();
      } catch (error) {
        toast.error('Wystąpił błąd podczas usuwania osoby.');
      } finally {
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
      }
    }
  };

  const handleOpenDeleteModal = (person: Person) => {
    setSelectedPerson(person);
    setIsModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPerson(null);
    onSuccess();
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const getColorByGender = (gender: 'male' | 'female' | 'not-binary') => {
    switch (gender) {
      case 'male':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700';
      case 'female':
        return 'bg-pink-50 border-pink-200 dark:bg-pink-900/30 dark:border-pink-700';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const getInitialsBgByGender = (gender: 'male' | 'female' | 'not-binary') => {
    switch (gender) {
      case 'male':
        return 'bg-blue-600 dark:bg-blue-700';
      case 'female':
        return 'bg-pink-600 dark:bg-pink-700';
      default:
        return 'bg-gray-600 dark:bg-gray-700';
    }
  };

  return (
    <>
      <div
        className={`relative rounded-lg border-2 p-4 transition-all duration-200 ease-out hover:shadow-md dark:hover:shadow-gray-800 ${
          showColorCoding ? getColorByGender(person.gender) : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
        onClick={onClickRow}
      >
        {/* Header with name and actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center flex-1 min-w-0">
            <div
              className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full text-white font-medium mr-3 ${
                showColorCoding ? getInitialsBgByGender(person.gender) : 'bg-indigo-500 dark:bg-indigo-600'
              }`}
            >
              {person.firstName[0]}
              {person.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {getDisplayName(person)}
              </h3>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            >
              <FontAwesomeIcon icon={faEllipsisV} className="text-gray-400 dark:text-gray-500" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black dark:ring-gray-600 ring-opacity-5 z-10">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenRelationModal(person);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-3 text-gray-500 dark:text-gray-400" />
                    Dodaj relację
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEditModal(person);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <FontAwesomeIcon icon={faPen} className="mr-3 text-gray-500 dark:text-gray-400" />
                    Edytuj
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPerson(person);
                      setIsDeleteModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-3" />
                    Usuń osobę
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDeleteModal(person);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <FontAwesomeIcon icon={faUnlink} className="mr-3" />
                    Usuń relację
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Data urodzenia</label>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {formatDate(person.birthDate) || '-'}
            </p>
            {person.birthPlace && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {person.birthPlace}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Data śmierci</label>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {person.deathDate ? formatDate(person.deathDate) : '-'}
            </p>
            {person.burialPlace && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {person.burialPlace}
              </p>
            )}
          </div>
        </div>

        {/* Relations */}
        {showRelatives && (
          <div className="border-t pt-3 border-gray-200 dark:border-gray-600">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {renderRelations(person)}
            </div>
          </div>
        )}
      </div>

      {/* Modal usuwania relacji */}
      {isModalOpen && selectedPerson && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          person={selectedPerson}
        />
      )}

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-auto shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Potwierdzenie usunięcia</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              Czy na pewno chcesz usunąć tę osobę? Tej akcji nie można cofnąć.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white font-medium hover:from-red-700 hover:to-rose-700 transition-colors flex items-center justify-center gap-2 ${
                  isDeleting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isDeleting ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTrash} />
                    Usuń
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileCard;