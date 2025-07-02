import React from "react";
import Fill from "./fill";

interface UndoPreviewResponse {
  current: any[];
  simulated: any[];
  removedPersonId?: string;
  restoredPerson?: any;
}

interface OtherActionPreviewProps {
  action: string;
  diffData: UndoPreviewResponse | null;
}

const OtherActionPreview: React.FC<OtherActionPreviewProps> = ({
  action,
  diffData,
}) => {
  if (!diffData) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-gray-500">Brak danych do wyświetlenia.</p>
      </div>
    );
  }

  let leftRootId = "";
  let rightRootId = "";

  if (action === "create") {
    // Lewa strona: osoba, która zostałaby usunięta
    leftRootId = diffData.removedPersonId || "";

    // Prawa strona: próbujemy znaleźć jej rodzica/brata/małżonka/dziecko
    let relatedId: string | undefined;

    if (diffData.removedPersonId) {
      for (const node of diffData.current) {
        const relations = [
          ...(node.parents || []),
          ...(node.siblings || []),
          ...(node.spouses || []),
          ...(node.children || []),
        ];
        if (relations.includes(diffData.removedPersonId)) {
          relatedId = node.id;
          break;
        }
      }
    }

    rightRootId = relatedId || "";
  } else {
    // Standardowy przypadek
    leftRootId = diffData.current[0]?.id || diffData.removedPersonId || "";
    rightRootId = diffData.simulated[0]?.id || "";
  }

  console.log("diffData", diffData);
  console.log("leftRootId", leftRootId, "rightRootId", rightRootId);

  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
      <h4 className="font-medium text-gray-700">
        Podgląd danych dla akcji: <span className="text-gray-900">{action}</span>
      </h4>

      {diffData.removedPersonId && (
        <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded">
          Osoba o ID <code>{diffData.removedPersonId}</code> zostałaby usunięta przy cofnięciu.
        </div>
      )}

      <div className="flex w-full h-[80vh] bg-gray-100 dark:bg-gray-900 rounded overflow-hidden">
        {/* Lewe drzewo */}
        <div className="flex-1 overflow-hidden">
          <Fill nodes={diffData.current} rootId={leftRootId} />
        </div>

        {/* Separator */}
        <div className="w-px bg-gray-300 dark:bg-gray-700" />

        {/* Prawe drzewo */}
        <div className="flex-1 overflow-hidden">
          <Fill nodes={diffData.simulated} rootId={rightRootId} />
        </div>
      </div>
    </div>
  );
};

export default OtherActionPreview;
