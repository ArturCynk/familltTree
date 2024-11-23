import { useState, useEffect } from 'react';
import axios from 'axios';
import { Person } from './Types';

const usePeople = (letter: string | null, page: number, searchQuery: string | null) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<string>('');

  const fetchPeople = async () => {
    setLoading(true);
    const token = localStorage.getItem('authToken'); // Pobierz token z localStorage
    try {
      // const query = `?page=${page}&limit=25${letter ? `&letter=${letter}` : ''}${searchQuery !== '' ? `&searchQuery=${searchQuery}` : ''}`;
      const query = '';
      const response = await axios.get(`http://localhost:3001/api/person/users${query}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Dodaj nagłówek autoryzacji
        },
      });

      console.log(response.data);

      // Process successful response
      setPeople(response.data.users);
      setTotalUsers(response.data.totalUsers);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (error: any) {
      // Handle errors
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('authToken'); // Usuń token
        setError('Brak dostępu lub nieautoryzowany dostęp');
      } else {
        setError('Nie udało się pobrać danych');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, [letter, page, searchQuery]); // Dodaj searchQuery do zależności

  return {
    people, loading, error, totalPages, totalUsers, refetch: fetchPeople,
  };
};

export default usePeople;
