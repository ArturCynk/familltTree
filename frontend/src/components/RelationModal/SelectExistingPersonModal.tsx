import React, { useState } from 'react';

interface SelectExistingPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

const SelectExistingPersonModal: React.FC<SelectExistingPersonModalProps> = ({ isOpen, onClose }) => {
  const [selectedPerson, setSelectedPerson] = useState<string>('');

  const existingPersons = [
    { id: '1', name: 'Jan Kowalski', gender: 'male' },
    { id: '2', name: 'Anna Nowak', gender: 'female' },
    { id: '3', name: 'Piotr Wiśniewski', gender: 'male' },
  ]; // Lista do przykładu

  const handlePersonSelect = (personId: string) => {
    setSelectedPerson(personId);
  };

  const handleSave = () => {
    if (selectedPerson) {
      // Logika przypisania osoby do relacji
      console.log(`Przypisano osobę ID: ${selectedPerson} do relacji.`);
      onClose();
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
        className="bg-white p-6 rounded shadow-lg w-[400px]"
        onClick={(e) => e.stopPropagation()} // Zapobiega zamknięciu modalnego okna po kliknięciu wewnątrz
      >
        <h2 className="text-lg font-bold mb-4">Wybierz istniejącą osobę</h2>
        <ul>
          {existingPersons.map((person) => (
            <li
              key={person.id}
              className={`p-2 mb-2 border ${selectedPerson === person.id ? 'bg-gray-200' : 'bg-white'} cursor-pointer`}
              onClick={() => handlePersonSelect(person.id)}
            >
              {person.name} ({person.gender === 'male' ? 'Mężczyzna' : 'Kobieta'})
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={onClose} // Zamknięcie modalnego okna po kliknięciu przycisku Anuluj
          >
            Anuluj
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleSave} // Zapisanie wyboru i zamknięcie modalnego okna
          >
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectExistingPersonModal;
