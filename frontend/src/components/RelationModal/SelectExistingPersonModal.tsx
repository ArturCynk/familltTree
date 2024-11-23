import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMale, faFemale, faGenderless } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

interface SelectExistingPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

const relationshipTypes = [
  { value: 'parent', label: 'Rodzic' },
  { value: 'sibling', label: 'Rodzeństwo' },
  { value: 'spouse', label: 'Małżonek' },
  { value: 'child', label: 'Dziecko' },
];

const SelectExistingPersonModal: React.FC<SelectExistingPersonModalProps> = ({ id, isOpen, onClose }) => {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [selectedRelationType, setSelectedRelationType] = useState<string>('');
  const [persons, setPersons] = useState<any[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchPersons = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('authToken'); // Get token from localStorage
          const response = await axios.get(`http://localhost:3001/api/person/persons-without-relation/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`, // Add authorization header
            },
          });
          setPersons(response.data.data);
          setFilteredPersons(response.data.data);
        } catch (err) {
          setError('Nie udało się załadować osób');
        } finally {
          setLoading(false);
        }
      };

      fetchPersons();
    }
  }, [isOpen, id]);

  useEffect(() => {
    // Filter persons based on search term
    setFilteredPersons(
      persons.filter((person) => `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [searchTerm, persons]);
  console.log(filteredPersons);

  const handlePersonSelect = (personId: string) => {
    setSelectedPerson(personId); // Select only one person
    console.log(personId);
  };

  const handleSave = async () => {
    if (selectedPerson && selectedRelationType) {
      try {
        const token = localStorage.getItem('authToken'); // Get token from localStorage
        const response = await axios.post(
          'http://localhost:3001/api/person/add-relation',
          {
            personId: id,
            relatedPersonId: selectedPerson,
            relationType: selectedRelationType,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Add authorization header
              'Content-Type': 'application/json',
            },
          },
        );
        toast.success(response.data.message); // Show success message
        onClose();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Nie zapisano relacji'); // Show error message
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
      style={{ zIndex: 1100 }}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-lg w-[600px]" // Modal styling
        onClick={(e) => e.stopPropagation()} // Prevent closing modal on inner click
      >
        <h2 className="text-lg font-bold mb-4">Wybierz istniejącą osobę</h2>
        {loading && <p>Ładowanie...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <div>
            <input
              type="text"
              placeholder="Szukaj osoby..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <div className="max-h-[400px] overflow-y-auto">
              <ul className="space-y-2">
                {filteredPersons.map((person) => (
                  <li
                    key={person._id}
                    className={`flex items-center p-2 rounded-lg border cursor-pointer ${
                      selectedPerson === person._id ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handlePersonSelect(person._id)}
                  >
                    <span className="mr-3 text-lg">
                      {person.gender === 'male' ? (
                        <FontAwesomeIcon icon={faMale} className="text-blue-500" />
                      ) : person.gender === 'female' ? (
                        <FontAwesomeIcon icon={faFemale} className="text-pink-500" />
                      ) : (
                        <FontAwesomeIcon icon={faGenderless} className="text-gray-500" />
                      )}
                    </span>
                    <span className={`text-gray-800 ${selectedPerson === person._id ? 'font-semibold' : ''}`}>
                      {person.firstName}
                      {' '}
                      {person.lastName}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {selectedPerson && (
              <div className="mt-4">
                <label className="block mb-2 text-gray-700">Wybierz typ relacji:</label>
                <select
                  value={selectedRelationType}
                  onChange={(e) => setSelectedRelationType(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Wybierz typ</option>
                  {relationshipTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
        <div className="mt-6 flex justify-between">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={onClose} // Close modal on Cancel button click
          >
            Anuluj
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleSave} // Save selection and close modal
          >
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectExistingPersonModal;
