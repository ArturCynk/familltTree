import React from "react";
import { AlertCircle, Loader2, Info, Undo2 } from "lucide-react";
import OtherActionPreview from "./OtherActionPreview";


export interface DiffItem {
  field: string;
  currentValue: any;
  restoredValue: any;
  changed: boolean;
}

export interface PreviewData {
  current: Record<string, any> | null;
  restored: Record<string, any> | null;
  differences: DiffItem[];
}

export interface UndoPreviewResponse {
  current: any[];
  simulated: any[];
  removedPersonId?: string;
  restoredPerson?: any;
}



interface UndoConfirmationModalProps {
  logId: string;
  action: string;
  diffData: PreviewData | UndoPreviewResponse | null;
  loadingDiff: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onFetchDiff: (logId: string, action: string) => void;
}


const formatValue = (value: any) => {
  if (value === null || value === undefined) return "Brak";
  if (typeof value === 'boolean') return value ? 'Tak' : 'Nie';
  if (typeof value === 'object') return JSON.stringify(value);

  // Formatowanie daty
  if (typeof value === 'string' && !isNaN(Date.parse(value))) {
    try {
      const date = new Date(value);
      return date.toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return value;
    }
  }

  return value;
};

const translateFieldName = (field: string): string => {
  const fieldTranslations: Record<string, string> = {
    "firstName": "Imię",
    "middleName": "Drugie imię",
    "lastName": "Nazwisko",
    "maidenName": "Nazwisko panieńskie",
    "birthDate": "Data urodzenia",
    "deathDate": "Data śmierci",
    "birthPlace": "Miejsce urodzenia",
    "deathPlace": "Miejsce śmierci",
    "gender": "Płeć",
    "bio": "Biografia",
    "burialPlace": "Miejsce pochówku",
    "occupation": "Zawód",
    "education": "Wykształcenie",
    "notes": "Notatki",
    "parents": "Rodzice",
    "siblings": "Rodzeństwo",
    "spouses": "Małżonkowie",
    "children": "Dzieci",
    // Dodaj inne pola według potrzeb
  };
  return fieldTranslations[field] || field;
};


const UndoConfirmationModal: React.FC<UndoConfirmationModalProps> = ({
  logId,
  action,
  diffData,
  loadingDiff,
  onCancel,
  onConfirm,
  onFetchDiff,
}) => {

  React.useEffect(() => {
    // Jeśli akcja nie jest "update", a diffData jest dostępne, to wyświetl w konsoli
    if (diffData && action !== "update") {
      console.log("Dane do cofnięcia (nie update):", diffData);
    }
  }, [diffData, action]);
  const isPreviewData = (data: any): data is PreviewData => {
    return data && Array.isArray(data.differences);
  };
const isOtherActionPreview = diffData && !isPreviewData(diffData);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[101] p-4">
<div
  className={`bg-white rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto ${
    isOtherActionPreview ? "w-[80%]" : "max-w-4xl w-full"
  }`}
>

        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">
              Potwierdź cofnięcie
            </h3>
            <p className="text-gray-600">
              Czy na pewno chcesz cofnąć tę akcję? Sprawdź poniższe różnice przed kontynuowaniem.
            </p>
          </div>
        </div>

        {/* Przycisk pokaż różnice */}
        <div className="mb-4">
          <button
            onClick={() => onFetchDiff(logId, action)}
            disabled={loadingDiff}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${loadingDiff
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {loadingDiff ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Info className="w-4 h-4" />
            )}
            {diffData ? "Odśwież różnice" : "Pokaż różnice"}
          </button>
        </div>

        {/* Komunikat ładowania różnic */}
        {loadingDiff && !diffData && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mr-3" />
            <span className="text-gray-600">Ładowanie różnic...</span>
          </div>
        )}

        {/* Warunkowe wyświetlenie tabeli tylko dla akcji update */}
        {isPreviewData(diffData) && diffData.differences.length > 0 ? (

          <div className="mb-6 border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h4 className="font-medium text-gray-700">Podgląd zmian po cofnięciu</h4>
              <p className="text-sm text-gray-500">
                Porównanie aktualnego stanu z wartościami po cofnięciu
              </p>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pole
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Obecna wartość
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wartość po cofnięciu
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {diffData.differences.map((diff, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {translateFieldName(diff.field)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatValue(diff.currentValue)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        <span className={diff.changed ? "text-blue-600 font-medium" : "text-gray-500"}>
                          {formatValue(diff.restoredValue)}
                        </span>
                        {diff.changed && (
                          <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Zmiana
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          diffData && (
            <div className="mb-6">
               <OtherActionPreview action={action} diffData={diffData as UndoPreviewResponse} />
            </div>
          )
        )}

        {/* Jeśli nie update i jest diffData, nic nie pokazujemy, bo jest console.log w useEffect */}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Anuluj
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Undo2 className="w-4 h-4" />
            Tak, cofnij
          </button>
        </div>
      </div>
    </div>
  );
};

export default UndoConfirmationModal;