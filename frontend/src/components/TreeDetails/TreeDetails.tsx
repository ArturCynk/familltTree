import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

const TreeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [familyTreeData, setFamilyTreeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const familyTreeId = id;
    const ws = new WebSocket('ws://localhost:3001');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Połączono z WebSocket!');
      ws.send(JSON.stringify({
        type: 'auth',
        token: token,
        familyTreeId: familyTreeId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'familyTreeData') {
          console.log('Dane drzewa:', message.data);
          setFamilyTreeData(message.data);
          setIsLoading(false); // Koniec ładowania
        } else if (message.type === 'error') {
          console.error('Błąd:', message.message);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Błąd parsowania:', err);
        setIsLoading(false);
      }
    };

    ws.onerror = (error) => {
      console.error('Błąd WebSocket:', error);
      setIsLoading(false);
    };

    ws.onclose = () => {
      console.log('Połączenie zamknięte');
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleUpdatePerson = () => {
    const updateData = {
      type: 'updatePerson',
      personId: '6817b2c001c0e11789cc34df',
      data: {
        firstName: 'Jan',
        lastName: 'Kowalski'
      }
    };
    wsRef.current?.send(JSON.stringify(updateData));
    setIsLoading(true); // Załaduj ponownie po aktualizacji
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Drzewo genealogiczne</h1>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : familyTreeData ? (
        <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(familyTreeData, null, 2)}</pre>
      ) : (
        <p>Nie znaleziono danych drzewa.</p>
      )}

      <button
        onClick={handleUpdatePerson}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Zaktualizuj dane osoby
      </button>
    </div>
  );
};

export default TreeDetails;
