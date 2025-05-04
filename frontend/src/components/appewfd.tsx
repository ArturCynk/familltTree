import React, { useEffect, useState } from 'react';

const FamilyTreeComponent = () => {
  const [familyTreeData, setFamilyTreeData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const familyTreeId = '680f5c71eecd0e4b90bcc4a7';
    const ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => {
      console.log('Połączono z WebSocket!');
      // Wysłanie danych autentykacyjnych jako pierwszej wiadomości
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
        } else if (message.type === 'error') {
          console.error('Błąd:', message.message);
        }
      } catch (err) {
        console.error('Błąd parsowania:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('Błąd WebSocket:', error);
    };

    ws.onclose = () => {
      console.log('Połączenie zamknięte');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div>
      <h1>Drzewo genealogiczne</h1>
      {familyTreeData ? (
        <pre>{JSON.stringify(familyTreeData, null, 2)}</pre>
      ) : (
        <p>Ładowanie danych drzewa...</p>
      )}
    </div>
  );
};

export default FamilyTreeComponent;