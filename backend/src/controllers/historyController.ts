import { Request, Response } from 'express';
import HistoryService from '../services/historyService';
import mongoose from 'mongoose';
import { EntityType, ChangeAction, IChangeLog } from '../models/ChangeLog'; // Import enumów
import User, { UserDocument } from '../models/User';
import { formatTimestamp, makeDescription } from '../utils/helpers';
import ExcelJS from 'exceljs'; // Replace csv-writer with ExcelJS
import { personService } from '../services/personServices';
import FamilyTree from '../models/FamilyTree';

type PersonType = 'user' | 'familyTree';

class HistoryController {

    constructor() {
        this.getHistory = this.getHistory.bind(this);
        this.getUserOrTree = this.getUserOrTree.bind(this);
        this.exportHistoryToExcel = this.exportHistoryToExcel.bind(this); // Updated method name
    }

   async getHistory(req: Request, res: Response) {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { type, familyTreeId, entityType, action } = req.query as {
      type?: 'user' | 'familyTree';
      familyTreeId?: string;
      entityType?: EntityType;
      action?: ChangeAction;
    };

    // Domyślnie user, jeśli nie podano
    const resolvedType: PersonType = type === 'familyTree' ? 'familyTree' : 'user';

    const context = await this.getUserOrTree(resolvedType, req.user.email, familyTreeId);
    
    if (!context) {
      return res.status(404).json({ message: 'User or FamilyTree not found' });
    }

    if (entityType && !Object.values(EntityType).includes(entityType)) {
      return res.status(400).json({ message: 'Invalid entityType value' });
    }

    if (action && !Object.values(ChangeAction).includes(action)) {
      return res.status(400).json({ message: 'Invalid action value' });
    }

    const raw = await HistoryService.getChangeHistory(context._id as mongoose.Types.ObjectId, { entityType, action });

    const history = raw.map(log => {
      const { date, time } = formatTimestamp(log.timestamp);
      return {
        id: log._id,
        date,
        time,
        description: makeDescription(log),
        action: log.action,
      };
    });

    return res.json(history);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching history:', error);
    return res.status(500).json({ message: errorMessage });
  }
}


