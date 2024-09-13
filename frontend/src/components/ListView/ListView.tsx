// components/PeopleTable/PeopleTable.tsx
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSort, faSearch, faCog, faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import LoadingSpinner from "../Loader/LoadingSpinner";
import ErrorScreen from "../Error/ErrorScreen";
import RelationModal from "../RelationModal/RelationModal";
import EditModal from '../Edit/Edit';
import SettingsPanel from './SettingsModal'; // Importuj komponent ustawień

interface Person {
  _id: string;
  firstName: string;
  lastName: string;
  birth?: string;
  death?: string;
  location?: string;
  gender: 'male' | 'female' | 'not-binary'; // Typ wymagany
}

const PeopleTable: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState<boolean>(false); // Stan panelu ustawień
  const [showColorCoding, setShowColorCoding] = useState<boolean>(false); // Stan dla kolorowania

  const fetchPeople = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/person/users');
      setPeople(response.data);
      setError(null);
      console.log(people);
      
    } catch (error) {
      setError('Nie udało się pobrać danych');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const openRelationModal = (person: Person) => {
    setSelectedPerson(person);
    setIsRelationModalOpen(true);
  };

  const openEditModal = (person: Person) => {
    setSelectedPerson(person);
    setIsEditModalOpen(true);
  };

  const closeModals = async () => {
    setIsRelationModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedPerson(null);
    await fetchPeople(); // Odświeżanie danych po zamknięciu modali
  };

  const toggleSettingsPanel = () => {
    setIsSettingsPanelOpen(prev => !prev);
  };
  const handleColorCodingChange = (enabled: boolean) => {
    setShowColorCoding(enabled);
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

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorScreen message={error} onRetry={fetchPeople} />;

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-4xl mb-6">
        <div className="text-gray-700 text-sm">Wyświetlanie 1-{people.length} z {people.length} osób</div>
        <div className="flex gap-4 items-center">
          <button className="p-2 rounded-full hover:bg-gray-200 transition duration-300">
            <FontAwesomeIcon icon={faFilter} className="text-gray-600 text-lg" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-200 transition duration-300">
            <FontAwesomeIcon icon={faSort} className="text-gray-600 text-lg" />
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Szukaj"
              className="pl-10 pr-4 py-2 rounded-full shadow text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </div>
          <button
            className="p-2 rounded-full hover:bg-gray-200 transition duration-300"
            onClick={toggleSettingsPanel}
          >
            <FontAwesomeIcon icon={faCog} className="text-gray-600 text-lg" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead className="sticky top-16 z-50 bg-white shadow">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-600">Imię i nazwisko</th>
              <th className="p-4 text-left font-semibold text-gray-600">Rok urodzenia</th>
              <th className="p-4 text-left font-semibold text-gray-600">Data śmierci</th>
              <th className="p-4"></th> {/* Pusty nagłówek dla kolumny akcji */}
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr
              key={person._id}
              className={`relative group border-b transition duration-300 ease-in-out hover:bg-gray-200 ${showColorCoding ? getColorByGender(person.gender) : ''}`}
            >
              <td className="p-4 flex items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white font-semibold rounded-full mr-3">
                  {person.firstName[0]}{person.lastName[0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{`${person.firstName} ${person.lastName}`}</div>
                </div>
              </td>
              <td className="p-4 text-gray-500">{person.birth}</td>
              <td className="p-4 text-gray-500">
                {person.death && `${person.death}${person.location ? `, ${person.location}` : ""}`}
              </td>
              <td className="relative p-6">
                {/* Akcje */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <button
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition duration-300 mr-2"
                    onClick={() => openRelationModal(person)}
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-gray-600 text-lg" />
                  </button>
                  <button
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition duration-300"
                    onClick={() => openEditModal(person)}
                  >
                    <FontAwesomeIcon icon={faPen} className="text-gray-600 text-lg" />
                  </button>
                </div>
              </td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {isRelationModalOpen && selectedPerson && (
        <RelationModal
          isOpen={isRelationModalOpen}
          onClose={closeModals}
          personGender={selectedPerson.gender}
          id={selectedPerson._id}
          personName={`${selectedPerson.firstName} ${selectedPerson.lastName}`}
        />
      )}
      {isEditModalOpen && selectedPerson && (
        <EditModal
          id={selectedPerson._id}
          onClose={closeModals}
        />
      )}
             {/* Panel ustawień */}
      <SettingsPanel
        isOpen={isSettingsPanelOpen}
        onClose={toggleSettingsPanel}
        showColorCoding={showColorCoding}
        onColorCodingChange={handleColorCodingChange}
      />
    </div>
  );
};

export default PeopleTable;
