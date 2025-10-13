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

  const validateForm = () => {
    if (!selectedOption) {
      setError("Wybierz jedną z opcji (Tak / Nie / Niektóre).");
      return false;
    }

    if (selectedOption === "some" && selectedIds.length === 0) {
      setError("Zaznacz przynajmniej jedną osobę, jeśli wybierasz 'Niektóre'.");
      return false;
    }

    setError("");
    return true;
  };

  return (
    <div className="space-y-4 p-4 sm:p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-3xl mx-auto transition-all">
      <h3 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2 text-center sm:text-left">
        Czy dodać inne dzieci, które są rodzeństwem?
      </h3>

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm font-medium text-center sm:text-left">
          {error}
        </div>
      )}

      {/* Opcje Tak/Nie/Niektóre */}
      <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0 items-start sm:items-center justify-center sm:justify-start">
        {[{ value: "yes", label: "Tak" }, { value: "no", label: "Nie" }, { value: "some", label: "Niektóre" }].map(
          (option) => (
            <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  name="relation"
                  value={option.value}
                  checked={selectedOption === option.value}
                  onChange={() => {
                    setSelectedOption(option.value);
                    setError("");
                  }}
                  className="sr-only peer"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedOption === option.value
                      ? "border-indigo-500 bg-indigo-500"
                      : "border-gray-300 dark:border-gray-600 hover:border-indigo-300"
                  }`}
                >
                  {selectedOption === option.value && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
              <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
            </label>
          )
        )}
      </div>

      {/* Lista relacji */}
      {selectedOption === "some" && (
        <div className="space-y-4 mt-4 max-h-[50vh] overflow-y-auto pr-1 sm:pr-2">
          {Object.entries(relations).map(([relationType, people]) => (
            <div key={relationType}>
              {people.length > 0 && (
                <>
                  <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 capitalize">
                    {relationType}:
                  </h4>
                  <ul
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
                  >
                    {people.map((p) => (
                      <li
                        key={p.id}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedIds.includes(p.id)
                            ? "border-indigo-300 bg-indigo-50 dark:bg-indigo-900 dark:border-indigo-400"
                            : "border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => {
                          handleSelect(p.id);
                          setError("");
                        }}
                      >
                        <FontAwesomeIcon
                          icon={
                            p.gender === "male"
                              ? faMale
                              : p.gender === "female"
                              ? faFemale
                              : faGenderless
                          }
                          className={
                            p.gender === "male"
                              ? "text-blue-500"
                              : p.gender === "female"
                              ? "text-pink-500"
                              : "text-purple-500"
                          }
                        />
                        <span className="ml-3 text-gray-800 dark:text-gray-200 truncate">
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
