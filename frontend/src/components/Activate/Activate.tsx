import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const ActivateAccount: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const activateAccount = async () => {
      try {
        // Wyślij token do serwera w celu aktywacji konta
        const response = await axios.post(`http://localhost:3001/api/auth/activate/${token}`);
        toast.success(response.data.message);
        setTimeout(() => {
          window.location.href = '/login'; // Przekierowanie do strony logowania
        }, 3000);
      } catch (err: any) {
        setError('Wystąpił błąd podczas aktywacji konta. Upewnij się, że link jest poprawny.');
        console.log(err);

        toast.error(err.response.data.error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      activateAccount();
    }
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Aktywacja Konta</h1>
        {loading ? (
          <p className="text-center text-gray-600">Trwa aktywacja konta, proszę czekać...</p>
        ) : (
          <p className="text-center text-gray-600">
            {error || 'Twoje konto zostało aktywowane. Możesz teraz się zalogować.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ActivateAccount;
