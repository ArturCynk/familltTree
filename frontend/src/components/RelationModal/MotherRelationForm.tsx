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
    <div className="space-y-4 p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
        Czy dodać inne dzieci, które są rodzeństwem?
      </h3>
      <div className="space-y-3">
        {[{ value: "yes", label: "Tak" }, { value: "no", label: "Nie" }, { value: "some", label: "Niektóre" }].map((option) => (
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
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedOption === option.value
                    ? "border-indigo-500 bg-indigo-500"
                    : "border-gray-300 dark:border-gray-600 hover:border-indigo-300"
                }`}
              >
                {selectedOption === option.value && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
            </div>
            <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
          </label>
        ))}
      </div>

      {selectedOption === "some" && (
        <div className="space-y-4 mt-4">
          {Object.entries(relations).map(([relationType, people]) => (
            <div key={relationType}>
              {people.length > 0 && (
                <>
                  <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 capitalize">
                    {relationType}:
                  </h4>
                  <ul className="space-y-2">
                    {people.map((p) => (
                      <li
                        key={p.id}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedIds.includes(p.id)
                            ? "border-indigo-300 bg-indigo-50 dark:bg-indigo-900 dark:border-indigo-400"
                            : "border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => handleSelect(p.id)}
                      >
                        <FontAwesomeIcon
                          icon={p.gender === "male" ? faMale : p.gender === "female" ? faFemale : faGenderless}
                          className={
                            p.gender === "male"
                              ? "text-blue-500"
                              : p.gender === "female"
                              ? "text-pink-500"
                              : "text-purple-500"
                          }
                        />
                        <span className="ml-3 text-gray-800 dark:text-gray-200">
                          {p.firstName} {p.lastName}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MotherRelationForm;