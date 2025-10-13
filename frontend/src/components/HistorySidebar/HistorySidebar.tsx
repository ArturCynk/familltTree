import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { saveAs } from 'file-saver';
import HistoryPanel from "./HistoryPanel";
import UndoConfirmationModal from "./UndoConfirmationModal";

interface HistoryItem {
  id: string;
  date: string;
  time: string;
  description: string;
  action: string;
}

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onUndo: (id: string) => void;
  side?: "right" | "left";
  type?: "user" | "familyTree";
  id?: string;
}

const HISTORY_STORAGE_KEY = "genealogy-history-cache";

const ACTION_TYPES = [
  { key: "all", label: "Wszystko", count: 0 },
  { key: "create", label: "Utwórz", count: 0 },
  { key: "update", label: "Edytuj", count: 0 },
  { key: "delete", label: "Usuń", count: 0 },
  { key: "restore", label: "Przywróć", count: 0 },
  { key: "add_relation", label: "Dodano relację", count: 0 },
  { key: "remove_relation", label: "Usunięto relację", count: 0 },
];

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  onUndo,
  side = "right",
  type,
  id
}) => {
  const [changes, setChanges] = useState<HistoryItem[]>([]);
  const [filteredChanges, setFilteredChanges] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [confirmingUndo, setConfirmingUndo] = useState<string | null>(null);
  const [actionCounts, setActionCounts] = useState(ACTION_TYPES);
  const [exporting, setExporting] = useState(false);
  const [diffData, setDiffData] = useState<any>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);

  // Obsługa klawiatury - Escape zamyka panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Obliczanie liczby akcji dla filtrów
  const calculateActionCounts = useCallback((data: HistoryItem[]) => {
    return ACTION_TYPES.map(type => ({
      ...type,
      count: type.key === "all"
        ? data.length
        : data.filter(item => item.action === type.key).length
    }));
  }, []);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
          const url =
        type === "user"
          ? `/api/history?type=user`
          : `/api/history?type=familyTree&familyTreeId=${id}`;
          
      const res = await axios.get(`http://localhost:3001${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChanges(res.data);
      const counts = calculateActionCounts(res.data);
      setActionCounts(counts);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(res.data));
    } catch (err) {
      console.error("Błąd podczas pobierania historii zmian:", err);
      setError("Nie udało się załadować historii zmian. Spróbuj ponownie.");

      const cached = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          setChanges(cachedData);
          const counts = calculateActionCounts(cachedData);
          setActionCounts(counts);
        } catch (e) {
          console.error("Błąd przetwarzania pamięci podręcznej", e);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [calculateActionCounts]);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      setDiffData(null);
    }
  }, [isOpen, loadHistory]);

  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredChanges(changes);
    } else {
      setFilteredChanges(changes.filter(c => c.action === activeFilter));
    }
  }, [activeFilter, changes]);

  const handleUndo = async (id: string) => {
    try {
      onUndo(id);
    } catch (error) {
      console.error("Błąd podczas cofania akcji:", error);
      alert("Nie udało się cofnąć akcji. Spróbuj ponownie.");
    } finally {
      setConfirmingUndo(null);
      setDiffData(null);
    }
  };

  const actionToEndpoint: Record<string, string> = {
    update: "http://localhost:3001/api/history/simulate-undo-update/",
    create: "http://localhost:3001/api/history/simulate-undo-create/",
    delete: "http://localhost:3001/api/history/simulate-undo-delete/",
    add_relation: "http://localhost:3001/api/history/simulate-undo-add-relation/",
    remove_relation: "http://localhost:3001/api/history/simulate-undo-remove-relation/",
  };


  const fetchDiffData = async (logId: string, action: string) => {
    setLoadingDiff(true);
    try {
      const endpoint = actionToEndpoint[action];
      if (!endpoint) {
        console.error(`Brak endpointu dla akcji: ${action}`);
        return;
      }

      // Pobierz token z localStorage
      const token = localStorage.getItem("authToken");

      const res = await axios.get(`${endpoint}${logId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Różnice:", res.data);
      
      setDiffData(res.data);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Błąd podczas pobierania różnic:", error.response?.data || error.message);
      } else {
        console.error("Błąd:", error);
      }
    } finally {
      setLoadingDiff(false);
    }
  };



  const exportToExcel = async () => {
    if (!changes.length) return;

    try {
      setExporting(true);
      const token = localStorage.getItem("authToken");
      const params = new URLSearchParams();

      if (activeFilter !== "all") {
        params.append("action", activeFilter);
      }

       const url =
        type === "user"
          ? `/api/history/export?type=user`
          : `/api/history/export?type=familyTree&familyTreeId=${id}`;
          

      const response = await axios.get(
        `http://localhost:3001${url}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          },
          params,
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      const date = new Date().toISOString().slice(0, 10);
      saveAs(blob, `historia_zmian_${date}.xlsx`);
    } catch (error) {
      console.error("Błąd podczas eksportu do Excel:", error);
      alert("Nie udało się wyeksportować historii. Spróbuj ponownie.");
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <HistoryPanel
        changes={changes}
        filteredChanges={filteredChanges}
        loading={loading}
        error={error}
        activeFilter={activeFilter}
        actionCounts={actionCounts}
        exporting={exporting}
        onClose={onClose}
        onRefresh={loadHistory}
        onExport={exportToExcel}
        onFilterChange={setActiveFilter}
        onUndoClick={setConfirmingUndo}
        side={side}
        isOpen={isOpen}
      />

      {confirmingUndo && (
        <UndoConfirmationModal
          logId={confirmingUndo}
          action={changes.find(c => c.id === confirmingUndo)?.action || ""}
          diffData={diffData}
          loadingDiff={loadingDiff}
          onCancel={() => {
            setConfirmingUndo(null);
            setDiffData(null);
          }}
          onConfirm={() => handleUndo(confirmingUndo)}
          onFetchDiff={fetchDiffData}
        />
      )}
    </>
  );
};

export default HistorySidebar;