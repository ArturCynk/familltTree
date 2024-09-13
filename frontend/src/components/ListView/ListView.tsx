import React from 'react';

const ListView: React.FC = () => {
  // Tu możesz dodać stan, funkcje lub efekty, jeśli widok listy będzie miał jakieś dodatkowe funkcjonalności.

  return (
    <div className="p-6 bg-white">
      <h2 className="text-2xl font-bold mb-4">Widok listy</h2>
      {/* Tu możesz dodać zawartość widoku listy, np. tabelę z osobami */}
      
      <ul className="list-disc pl-6">
        {/* Przykładowe dane */}
        <li>Osoba 1</li>
        <li>Osoba 2</li>
        <li>Osoba 3</li>
        {/* Dodaj więcej elementów listy w zależności od potrzeb */}
      </ul>
    </div>
  );
};

export default ListView;