async exportHistoryToExcel(req: Request, res: Response) { // Renamed method
        try {
            if (!req.user?.email) {
                return res.status(401).json({ message: 'Authentication required' });
            }

           const { type, familyTreeId, entityType, action } = req.query as {
      type?: 'user' | 'familyTree';
      familyTreeId?: string;
      entityType?: EntityType;
      action?: ChangeAction;
    };

    // Domyślnie user, jeśli nie podano
    const resolvedType: PersonType = type === 'familyTree' ? 'familyTree' : 'user';

    const context = await this.getUserOrTree(resolvedType, req.user.email, familyTreeId);
    if (!context) {
      return res.status(404).json({ message: 'User or FamilyTree not found' });
    }



            if (entityType && !Object.values(EntityType).includes(entityType)) {
                return res.status(400).json({ message: 'Invalid entityType value' });
            }
            if (action && !Object.values(ChangeAction).includes(action)) {
                return res.status(400).json({ message: 'Invalid action value' });
            }

            const raw = await HistoryService.getChangeHistory(context._id as mongoose.Types.ObjectId, { entityType, action });

            // Create Excel workbook
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Change History');

            // Define columns with styles
            worksheet.columns = [
                { header: 'ID', key: 'id', width: 28 },
                { header: 'Date', key: 'date', width: 12 },
                { header: 'Time', key: 'time', width: 10 },
                { header: 'Description', key: 'description', width: 60 },
                { header: 'Action', key: 'action', width: 20 },
                { header: 'Entity Type', key: 'entityType', width: 15 },
                { header: 'Full Timestamp', key: 'timestamp', width: 24 }
            ];

            // Style header row
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4F81BD' } // Blue background
            };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

            // Add data rows
            raw.forEach(log => {
                const { date, time } = formatTimestamp(log.timestamp);
                worksheet.addRow({
                    id: log._id.toString(),
                    date,
                    time,
                    description: makeDescription(log),
                    action: log.action,
                    entityType: log.entityType,
                    timestamp: log.timestamp.toISOString()
                });
            });

            // Apply data formatting
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    row.getCell(5).alignment = { horizontal: 'center' }; // Center action column
                    row.getCell(7).numFmt = 'yyyy-mm-dd hh:mm:ss'; // Format timestamp
                }
            });

            // Set response headers
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=change_history.xlsx'
            );

            // Write Excel to response
            await workbook.xlsx.write(res);
            res.end();
            
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Error exporting history:', error);
            return res.status(500).json({ message: errorMessage });
        }
    }

    async undoChange(req: Request, res: Response) {
  try {
    const { logId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(logId)) {
      return res.status(400).json({ message: 'Invalid log ID' });
    }

    const log = await HistoryService.getLogById(new mongoose.Types.ObjectId(logId)) as IChangeLog | null;
    if (!log) {
      return res.status(404).json({ message: 'Log entry not found' });
    }

    // Główna logika cofania akcji:
    switch (log.action) {
      case 'create': {
        await HistoryService.undoCreate(log);
        break;
      }
      case 'delete': {
        await HistoryService.undoDelete(log);
        break;
      }
      case 'update': {
        await HistoryService.undoUpdate(log);
        break;
      }
      case 'restore': {
        await HistoryService.undoRestore(log);
        break;
      }
      case 'add_relation': {

        await HistoryService.undoAddRelation(log);
        break;
      }
      case 'remove_relation': {
        await HistoryService.undoRemoveRelation(log);
        break;
      }
      default:
        return res.status(400).json({ message: 'Unsupported action for undo' });
    }

    return res.json({ message: 'Change successfully undone' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error undoing change:', error);
    return res.status(500).json({ message: errorMessage });
  }
}

private async getUserOrTree(
  type: 'user' | 'familyTree',
  userEmail?: string,
  familyTreeId?: string
): Promise<UserDocument | any | null> {
  if (type === 'user') {
    if (!userEmail) return null;
    return await User.findOne({ email: userEmail }).populate('persons').exec();
  }

      if (!familyTreeId) return null;
    return await FamilyTree.findById(familyTreeId).populate('persons').exec();
}


async simulateUndoUpdate(req: Request, res: Response) {
  try {
    const { logId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(logId)) {
      return res.status(400).json({ message: 'Invalid log ID' });
    }

    const log = await HistoryService.getLogById(new mongoose.Types.ObjectId(logId));
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    if (!req.user?.email) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Pobierz użytkownika z osobami (lean() dla prostoty)
    const user = await User.findOne({ email: req.user.email }).populate('persons').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Aktualna osoba (stan w bazie)
    const currentPerson = user.persons.find(
      (p: any) => p._id.toString() === log.entityId.toString()
    );
    const current = currentPerson ? { ...currentPerson } : null;

    // Snapshot to obecna wersja po update (log.snapshot)
    const snapshot = log.snapshot ? { ...log.snapshot } : null;

    if (!snapshot) {
      return res.status(400).json({ message: 'Snapshot missing in log' });
    }

    // Tworzymy obiekt restored - wersję PRZED update
    // Zacznijmy od kopii snapshotu (czyli obecnego stanu)
    const restored = { ...snapshot };

    // Zamieniamy w restored pola z oldValue z log.changes
    if (Array.isArray(log.changes)) {
      log.changes.forEach(change => {
        if (change.field && 'oldValue' in change) {
          restored[change.field] = change.oldValue;
        }
      });
    }

// Lista kluczy do pominięcia
const omitFields = ['parents', 'siblings', 'spouses', 'children', '_id', '__v'];

// Pomocnicza funkcja do "oczyszczenia" obiektu
function cleanObject(obj: Record<string, any> | null): Record<string, any> | null {
  if (!obj) return null;
  const cleaned: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    if (!omitFields.includes(key)) {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
}

// Czyścimy oba obiekty
const cleanCurrent = cleanObject(current);
const cleanRestored = cleanObject(restored);

// Teraz porównujemy cleanCurrent i cleanRestored
const keys = new Set<string>();
if (cleanCurrent) Object.keys(cleanCurrent).forEach(k => keys.add(k));
if (cleanRestored) Object.keys(cleanRestored).forEach(k => keys.add(k));

const differences = Array.from(keys).map(key => ({
  field: key,
  currentValue: cleanCurrent ? cleanCurrent[key] : undefined,
  restoredValue: cleanRestored ? cleanRestored[key] : undefined,
  changed: (cleanCurrent ? cleanCurrent[key] : undefined) !== (cleanRestored ? cleanRestored[key] : undefined),
})).filter(diff => diff.changed);

// Zwracamy "oczyszczone" obiekty i różnice
return res.json({
  current: cleanCurrent,
  restored: cleanRestored,
  differences,
});


  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('previewUndoDiff error:', error);
    return res.status(500).json({ message });
  }
}

 simulateUndoCreate = async (req: Request, res: Response) => {
  const { logId } = req.params;
  const userEmail = req.user?.email;

  if (!logId) {
    return res.status(400).json({ message: "Brak logId." });
  }

  try {
    // Pobierz log akcji
    const log = await HistoryService.getLogById(new mongoose.Types.ObjectId(logId));

    if (!log) {
      return res.status(404).json({ message: "Log nie znaleziony." });
    }

    if (log.action !== "create") {
      return res.status(400).json({ message: "Ta akcja nie jest typu 'create'." });
    }

    // Pobierz wszystkie osoby przed cofnięciem
    const currentPersons = await personService.getAllPersonsWithRelations("user", userEmail);

    // Symuluj stan po cofnięciu create (usuń osobę stworzoną przez tę akcję)
     const personIdToRemove = log.entityId?.toString();

    // Usuń osobę z listy osób
    const filteredPersons = currentPersons.filter(
      (p:any) => p.id.toString() !== personIdToRemove
    );

    // Usuń tę osobę z relacji innych osób
    const cleanedPersons = filteredPersons.map((person) => {
      const cleanArray = (arr: any[]) =>
        arr.filter((rel) => rel.id?.toString() !== personIdToRemove);

      return {
        ...person,
        children: cleanArray(person.children || []),
        spouses: cleanArray(person.spouses || []),
        parents: cleanArray(person.parents || []),
        siblings: cleanArray(person.siblings || []),
      };
    });

    return res.json({
      current: currentPersons,
      simulated: cleanedPersons,
      removedPersonId: personIdToRemove,
    });
  } catch (error) {
    console.error("Błąd podczas symulacji cofnięcia create:", error);
    return res.status(500).json({ message: "Błąd serwera." });
  }
};

simulateUndoDelete = async (req: Request, res: Response) => {
  const { logId } = req.params;
  const userEmail = req.user?.email;

  if (!logId) {
    return res.status(400).json({ message: "Brak logId." });
  }

  try {
    const log = await HistoryService.getLogById(new mongoose.Types.ObjectId(logId));

    if (!log) {
      return res.status(404).json({ message: "Log nie znaleziony." });
    }

    if (log.action !== "delete") {
      return res.status(400).json({ message: "Ta akcja nie jest typu 'delete'." });
    }

    if (!log.snapshot) {
      return res.status(400).json({ message: "Brak snapshotu w logu." });
    }

    const snapshot = log.snapshot;
    const currentPersons = await personService.getAllPersonsWithRelations("user", userEmail);

    // Funkcja do konwersji ID na string
    const toIdString = (id: any): string => {
      if (id instanceof mongoose.Types.ObjectId) return id.toString();
      if (typeof id === 'string') return id;
      if (id && typeof id === 'object' && id.toString) return id.toString();
      return String(id);
    };

    // Funkcja do pobrania ID osoby
    const getPersonId = (person: any): string => {
      return toIdString(person.id || person._id);
    };

    // Przygotuj obiekt restoredPerson
    const restoredPersonId = toIdString(log.entityId || snapshot._id);
    const restoredPerson: any = {
      ...snapshot,
      id: restoredPersonId,
      _id: undefined,
    };

    // Helper do tworzenia obiektu relacji
    const createRelationObject = (person: any) => ({
      id: getPersonId(person),
      firstName: person.firstName,
      lastName: person.lastName,
      gender: person.gender,
      type: "blood"
    });

    // Helper do znajdowania osób po ID
    const findPerson = (id: string) => {
      const idStr = toIdString(id);
      return currentPersons.find(p => 
        toIdString(p.id) === idStr || 
        toIdString(p._id) === idStr
      );
    };

    // Aktualizuj relacje w restoredPerson
    const updateRelationsInRestoredPerson = () => {
      // Aktualizuj parents
      restoredPerson.parents = [];
      if (Array.isArray(snapshot.parents)) {
        snapshot.parents.forEach((parentId: any) => {
          const parent = findPerson(parentId);
          if (parent) {
            restoredPerson.parents.push(createRelationObject(parent));
          }
        });
      }

      // Aktualizuj children
      restoredPerson.children = [];
      if (Array.isArray(snapshot.children)) {
        snapshot.children.forEach((childId: any) => {
          const child = findPerson(childId);
          if (child) {
            restoredPerson.children.push(createRelationObject(child));
          }
        });
      }

      // Aktualizuj siblings
      restoredPerson.siblings = [];
      if (Array.isArray(snapshot.siblings)) {
        snapshot.siblings.forEach((siblingId: any) => {
          const sibling = findPerson(siblingId);
          if (sibling) {
            restoredPerson.siblings.push(createRelationObject(sibling));
          }
        });
      }

      // Aktualizuj spouses
      restoredPerson.spouses = [];
      if (Array.isArray(snapshot.spouses)) {
        snapshot.spouses.forEach((spouse: any) => {
          const spousePerson = findPerson(spouse.personId);
          if (spousePerson) {
            restoredPerson.spouses.push({
              ...createRelationObject(spousePerson),
              weddingDate: spouse.weddingDate
            });
          }
        });
      }
    };

    updateRelationsInRestoredPerson();

    // Przygotuj obiekt relacji dla przywracanej osoby
    const restoredRelation = createRelationObject(restoredPerson);

    // Aktualizuj relacje w istniejących osobach
    const updatedPersons = currentPersons.map(person => {
      const updatedPerson = { ...person };
      const personId = getPersonId(person);

      // Dodaj przywracaną osobę jako dziecko do rodziców
      if (restoredPerson.parents.some((p: any) => getPersonId(p) === personId)) {
        updatedPerson.children = [
          ...(updatedPerson.children || []),
          restoredRelation
        ];
      }

      // Dodaj przywracaną osobę jako rodzica do dzieci
      if (restoredPerson.children.some((c: any) => getPersonId(c) === personId)) {
        updatedPerson.parents = [
          ...(updatedPerson.parents || []),
          restoredRelation
        ];
      }

      // Dodaj przywracaną osobę jako rodzeństwo
      if (restoredPerson.siblings.some((s: any) => getPersonId(s) === personId)) {
        updatedPerson.siblings = [
          ...(updatedPerson.siblings || []),
          restoredRelation
        ];
      }

      // Dodaj przywracaną osobę jako małżonka
      const spouseMatch = restoredPerson.spouses.find((s: any) => getPersonId(s) === personId);
      if (spouseMatch) {
        updatedPerson.spouses = [
          ...(updatedPerson.spouses || []),
          {
            ...restoredRelation,
            weddingDate: spouseMatch.weddingDate
          }
        ];
      }

      return updatedPerson;
    });

    return res.json({
      current: currentPersons,
      simulated: [...updatedPersons, restoredPerson],
      restoredPerson,
    });
  } catch (error) {
    console.error("Błąd podczas symulacji cofnięcia delete:", error);
    return res.status(500).json({ message: "Błąd serwera." });
  }
};

simulateUndoAddRelation = async (req: Request, res: Response) => {
  const { logId } = req.params;
  const userEmail = req.user?.email;

  if (!logId) {
    return res.status(400).json({ message: "Brak logId." });
  }

  try {
    const log = await HistoryService.getLogById(new mongoose.Types.ObjectId(logId));

    if (!log) {
      return res.status(404).json({ message: "Log nie znaleziony." });
    }

    if (log.action !== "add_relation") {
      return res.status(400).json({ message: "Nieprawidłowy typ akcji." });
    }

    // Funkcja do konwersji ID
    const toIdString = (id: any): string => {
      if (id instanceof mongoose.Types.ObjectId) return id.toString();
      if (typeof id === 'string') return id;
      if (id && typeof id === 'object' && id.toString) return id.toString();
      return String(id);
    };

    // Pobierz kluczowe ID
    const personId = toIdString(log.entityId);
    if( !log.relatedEntities || log.relatedEntities.length === 0) throw new Error("Brak powiązanych encji w logu.");
    const relatedPersonId = toIdString(log.relatedEntities[0]?.entityId);
    
    if (!personId || !relatedPersonId) {
      return res.status(400).json({ message: "Brak wymaganych ID w logu." });
    }

    // Pobierz aktualne osoby
    const currentPersons = await personService.getAllPersonsWithRelations("user", userEmail);

    // Znajdź obie osoby w aktualnych danych
    const findPerson = (id: string) => {
      return currentPersons.find(p => 
        toIdString(p._id) === id || 
        toIdString(p.id) === id
      );
    };

    const person = findPerson(personId);
    const relatedPerson = findPerson(relatedPersonId);

    if (!person || !relatedPerson) {
      return res.status(404).json({ message: "Jedna z osób nie została znaleziona." });
    }

    // Stwórz kopie osób do modyfikacji
    const updatedPerson = { ...person };
    const updatedRelatedPerson = { ...relatedPerson };

    // Funkcja pomocnicza do usuwania relacji
    const removeRelation = (array: any[], targetId: string) => {
      return (array || []).filter((item: any) => {
        const itemId = toIdString(item.id) || toIdString(item._id) || toIdString(item.personId);
        return itemId !== targetId;
      });
    };

    switch (log.snapshot.relationType) {
  case "spouse":
    // Usuń relację małżeńską
    updatedPerson.spouses = removeRelation(updatedPerson.spouses, relatedPersonId);
    updatedRelatedPerson.spouses = removeRelation(updatedRelatedPerson.spouses, personId);
    break;

  case "child":
    // Usuń relację dziecko-rodzic
    updatedPerson.children = removeRelation(updatedPerson.children, relatedPersonId);
    updatedRelatedPerson.parents = removeRelation(updatedRelatedPerson.parents, personId);
    break;

  case "parent":
    // Usuń relację rodzic-dziecko
    updatedPerson.parents = removeRelation(updatedPerson.parents, relatedPersonId);
    updatedRelatedPerson.children = removeRelation(updatedRelatedPerson.children, personId);
    break;

  case "sibling":
    // Usuń relację rodzeństwa
    updatedPerson.siblings = removeRelation(updatedPerson.siblings, relatedPersonId);
    updatedRelatedPerson.siblings = removeRelation(updatedRelatedPerson.siblings, personId);
    break;

  default:
    return res.status(400).json({ message: "Nieobsługiwany typ relacji." });
}


    // Przygotuj zaktualizowaną listę osób
    const updatedPersons = currentPersons.map(p => {
      const pid = toIdString(p.id) || toIdString(p._id);
      
      if (pid === personId) return updatedPerson;
      if (pid === relatedPersonId) return updatedRelatedPerson;
      return p;
    });

    return res.json({
      current: currentPersons,
      simulated: updatedPersons,
      removedRelation: {
        type: log.snapshot.relationType,
        personId,
        relatedPersonId
      }
    });
  } catch (error) {
    console.error("Błąd podczas symulacji cofnięcia dodania relacji:", error);
    return res.status(500).json({ message: "Błąd serwera." });
  }
};

simulateUndoRemoveRelation = async (req: Request, res: Response) => {
  const { logId } = req.params;
  const userEmail = req.user?.email;

  if (!logId) {
    return res.status(400).json({ message: "Brak logId." });
  }

  try {
    const log = await HistoryService.getLogById(new mongoose.Types.ObjectId(logId));

    if (!log) {
      return res.status(404).json({ message: "Log nie znaleziony." });
    }

    if (log.action !== "remove_relation") {
      return res.status(400).json({ message: "Nieprawidłowy typ akcji." });
    }
if (!log.changes || log.changes.length === 0 || !log.changes[0].field) {
  throw new Error("Brak typu relacji w logu.");
}
const relationType = log.changes[0].field;

if (!relationType) {
  return res.status(400).json({ message: "Brak typu relacji w logu." });
}
    if (!relationType) {
      return res.status(400).json({ message: "Brak typu relacji w logu." });
    }

    // Funkcja do konwersji ID na string
    const toIdString = (id: any): string => {
      if (id instanceof mongoose.Types.ObjectId) return id.toString();
      if (typeof id === 'string') return id;
      if (id && typeof id === 'object' && id.toString) return id.toString();
      return String(id);
    };

    if (!log.relatedEntities || log.relatedEntities.length === 0) {
      throw new Error("Brak powiązanych encji w logu.");
    }

    const entityId = toIdString(log.entityId);
    const relatedEntityId = toIdString(log.relatedEntities[0].entityId);

    if (!entityId || !relatedEntityId) {
      return res.status(400).json({ message: "Brak wymaganych ID w logu." });
    }

    // Pobierz aktualne osoby użytkownika
    const currentPersons = await personService.getAllPersonsWithRelations("user", userEmail);

    // Znajdź osoby po ID
    const findPerson = (id: string) => {
      return currentPersons.find(p => 
        toIdString(p._id) === id || toIdString(p.id) === id
      );
    };

    const personA = findPerson(entityId);
    const personB = findPerson(relatedEntityId);

    if (!personA || !personB) {
      return res.status(404).json({ message: "Jedna z osób nie została znaleziona." });
    }

    // Stwórz kopie osób do modyfikacji
    const updatedA = { ...personA };
    const updatedB = { ...personB };

    // Helper tworzący obiekt relacji
    const createRelationObj = (person: any) => ({
      id: toIdString(person.id || person._id),
      firstName: person.firstName,
      lastName: person.lastName,
      gender: person.gender,
      type: "blood", // zakładam, że domyślnie "blood", można rozbudować
    });

    // Funkcja pomocnicza do dodawania relacji do tablicy (jeśli brak)
    const addRelation = (relations: any[] | undefined, personToAdd: any) => {
      if (!relations) return [createRelationObj(personToAdd)];
      const exists = relations.some(r => toIdString(r.id || r._id) === toIdString(personToAdd.id || personToAdd._id));
      if (!exists) return [...relations, createRelationObj(personToAdd)];
      return relations;
    };

    // Logika cofnięcia różnych typów relacji:
    switch (relationType) {
      case "spouses": // małżeństwo
        updatedA.spouses = addRelation(updatedA.spouses, updatedB);
        updatedB.spouses = addRelation(updatedB.spouses, updatedA);
        break;

      case "children": // personA to dziecko, personB to rodzic
        updatedA.parents = addRelation(updatedA.parents, updatedB);
        updatedB.children = addRelation(updatedB.children, updatedA);
        break;

      case "parent": // personA to rodzic, personB to dziecko
        updatedA.children = addRelation(updatedA.children, updatedB);
        updatedB.parents = addRelation(updatedB.parents, updatedA);
        break;

      case "sibling": // rodzeństwo, obustronna relacja siblings
        updatedA.siblings = addRelation(updatedA.siblings, updatedB);
        updatedB.siblings = addRelation(updatedB.siblings, updatedA);
        break;

      default:
        return res.status(400).json({ message: `Nieobsługiwany typ relacji: ${relationType}` });
    }

    // Przygotuj zaktualizowaną listę osób
    const updatedPersons = currentPersons.map(p => {
      const pid = toIdString(p._id) || toIdString(p.id);
      if (pid === entityId) return updatedA;
      if (pid === relatedEntityId) return updatedB;
      return p;
    });

    return res.json({
      current: currentPersons,
      simulated: updatedPersons,
      restoredRelation: {
        type: relationType,
        entityAId: entityId,
        entityBId: relatedEntityId,
      }
    });
  } catch (error) {
    console.error("Błąd podczas symulacji cofnięcia usunięcia relacji:", error);
    return res.status(500).json({ message: "Błąd serwera." });
  }
};






//   async restoreVersion(req: Request, res: Response) {
//     try {
//       const { logId } = req.params;
      
//       await HistoryService.restoreVersion(
//         new mongoose.Types.ObjectId(logId),
//         new mongoose.Types.ObjectId(req.user.id)
//       );
      
//       res.json({ message: 'Version restored successfully' });
//     } catch (error: any) {
//       res.status(500).json({ message: error.message });
//     }
//   }
}

export default new HistoryController();