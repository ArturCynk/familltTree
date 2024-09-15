import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify'; // Assuming you're using react-toastify

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
  const [existingPersons, setExistingPersons] = useState<any[]>([]); // Adjust type based on your API response
  const [filteredPersons, setFilteredPersons] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchPersons = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`http://localhost:3001/api/person/persons-without-relation/${id}`); // Adjust URL based on your API
          setExistingPersons(response.data.data);
          setFilteredPersons(response.data.data); // Initialize filteredPersons with all data
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
      existingPersons.filter((person) =>
        `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, existingPersons]);

  const handlePersonSelect = (personId: string) => {
    setSelectedPerson(personId);
    setSelectedRelationType(''); // Reset relation type when a new person is selected
  };

  const handleSave = async () => {
    if (selectedPerson && selectedRelationType) {
      try {
        const response = await axios.post('http://localhost:3001/api/person/add-relation', {
          personId: id,
          relatedPersonId: selectedPerson,
          relationType: selectedRelationType
        });
        toast.success(response.data.message); // Display success message
        onClose();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Nie zapisano relacji'); // Display error message
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
        className="bg-white p-8 rounded-lg shadow-lg w-[600px]" // Increased width for a larger modal
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
              <ul>
                {filteredPersons.map((person) => (
                  <li
                    key={person._id}
                    className={`flex items-center space-x-3 p-3 mb-2 border ${selectedPerson === person._id ? 'bg-gray-300' : 'bg-white'} rounded-md shadow-sm cursor-pointer`}
                    onClick={() => handlePersonSelect(person._id)}
                  >
                    <FontAwesomeIcon
                      icon={faUser}
                      className={`text-2xl ${person.gender === 'female' ? 'text-pink-500' : person.gender === 'male' ? 'text-blue-500' : 'text-gray-500'}`}
                      aria-label={`Przejdź do profilu ${person.firstName} ${person.lastName}`}
                    />
                    <span className="text-gray-700 font-medium">
                      {person.firstName} {person.lastName}
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
