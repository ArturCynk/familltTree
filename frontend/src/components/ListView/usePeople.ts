import { useState, useEffect } from 'react';
import axios from 'axios';
import { Person } from './Types';

interface Filters {
  firstName: string;
  lastName: string;
  gender: string;
  status: string;
  birthPlace: string;
  deathPlace: string;
  birthDateFrom: string;
  birthDateTo: string;
  deathDateFrom: string;
  deathDateTo: string;
}

const usePeople = (letter: string | null, page: number, searchQuery: string | null, filters: Filters) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<string>('');

  const fetchPeople = async () => {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    try {
      let query = `?page=${page}&limit=25`;
      
      // Dodaj literę jeśli wybrana
      if (letter) query += `&letter=${letter}`;
      
      // Dodaj wyszukiwanie jeśli istnieje
      if (searchQuery) query += `&searchQuery=${searchQuery}`;
      
      // Dodaj filtry jeśli istnieją
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          query += `&${key}=${encodeURIComponent(value)}`;
        }
      });

      console.log(`Fetching with query: ${query}`); // Debugowanie zapytania
      

      const response = await axios.get(`http://localhost:3001/api/person/users${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response)
      

      setPeople(response.data.users);
      setTotalUsers(response.data.totalUsers);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (error: any) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('authToken');
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
  }, [letter, page, searchQuery, filters]); // Dodaj filters do zależności

  return {
    people, 
    loading, 
    error, 
    totalPages, 
    totalUsers, 
    refetch: fetchPeople,
  };
};

export default usePeople;