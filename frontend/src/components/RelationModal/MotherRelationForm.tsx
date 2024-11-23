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

  // Funkcja do wykonania zapytania do backendu
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
    <div className="space-y-4 p-4 border border-gray-300 rounded-md shadow-md bg-white">
      <h3 className="text-lg font-semibold text-gray-800">czy dodać inne dzieci, które są rodzeństwem?</h3>

      {/* Przyciski radiowe */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="relation"
            value="yes"
            checked={selectedOption === "yes"}
            onChange={() => setSelectedOption("yes")}
            className="form-radio text-blue-500 focus:ring focus:ring-blue-200"
          />
          <span className="text-gray-700">Tak</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="relation"
            value="no"
            checked={selectedOption === "no"}
            onChange={() => setSelectedOption("no")}
            className="form-radio text-blue-500 focus:ring focus:ring-blue-200"
          />
          <span className="text-gray-700">Nie</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="relation"
            value="some"
            checked={selectedOption === "some"}
            onChange={() => setSelectedOption("some")}
            className="form-radio text-blue-500 focus:ring focus:ring-blue-200"
          />
          <span className="text-gray-700">Niektóre</span>
        </label>
      </div>

      {/* Warunkowe renderowanie przy wyborze "Niektóre" */}
      {selectedOption === "some" && (
        <div className="space-y-2">
          {Object.entries(relations).map(([relationType, people]) => (
            <div key={relationType}>
              {people.length > 0 ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2 capitalize">
                    {relationType}:
                  </h3>
                  <ul className="space-y-2">
                    {people.map((p) => (
                      <li
                        key={p._id}
                        className={`flex items-center p-2 rounded-lg border cursor-pointer ${
                          selectedIds.includes(p._id) ? "bg-gray-200" : "hover:bg-gray-100"
                        }`}
                        onClick={() => handleSelect(p._id)}
                      >
                        <span className="mr-3 text-lg">
                          {p.gender === "male" ? (
                            <FontAwesomeIcon icon={faMale} className="text-blue-500" />
                          ) : p.gender === "female" ? (
                            <FontAwesomeIcon icon={faFemale} className="text-pink-500" />
                          ) : (
                            <FontAwesomeIcon icon={faGenderless} className="text-gray-500" />
                          )}
                        </span>
                        <span
                          className={`text-gray-800 ${
                            selectedIds.includes(p._id) ? "font-semibold" : ""
                          }`}
                        >
                          {p.firstName} {p.lastName}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <></>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Wyświetlenie komunikatu zwrotnego */}
      {responseMessage && (
        <p
          className={`text-sm mt-2 ${
            responseMessage.includes("błąd") ? "text-red-500" : "text-green-500"
          }`}
        >
          {responseMessage}
        </p>
      )}
    </div>
  );
};

export default MotherRelationForm;
