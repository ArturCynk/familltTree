import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMale, faFemale, faGenderless } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

interface SelectExistingPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
   onUpdate?: (updatedPerson: any) => void;
}

const relationshipTypes = [
  { value: 'parent', label: 'Rodzic' },
  { value: 'sibling', label: 'Rodzeństwo' },
  { value: 'spouse', label: 'Małżonek' },
  { value: 'child', label: 'Dziecko' },
];

const SelectExistingPersonModal: React.FC<SelectExistingPersonModalProps> = ({ id, isOpen, onClose,onUpdate }) => {
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
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
          const token = localStorage.getItem('authToken');
          const response = await axios.get(`http://localhost:3001/api/person/persons-without-relation/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
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
    setFilteredPersons(
      persons.filter((person) =>
        `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, persons]);

  const handleSave = async () => {
    if (!selectedPerson || !selectedRelationType) {
      toast.error('Wybierz osobę i typ relacji.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:3001/api/person/add-relation',
        {
          personId: id,
          relatedPersonId: selectedPerson._id,
          relationType: selectedRelationType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      toast.success(response.data.message);

      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Nie zapisano relacji');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-r from-indigo-700 to-purple-800 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Wybierz istniejącą osobę</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-72px)]">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-6">
              {!selectedPerson ? (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Wyszukaj osobę..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredPersons.map((person) => (
                        <li
                          key={person._id}
                          className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => setSelectedPerson(person)}
                        >
                          <span className="mr-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              person.gender === 'male'
                                ? 'bg-blue-100 text-blue-600'
                                : person.gender === 'female'
                                ? 'bg-pink-100 text-pink-600'
                                : 'bg-purple-100 text-purple-600'
                            }`}>
                              <FontAwesomeIcon icon={
                                person.gender === 'male' ? faMale : person.gender === 'female' ? faFemale : faGenderless
                              } />
                            </div>
                          </span>
                          <div>
                            <h3 className="text-base font-medium text-gray-800 dark:text-gray-200">
                              {person.firstName} {person.lastName}
                            </h3>
                            {person.birthDate && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(person.birthDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <div className="flex items-center">
                    <div className="mr-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedPerson.gender === 'male'
                          ? 'bg-blue-100 text-blue-600'
                          : selectedPerson.gender === 'female'
                          ? 'bg-pink-100 text-pink-600'
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        <FontAwesomeIcon icon={
                          selectedPerson.gender === 'male'
                            ? faMale
                            : selectedPerson.gender === 'female'
                            ? faFemale
                            : faGenderless
                        } />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-indigo-700 dark:text-indigo-300">
                        {selectedPerson.firstName} {selectedPerson.lastName}
                      </h3>
                      {selectedPerson.birthDate && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(selectedPerson.birthDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setSelectedPerson(null)} className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                    Zmień
                  </button>
                </div>
              )}

              {selectedPerson && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Typ relacji</label>
                  <select
                    value={selectedRelationType}
                    onChange={(e) => setSelectedRelationType(e.target.value)}
                    className="block w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Wybierz typ relacji</option>
                    {relationshipTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Anuluj
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedPerson || !selectedRelationType}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedPerson && selectedRelationType
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Zapisz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectExistingPersonModal;
