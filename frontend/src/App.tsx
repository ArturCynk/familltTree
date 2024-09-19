import React, { useEffect, useState } from 'react';
import AddPersonModal from './components/Modal/Modal';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PersonBox from './components/Person/Person';
import ErrorScreen from './components/Error/ErrorScreen';
import LoadingSpinner from './components/Loader/LoadingSpinner';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ListView from './components/ListView/ListView';
import Login from './components/LoginPage/LoginPage';
import Register from './components/RegisterPage/Register';
import ActivateAccount from './components/Activate/Activate';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import ChangePassword from './components/ChangePassword/ChangePassword';
import LeftHeader from './components/LeftHeader/LeftHeader';
import HomePage from './components/HomePage/HomePage';

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

  // const fetchPersons = async () => {
  //   setIsLoading(false); // Rozpocznij ładowanie
  //   try {
  //     const token = localStorage.getItem('authToken'); // Pobierz token z localStorage
  //     const response = await axios.get('http://localhost:3001/api/person/count', {
  //       headers: {
  //         'Authorization': `Bearer ${token}` // Dodaj nagłówek autoryzacji
  //       }
  //     });
  //     const personsData: Person[] = response.data;      

  //     if (response.data.count === 0) {
  //       setIsModalOpen(true);
  //     } else {
  //       setPersons(personsData);
  //     }
  //   } catch (error) {
  //     setError('Błąd podczas pobierania danych użytkowników.');
  //     console.error('Error fetching persons:', error);
  //   } finally {
  //     setIsLoading(false); // Zakończ ładowanie
  //   }
  // };

  // useEffect(() => {
  //   fetchPersons();
  // }, []);

  const handleModalClose = () => setIsModalOpen(false);


  return (
    <div>
      <Router>
      <Routes>
        {/* <Route path="/family-view" element={<FamilyView />} />
        <Route path="/ancestry-view" element={<AncestryView />} />
        <Route path="/fan-view" element={<FanView />} /> */}
        <Route path="/list-view" element={<ListView />} />
        <Route path='/' element={<HomePage />} />
        {/* Dodaj inne trasy w zależności od potrzeb */}
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register/>} />
        <Route path="/activate/:token" element={<ActivateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ChangePassword />} />
      </Routes>
    </Router>
      {/* <div className="p-6">
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
      </div> */}
      <ToastContainer />
    </div>
    
  );
};

export default App;
