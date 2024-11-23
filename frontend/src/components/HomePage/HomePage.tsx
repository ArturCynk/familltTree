import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTree, faUserFriends, faFileAlt, faCog, faKey,
} from '@fortawesome/free-solid-svg-icons';

const LandingPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    {/* Header */}
    <header className="bg-gradient-to-r from-blue-500 to-teal-400 text-white text-center py-12">
      <h1 className="text-4xl font-extrabold mb-4">Odkryj Swoje Korzenie</h1>
      <p className="text-lg mb-8">Zbuduj swoje drzewo genealogiczne i odkryj historię swojej rodziny</p>
      <div className="flex justify-center space-x-4 mb-6">
        <Link
          to="/register"
          className="bg-white text-blue-500 py-2 px-6 rounded-lg font-semibold shadow-md hover:bg-blue-100 transition"
        >
          Rozpocznij Rejestrację
        </Link>
        <Link
          to="/login"
          className="bg-white text-blue-500 py-2 px-6 rounded-lg font-semibold shadow-md hover:bg-blue-100 transition"
        >
          Zaloguj się
        </Link>
        <Link
          to="/forgot-password"
          className="bg-white text-red-500 py-2 px-6 rounded-lg font-semibold shadow-md hover:bg-red-100 transition"
        >
          Zapomniałeś hasła?
        </Link>
      </div>
    </header>

    {/* Main Content */}
    <main className="flex-1 px-6 py-16">
      <section className="max-w-6xl mx-auto grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <FontAwesomeIcon icon={faTree} className="text-blue-500 text-4xl mb-4" />
          <h2 className="text-xl font-semibold mb-2">Interaktywne Drzewo</h2>
          <p className="text-gray-600">
            Wizualizuj swoje drzewo genealogiczne w interaktywny sposób. Zobacz swoje powiązania z bliskimi w przystępny sposób.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <FontAwesomeIcon icon={faUserFriends} className="text-teal-500 text-4xl mb-4" />
          <h2 className="text-xl font-semibold mb-2">Rodzinne Połączenia</h2>
          <p className="text-gray-600">
            Dodawaj i zarządzaj członkami rodziny, aby stworzyć pełny obraz Twojego drzewa genealogicznego.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <FontAwesomeIcon icon={faFileAlt} className="text-green-500 text-4xl mb-4" />
          <h2 className="text-xl font-semibold mb-2">Dokumentacja</h2>
          <p className="text-gray-600">
            Przechowuj i przeglądaj dokumenty oraz informacje dotyczące historii Twojej rodziny.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <FontAwesomeIcon icon={faCog} className="text-yellow-500 text-4xl mb-4" />
          <h2 className="text-xl font-semibold mb-2">Personalizacja</h2>
          <p className="text-gray-600">
            Dostosuj wygląd i funkcjonalności drzewa genealogicznego do swoich potrzeb.
          </p>
        </div>
      </section>
    </main>

    {/* Footer */}
    <footer className="bg-gray-200 text-center py-4">
      <p className="text-gray-600">
        &copy;
        {new Date().getFullYear()}
        {' '}
        Drzewo Genealogiczne. Wszystkie prawa zastrzeżone.
      </p>
    </footer>
  </div>
);

export default LandingPage;
