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
    ));
  }, [searchTerm, persons]);

  const handlePersonSelect = (personId: string) => {
    setSelectedPerson(personId);
  };

  const handleSave = async () => {
    if (selectedPerson && selectedRelationType) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.post(
          'http://localhost:3001/api/person/add-relation',
          {
            personId: id,
            relatedPersonId: selectedPerson,
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
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-700 to-purple-800 px-6 py-4">
          <div className="relative flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Wybierz istniejącą osobę</h2>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-72px)]">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-6">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Wyszukaj osobę..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/90 hover:bg-white"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute right-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Persons List */}
              <div className="border rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {filteredPersons.map((person) => (
                    <li
                      key={person._id}
                      className={`flex items-center p-4 cursor-pointer transition-colors ${
                        selectedPerson === person._id 
                          ? 'bg-indigo-50 border-l-4 border-indigo-500' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handlePersonSelect(person._id)}
                    >
                      <span className="mr-4">
                        {person.gender === 'male' ? (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <FontAwesomeIcon icon={faMale} />
                          </div>
                        ) : person.gender === 'female' ? (
                          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                            <FontAwesomeIcon icon={faFemale} />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <FontAwesomeIcon icon={faGenderless} />
                          </div>
                        )}
                      </span>
                      <div className="flex-1">
                        <h3 className={`text-base font-medium ${
                          selectedPerson === person._id ? 'text-indigo-700' : 'text-gray-800'
                        }`}>
                          {person.firstName} {person.lastName}
                        </h3>
                        {person.birthDate && (
                          <p className="text-sm text-gray-500">
                            {new Date(person.birthDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {selectedPerson === person._id && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Relation Type Selector */}
              {selectedPerson && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Typ relacji</label>
                  <div className="relative">
                    <select
                      value={selectedRelationType}
                      onChange={(e) => setSelectedRelationType(e.target.value)}
                      className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                    >
                      <option value="">Wybierz typ relacji</option>
                      {relationshipTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="button"
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