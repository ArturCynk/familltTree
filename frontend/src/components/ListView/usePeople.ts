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
    try {
      const query = `?page=${page}&limit=10${letter ? `&letter=${letter}` : ''}${searchQuery !== '' ? `&searchQuery=${searchQuery}` : ''}`;
      const response = await axios.get(`http://localhost:3001/api/person/users${query}`);
      setPeople(response.data.users);
      setTotalUsers(response.data.totalUsers);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (error) {
      setError('Nie udało się pobrać danych');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPeople();
  }, [letter, page]);

  return { people, loading, error, totalPages, totalUsers, refetch: fetchPeople };
};


export default usePeople;
