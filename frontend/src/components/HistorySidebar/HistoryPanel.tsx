import React from "react";
import {
  History as HistoryIcon,
  Loader2,
  CalendarDays,
  Clock,
  RefreshCw,
  FileDown,
  AlertCircle,
  PlusCircle,
  Edit,
  Trash2,
  RotateCcw,
  Link,
  Link2Off,
  User,
  X,
  Undo2
} from "lucide-react";

interface HistoryItem {
  id: string;
  date: string;
  time: string;
  description: string;
  action: string;
}

interface HistoryPanelProps {
  changes: HistoryItem[];
  filteredChanges: HistoryItem[];
  loading: boolean;
  error: string | null;
  activeFilter: string;
  actionCounts: { key: string; label: string; count: number }[];
  exporting: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onFilterChange: (filter: string) => void;
  onUndoClick: (id: string) => void;
  side?: "right" | "left";
  isOpen?: boolean;
}

const getActionIcon = (action: string) => {
  const cls = "w-5 h-5";
  switch (action.toLowerCase()) {
    case "create":
      return <PlusCircle className={cls} />;
    case "update":
      return <Edit className={cls} />;
    case "delete":
      return <Trash2 className={cls} />;
    case "restore":
      return <RotateCcw className={cls} />;
    case "add_relation":
      return <Link className={cls} />;
    case "remove_relation":
      return <Link2Off className={cls} />;
    default:
      return <User className={cls} />;
  }
};

const getActionColor = (action: string) => {
  switch (action.toLowerCase()) {
    case "create":
      return "bg-green-100 text-green-600";
    case "update":
      return "bg-yellow-100 text-yellow-600";
    case "delete":
      return "bg-red-100 text-red-600";
    case "restore":
      return "bg-blue-100 text-blue-600";
    case "add_relation":
      return "bg-indigo-100 text-indigo-600";
    case "remove_relation":
      return "bg-purple-100 text-purple-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes}`;
};

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  changes,
  filteredChanges,
  loading,
  error,
  activeFilter,
  actionCounts,
  exporting,
  onClose,
  onRefresh,
  onExport,
  onFilterChange,
  onUndoClick,
  side = "right",
  isOpen = true
}) => {
  return (
    <div
      className={`fixed top-0 ${side === "left" ? "left-0" : "right-0"
        } h-full w-96 max-w-md bg-white shadow-xl border-l z-[100] transform transition-transform duration-300 ease-in-out ${isOpen
          ? "translate-x-0"
          : side === "left"
            ? "-translate-x-full"
            : "translate-x-full"
        }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
        <div className="flex items-center gap-3">
          <HistoryIcon className="w-6 h-6" aria-hidden="true" />
          <h2 id="history-title" className="text-xl font-bold">
            Historia zmian
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 rounded-full hover:bg-blue-500 transition-colors"
            aria-label="Odśwież historię"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={onExport}
            disabled={exporting || changes.length === 0}
            className={`p-2 rounded-full transition-colors ${exporting || changes.length === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-500"
              }`}
            aria-label="Eksportuj do CSV"
            title="Eksportuj do pliku CSV"
          >
            {exporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileDown className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-blue-500 transition-colors"
            aria-label="Zamknij panel"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Filtry */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {actionCounts.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => onFilterChange(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-sm font-medium ${activeFilter === key
                  ? "bg-blue-600 border-blue-700 text-white shadow-md"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              aria-pressed={activeFilter === key}
            >
              <span>{label}</span>
              {count > 0 && (
                <span
                  className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs min-w-[24px] ${activeFilter === key
                      ? "bg-blue-800 text-white"
                      : "bg-gray-200 text-gray-800"
                    }`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Główna zawartość */}
      <div className="h-[calc(100%-128px)] overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Ładowanie historii...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-red-600 font-medium text-lg mb-2">
              Błąd ładowania
            </p>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Spróbuj ponownie
            </button>
          </div>
        ) : filteredChanges.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4 text-gray-500">
              <HistoryIcon className="w-8 h-8" />
            </div>
            <p className="text-gray-700 text-lg font-medium mb-1">
              Brak historii
            </p>
            <p className="text-gray-500 max-w-xs">
              {activeFilter === "all"
                ? "Brak zapisanych zmian"
                : `Brak akcji typu "${actionCounts.find(f => f.key === activeFilter)?.label}"`}
            </p>
          </div>
        ) : (
          <div className="space-y-3 p-4 mb-20">
            {filteredChanges.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="flex gap-3 p-4">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getActionColor(
                      item.action
                    )}`}
                  >
                    {getActionIcon(item.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        <span>{formatDate(item.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(item.time)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => onUndoClick(item.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                    aria-label={`Cofnij akcję: ${item.description}`}
                  >
                    <Undo2 className="w-4 h-4" />
                    Cofnij
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;