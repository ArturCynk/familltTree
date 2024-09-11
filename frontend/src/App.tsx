import React, { useEffect, useState } from 'react';
import AddPersonModal from './components/Modal/Modal';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PersonBox from './components/Person/Person';
import Header from './components/Header/Header';
import ErrorScreen from './components/Error/ErrorScreen';
import LoadingSpinner from './components/Loader/LoadingSpinner';

interface Person {
  _id: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'not-binary';
}

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [persons, setPersons] = useState<Person[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Dodaj stan do śledzenia ładowania

  const fetchPersons = async () => {
    setIsLoading(true); // Rozpocznij ładowanie
    try {
      const response = await axios.get('http://localhost:3001/api/person/users');
      const personsData: Person[] = response.data;

      if (personsData.length === 0) {
        setIsModalOpen(true);
      } else {
        setPersons(personsData);
      }
    } catch (error) {
      setError('Błąd podczas pobierania danych użytkowników.');
      console.error('Error fetching persons:', error);
    } finally {
      setIsLoading(false); // Zakończ ładowanie
    }
  };

  useEffect(() => {
    fetchPersons();
  }, []);

  const handleModalClose = () => setIsModalOpen(false);

  const handleRefreshData = async () => {
    setError(null);
    await fetchPersons();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={handleRefreshData} />;
  }

  return (
    <div>
      <Header />
      <div className="p-6">
        {persons.map((person) => (
          <PersonBox
            key={person._id}
            gender={person.gender}
            firstName={person.firstName}
            lastName={person.lastName}
            _id={person._id}
            onPersonUpdated={handleRefreshData}
            handleRefreshData={handleRefreshData}
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
