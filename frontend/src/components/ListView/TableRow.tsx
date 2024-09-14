import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faPlus } from '@fortawesome/free-solid-svg-icons';

interface Person {
  _id: string;
  firstName: string;
  lastName: string;
  maidenName?: string;
  birthDate?: string;
  deathDate?: string;
  location?: string;
  gender: 'male' | 'female' | 'not-binary';
  parents: { _id: string; firstName?: string; lastName?: string }[];
  siblings: { _id: string; firstName?: string; lastName?: string }[];
  spouses: { _id: string; firstName?: string; lastName?: string }[];
  children: { _id: string; firstName?: string; lastName?: string }[];
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
}) => {
  return (
    <tr
      key={person._id}
      className={`relative group border-b transition duration-300 ease-in-out hover:bg-gray-200 ${showColorCoding ? getColorByGender(person.gender) : ''}`}
    >
      <td className="p-4 flex items-center">
        <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white font-semibold rounded-full mr-3">
          {person.firstName[0]}{person.lastName[0]}
        </div>
        <div>
          <div className="font-semibold text-gray-800">{getDisplayName(person)}</div>
          {showRelatives && (
            <div className="px-4 py-2">
              {renderRelations(person)}
            </div>
          )}
        </div>
      </td>
      <td className="p-4 text-gray-500">{formatDate(person.birthDate)}</td>
      <td className="p-4 text-gray-500">
        {person.deathDate && `${formatDate(person.deathDate)}${person.location ? `, ${person.location}` : ""}`}
      </td>
      <td className="relative p-10">
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
          <button
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition duration-300 mr-2"
            onClick={() => onOpenRelationModal(person)}
          >
            <FontAwesomeIcon icon={faPlus} className="text-gray-600 text-lg" />
          </button>
          <button
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition duration-300"
            onClick={() => onOpenEditModal(person)}
          >
            <FontAwesomeIcon icon={faPen} className="text-gray-600 text-lg" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const getColorByGender = (gender: 'male' | 'female' | 'not-binary') => {
  switch (gender) {
    case 'male':
      return 'bg-blue-100'; // Jasnoniebieski dla mężczyzn
    case 'female':
      return 'bg-pink-100'; // Jasnoróżowy dla kobiet
    default:
      return 'bg-gray-100'; // Domyślny kolor dla innych opcji
  }
};

export default TableRow;
