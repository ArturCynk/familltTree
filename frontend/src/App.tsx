import React, { useEffect, useState } from 'react';
import AddPersonModal from './components/Modal/Modal';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PersonBox from './components/Person/Person';

interface Person {
  _id: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'not-binary';
}

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [persons, setPersons] = useState<Person[]>([]);
  const fetchPersons = async () => {
      try {
        // Pobierz listę użytkowników z endpointu
        const response = await axios.get('http://localhost:3001/api/person/users');
        const personsData: Person[] = response.data; 

        if (personsData.length === 0) {
          setIsModalOpen(true); 
        } else {
          setPersons(personsData); 
        }
      } catch (error) {
        toast.error('Błąd podczas pobierania danych użytkowników.');
        console.error('Error fetching persons:', error);
      }
    };

  useEffect(() => {

    fetchPersons();
  }, []);

  const handleModalClose = () => setIsModalOpen(false);

  const handleRefreshData = async () => {
    await fetchPersons();
  };

  return (
    <div>
      <div className="p-6">
        {persons.map((person) => (
          <PersonBox
            key={person._id}
            gender={person.gender}
            firstName={person.firstName}
            lastName={person.lastName}
            _id={person._id}
            onPersonUpdated={handleRefreshData}
          />
        ))}
      </div>
      <AddPersonModal isOpen={isModalOpen} onClose={() => {
        handleModalClose();
        handleRefreshData(); 
      }} />
      <ToastContainer />
    </div>
  );
};

export default App;
