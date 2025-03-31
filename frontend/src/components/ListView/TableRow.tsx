import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faPlus, faUnlink, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import Modal from '../deleteRelation/Modal'; // Upewnij się, że ścieżka jest poprawna

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  maidenName?: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  deathPlace?: string;
  burialPlace?: string;
  gender: 'male' | 'female' | 'not-binary';
  parents: { id: string; firstName?: string; lastName?: string }[];
  siblings: { id: string; firstName?: string; lastName?: string }[];
  spouses: { id: string; firstName?: string; lastName?: string }[];
  children: { id: string; firstName?: string; lastName?: string }[];
  Dzieci: { id: string; firstName?: string; lastName?: string }[];
  Rodzeństwo: { id: string; firstName?: string; lastName?: string }[];
  Małżonkowie: { id: string; firstName?: string; lastName?: string }[];
  Rodzice: { id: string; firstName?: string; lastName?: string }[];
}

interface TableRowProps {
  person: Person;
  showColorCoding: boolean;
  showRelatives: boolean;
  getDisplayName: (person: Person) => string;
  renderRelations: (person: Person) => JSX.Element;
  formatDate: (dateString: string | undefined) => string;
  onOpenRelationModal: (person: Person) => void;
  onOpenEditModal: (person: Person) => void;
  onClickRow: () => void;
}

const TableRow: React.FC<TableRowProps> = ({
  person,
  showColorCoding,
  showRelatives,
  getDisplayName,
  renderRelations,
  formatDate,
  onOpenRelationModal,
  onOpenEditModal,
  onClickRow,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleOpenDeleteModal = (person: Person) => {
    setSelectedPerson(person);
    setIsModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPerson(null);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <tr
        key={person.id}
        className={`relative group border-b border-gray-100 transition-all duration-200 ease-out hover:shadow-md ${
          showColorCoding ? getColorByGender(person.gender) : 'hover:bg-gray-50'
        }`}
        onClick={onClickRow}
      >
        {/* Kolumna imię i nazwisko */}
        <td className="px-6 py-4">
          <div className="flex items-center">
            <div
              className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-white font-medium mr-4 ${
                showColorCoding ? getInitialsBgByGender(person.gender) : 'bg-indigo-500'
              }`}
            >
              {person.firstName[0]}
              {person.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {getDisplayName(person)}
              </p>
              {showRelatives && (
                <div className="mt-1 text-xs text-gray-500">
                  {renderRelations(person)}
                </div>
              )}
            </div>
          </div>
        </td>

        {/* Kolumna data urodzenia */}
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {formatDate(person.birthDate)}
          </div>
          {person.birthPlace && (
            <div className="text-xs text-gray-500 mt-1">
              {person.birthPlace}
            </div>
          )}
        </td>

        {/* Kolumna data śmierci */}
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {person.deathDate ? formatDate(person.deathDate) : ''}
          </div>
          {person.burialPlace && (
            <div className="text-xs text-gray-500 mt-1">
              {person.burialPlace}
            </div>
          )}
        </td>

        {/* Kolumna akcji */}
        <td className="px-4 py-4 text-right text-sm font-medium">
          <div className="relative inline-block text-left">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 focus:outline-none"
            >
              <FontAwesomeIcon icon={faEllipsisV} className="text-gray-400" />
            </button>

            {/* Menu kontekstowe */}
            {isMenuOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenRelationModal(person);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-3 text-gray-500" />
                    Dodaj relację
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEditModal(person);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <FontAwesomeIcon icon={faPen} className="mr-3 text-gray-500" />
                    Edytuj
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDeleteModal(person);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  >
                    <FontAwesomeIcon icon={faUnlink} className="mr-3" />
                    Usuń relację
                  </button>
                </div>
              </div>
            )}
          </div>
        </td>
      </tr>

      {/* Modal usuwania relacji */}
      {isModalOpen && selectedPerson && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          person={selectedPerson.id}
        />
      )}
    </>
  );
};

const getColorByGender = (gender: 'male' | 'female' | 'not-binary') => {
  switch (gender) {
    case 'male':
      return 'bg-blue-50 hover:bg-blue-100';
    case 'female':
      return 'bg-pink-50 hover:bg-pink-100';
    default:
      return 'bg-gray-50 hover:bg-gray-100';
  }
};

const getInitialsBgByGender = (gender: 'male' | 'female' | 'not-binary') => {
  switch (gender) {
    case 'male':
      return 'bg-blue-600';
    case 'female':
      return 'bg-pink-600';
    default:
      return 'bg-gray-600';
  }
};

export default TableRow;