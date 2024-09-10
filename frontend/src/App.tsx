import React, { useEffect, useState } from 'react';
import AddPersonModal from './components/Modal/Modal';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PersonBox from './components/Person/Person';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkPersonCount = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/person/count');
        if (response.data.count === 0) {
          setIsModalOpen(true);
        }
      } catch (error) {
        toast.error('Błąd podczas sprawdzania liczby osób.');
        console.error('Error checking person count:', error);
      }
    };

    checkPersonCount();
  }, []);

  const handleModalClose = () => setIsModalOpen(false);

  return (
    <div>
       <div className="p-6">
      <PersonBox gender="male" firstName="John" lastName="Doe" />
      <br />
      <PersonBox gender="female" firstName="Jane" lastName="Doe" />
    </div>
      <AddPersonModal isOpen={isModalOpen} onClose={handleModalClose} />
      <ToastContainer />
    </div>
  );
};

export default App;
