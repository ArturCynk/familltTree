import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Spouse {
  id: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "non-binary";
}

interface SpouseSelectionProps {
  personId: string;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
}

const SpouseSelection: React.FC<SpouseSelectionProps> = ({
  personId,
  selectedIds,
  setSelectedIds,
}) => {
  const [spouses, setSpouses] = useState<Spouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSpouses = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Brak tokenu autoryzacyjnego");
          return;
        }

        const response = await axios.get(
          `http://localhost:3001/api/person/users/relation/${personId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSpouses(response.data.Małżonkowie || []);
      } catch (err) {
        setError("Błąd podczas pobierania danych małżonków.");
        toast.error("Nie udało się pobrać danych małżonków");
      } finally {
        setLoading(false);
      }
    };

    if (personId) fetchSpouses();
  }, [personId]);

  const handleRadioChange = (spouseId: string) => {
    setSelectedIds([spouseId]);
  };

  if (loading)
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400 animate-pulse">
        Ładowanie danych...
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-center text-red-600 dark:text-red-400 font-medium">
        {error}
      </div>
    );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all">
      {spouses.length > 1 && (
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 text-center">
          Wybierz matkę lub ojca
        </h3>
      )}

      {spouses.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Brak danych o małżonkach.
        </p>
      )}

      {spouses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {spouses.map((spouse) => (
            <label
              key={spouse.id}
              className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer ${
                selectedIds.includes(spouse.id)
                  ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900"
                  : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500"
              }`}
            >
              <input
                type="radio"
                name="spouse-selection"
                checked={selectedIds.includes(spouse.id)}
                onChange={() => handleRadioChange(spouse.id)}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
              />
              <div className="ml-3 flex flex-col">
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {spouse.firstName} {spouse.lastName}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {spouse.gender === "male"
                    ? "Mężczyzna"
                    : spouse.gender === "female"
                    ? "Kobieta"
                    : "Osoba niebinarna"}
                </span>
              </div>
            </label>
          ))}
        </div>
      )}

      {spouses.length > 1 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Wybierz tylko jednego rodzica
        </p>
      )}
    </div>
  );
};

export default SpouseSelection;
