import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTree, 
  faUsers as faUserFriends, 
  faFileAlt, 
  faArrowRight, 
  faSearch, 
  faProjectDiagram ,
  faBookOpen 
} from '@fortawesome/free-solid-svg-icons';

const LandingPage: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
    {/* Hero Section */}
    <div className="relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-8 lg:py-40 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
            Odkryj historię swojej rodziny
          </span>
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
          Zbuduj interaktywne drzewo genealogiczne i połącz się z przodkami w zupełnie nowy sposób
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/register"
            className="group relative flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <span className="relative z-10">Rozpocznij przygodę</span>
            <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
              <FontAwesomeIcon icon={faArrowRight} />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-700 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
          </Link>
          <Link
            to="/login"
            className="flex-1 sm:flex-none px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors duration-300"
          >
            Zaloguj się
          </Link>
          <Link
            to="/forgot-password"
            className="flex-1 sm:flex-none px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors duration-300"
          >
            Zrestartuj hasło
          </Link>
        </div>
      </div>
    </div>

    {/* Features Grid */}
    <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28 lg:px-8 -mt-12">
      <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-[80%] h-64 bg-blue-500/10 blur-3xl rounded-full"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {[
          {
            icon: faTree,
            title: "Dynamiczne drzewo",
            description: "Trójwymiarowa wizualizacja powiązań rodzinnych z możliwością nawigacji",
            color: "text-teal-400"
          },
          {
            icon: faSearch,
            title: "Zaawansowane wyszukiwanie",
            description: "Znajdź przodków na podstawie dat, miejsc czy zawodów",
            color: "text-blue-400"
          },
          {
            icon: faProjectDiagram,
            title: "Analiza powiązań",
            description: "Odkryj nieoczywiste związki między członkami rodziny",
            color: "text-purple-400"
          },
          {
            icon: faBookOpen,
            title: "Historie rodzinne",
            description: "Zachowaj wspomnienia i historie w cyfrowej formie",
            color: "text-amber-400"
          },
          {
            icon: faUserFriends,
            title: "Współpraca",
            description: "Zapraszaj członków rodziny do wspólnego budowania drzewa",
            color: "text-green-400"
          },
          {
            icon: faFileAlt,
            title: "Dokumentacja",
            description: "Przechowuj zdjęcia i dokumenty w jednym miejscu",
            color: "text-rose-400"
          }
        ].map((feature, index) => (
          <div 
            key={index}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-teal-400/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className={`w-12 h-12 ${feature.color} bg-gray-700 rounded-lg flex items-center justify-center mb-4`}>
              <FontAwesomeIcon icon={feature.icon} className="text-xl" />
            </div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>

    {/* CTA Section */}
    <div className="relative bg-gradient-to-br from-blue-900/40 to-teal-900/40 py-20 overflow-hidden">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Gotowy, by rozpocząć swoją podróż?</h2>
        <p className="text-xl text-gray-300 mb-10">
          Dołącz do tysięcy użytkowników, którzy już odkrywają swoje korzenie
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Załóż konto za darmo
          </Link>
          <Link
            to="/about"
            className="px-8 py-4 border border-white/30 rounded-xl font-semibold hover:bg-white/10 transition-colors duration-300"
          >
            Dowiedz się więcej
          </Link>
        </div>
      </div>
    </div>

    {/* Footer */}
    <footer className="bg-gray-900/50 backdrop-blur-md border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
              GenealogiaPro
            </span>
            <p className="text-gray-500 mt-2">Odkrywaj, dokumentuj, dziel się</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Polityka prywatności</Link>
            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Warunki użytkowania</Link>
            <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Kontakt</Link>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500">
          &copy; {new Date().getFullYear()} GenealogiaPro. Wszelkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  </div>
);

export default LandingPage;