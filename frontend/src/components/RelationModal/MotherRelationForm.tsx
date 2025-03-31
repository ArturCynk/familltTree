import React, { useState, useEffect } from "react";
import axios from "axios";
import { Person } from "../ListView/Types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFemale, faGenderless, faMale } from "@fortawesome/free-solid-svg-icons";

interface MotherRelationFormProps {
  personId: string;
  selectedOption: string;
  setSelectedOption: React.Dispatch<React.SetStateAction<string>>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const MotherRelationForm: React.FC<MotherRelationFormProps> = ({
  personId,
  selectedOption,
  setSelectedOption,
  selectedIds,
  setSelectedIds,
}) => {
  const [relations, setRelations] = useState<{
    parents: Person[];
    siblings: Person[];
    spouses: Person[];
    children: Person[];
  }>({
    parents: [],
    siblings: [],
    spouses: [],
    children: [],
  });

  const [loading, setLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string>(""); 
  const [responseMessage, setResponseMessage] = useState(""); 

  useEffect(() => {
    const fetchRelations = async () => {
      setLoading(true);
      setError(""); 

      try {
        const token = localStorage.getItem("authToken"); 

        if (!token) {
          setError("Brak tokenu autoryzacyjnego");
          return;
        }

        const response = await axios.get(
          `http://localhost:3001/api/person/users/relation/${personId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRelations(response.data);
      } catch (error) {
        setError("Wystąpił błąd podczas ładowania relacji.");
        console.error("Error fetching relations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (personId) {
      fetchRelations();
    }
  }, [personId]);

  const handleSelect = (id: string) => {
    setSelectedIds((prevSelectedIds) =>
      prevSelectedIds.includes(id)
        ? prevSelectedIds.filter((selectedId) => selectedId !== id)
        : [...prevSelectedIds, id]
    );
  };

  return (
    <div className="space-y-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
      <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        Czy dodać inne dzieci, które są rodzeństwem?
      </h3>

      {/* Przyciski radiowe */}
      <div className="space-y-3">
        {[
          { value: "yes", label: "Tak" },
          { value: "no", label: "Nie" },
          { value: "some", label: "Niektóre" }
        ].map((option) => (
          <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
            <div className="relative">
              <input
                type="radio"
                name="relation"
                value={option.value}
                checked={selectedOption === option.value}
                onChange={() => setSelectedOption(option.value)}
                className="sr-only peer"
              />
              <div className={`w-5 h-5 rounded-full border-2 ${
                selectedOption === option.value 
                  ? "border-indigo-500 bg-indigo-500" 
                  : "border-gray-300 hover:border-indigo-300"
              } flex items-center justify-center transition-colors`}>
                {selectedOption === option.value && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
            </div>
            <span className="text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>

      {/* Warunkowe renderowanie przy wyborze "Niektóre" */}
      {selectedOption === "some" && (
        <div className="space-y-4 mt-4">
          {Object.entries(relations).map(([relationType, people]) => (
            <div key={relationType}>
              {people.length > 0 && (
                <>
                  <h4 className="text-base font-semibold text-gray-700 mb-2 capitalize flex items-center">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                    {relationType}:
                  </h4>
                  <ul className="space-y-2">
                    {people.map((p) => (
                      <li
                        key={p.id}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedIds.includes(p.id) 
                            ? "border-indigo-300 bg-indigo-50" 
                            : "border-gray-200 hover:bg-gray-100"
                        }`}
                        onClick={() => handleSelect(p.id)}
                      >
                        <span className="mr-3 text-lg">
                          {p.gender === "male" ? (
                            <FontAwesomeIcon icon={faMale} className="text-blue-500" />
                          ) : p.gender === "female" ? (
                            <FontAwesomeIcon icon={faFemale} className="text-pink-500" />
                          ) : (
                            <FontAwesomeIcon icon={faGenderless} className="text-purple-500" />
                          )}
                        </span>
                        <span className={`text-gray-800 ${selectedIds.includes(p.id) ? "font-medium" : ""}`}>
                          {p.firstName} {p.lastName}
                        </span>
                        {selectedIds.includes(p.id) && (
                          <span className="ml-auto text-indigo-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Komunikaty */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {responseMessage && (
        <div className={`mt-4 p-3 rounded-lg border ${
          responseMessage.includes("błąd") 
            ? "bg-red-50 border-red-200 text-red-600" 
            : "bg-green-50 border-green-200 text-green-600"
        } flex items-center`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {responseMessage}
        </div>
      )}
    </div>
  );
};

export default MotherRelationForm;