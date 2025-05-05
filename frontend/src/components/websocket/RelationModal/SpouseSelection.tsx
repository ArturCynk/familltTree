import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Spouse {
    id: string;
    firstName: string;
    lastName: string;
    gender: 'male' | 'female' | 'non-binary';
}

interface SpouseSelectionProps {
    personId: string;
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
}

const SpouseSelection: React.FC<SpouseSelectionProps> = ({
    personId,
    selectedIds,
    setSelectedIds
}) => {
    const [spouses, setSpouses] = useState<Spouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSpouses = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(
                    `http://localhost:3001/api/person/users/relation/${personId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setSpouses(response.data.Małżonkowie || []);
            } catch (err) {
                setError('Błąd podczas pobierania rodziców');
                toast.error('Nie udało się pobrać danych rodziców');
            } finally {
                setLoading(false);
            }
        };

        if (personId) {
            fetchSpouses();
        }
    }, [personId]);

    const handleRadioChange = (spouseId: string) => {
        setSelectedIds([spouseId]); // Zawsze ustawia tylko jeden wybrany ID
    };

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Ładowanie rodziców...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500 dark:text-red-400">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-4 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
            {spouses.length > 1 && (
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                    Wybierz matkę/ojca
                </h3>
            )}

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {spouses.length > 1 && spouses.map((spouse) => (
                        <label
                            key={spouse.id}
                            className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors cursor-pointer"
                        >
                            <input
                                type="radio"
                                name="parent-selection"
                                checked={selectedIds.includes(spouse.id)}
                                onChange={() => handleRadioChange(spouse.id)}
                                className="h-4 w-4 text-indigo-600 dark:text-indigo-400 border-gray-300 rounded-full focus:ring-indigo-500"
                            />
                            <span className="ml-3 flex-1">
                                <span className="block font-medium text-gray-700 dark:text-gray-200">
                                    {spouse.firstName} {spouse.lastName}
                                </span>
                                <span className="block text-sm text-gray-500 dark:text-gray-400">
                                    {spouse.gender === 'male' ? 'Mężczyzna' :
                                        spouse.gender === 'female' ? 'Kobieta' : 'Niebinarna'}
                                </span>
                            </span>
                        </label>
                    ))}
                </div>

                {spouses.length > 1 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Wybierz jednego rodzica
                    </p>
                )}
            </div>
        </div>
    );
};

export default SpouseSelection;