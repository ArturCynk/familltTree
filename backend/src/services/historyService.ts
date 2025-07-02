// services/historyService.ts
import { IChangeLog, ChangeAction, EntityType } from '../models/ChangeLog';
import { IPerson } from '../models/Person';
import ChangeLog from '../models/ChangeLog';
import mongoose, { Types } from 'mongoose';
import { personService } from './personServices';
import User from '../models/User';
import { addRelation } from '../controllers/personController';

class HistoryService {
  // Generic change logger
  async logChange(
    userId: mongoose.Types.ObjectId,
    entityId: mongoose.Types.ObjectId,
    entityType: EntityType,
    action: ChangeAction,
    snapshot: any,
    options: {
      changes?: { field: string; oldValue: any; newValue: any }[];
      relatedEntities?: { entityType: EntityType; entityId: mongoose.Types.ObjectId }[];
    } = {}
  ) {
    const logEntry = new ChangeLog({
      userId,
      entityId,
      entityType,
      action,
      timestamp: new Date(),
      snapshot,
      changes: options.changes,
      relatedEntities: options.relatedEntities
    });
    
    await logEntry.save();
  }

  // Log person deletion
  async logPersonDeletion(
    userId: mongoose.Types.ObjectId,
    personId: mongoose.Types.ObjectId,
    deletedPersonData: IPerson
  ) {
    return this.logChange(
      userId,
      personId,
      EntityType.PERSON,
      ChangeAction.DELETE,
      this.toPlainObject(deletedPersonData)
    );
  }

  // Log person update
  async logPersonUpdate(
    userId: mongoose.Types.ObjectId,
    personId: mongoose.Types.ObjectId,
    updatedPerson: IPerson,
    changes: { field: string; oldValue: any; newValue: any }[]
  ) {
    return this.logChange(
      userId,
      personId,
      EntityType.PERSON,
      ChangeAction.UPDATE,
      this.toPlainObject(updatedPerson),
      { changes }
    );
  }

  // Log person creation
  async logPersonCreation(
    userId: mongoose.Types.ObjectId,
    personId: mongoose.Types.ObjectId,
    newPerson: IPerson
  ) {
    return this.logChange(
      userId,
      personId,
      EntityType.PERSON,
      ChangeAction.CREATE,
      this.toPlainObject(newPerson)
    );
  }

  // Log relation addition (for one person)
  async logRelationAddition(
    userId: mongoose.Types.ObjectId,
    personId: mongoose.Types.ObjectId,
    updatedPerson: IPerson,
    relationType: string,
    relatedPersonId: mongoose.Types.ObjectId
  ) {
    return this.logChange(
      userId,
      personId,
      EntityType.PERSON,
      ChangeAction.ADD_RELATION,
      this.toPlainObject(updatedPerson),
      {
        changes: [{
          field: relationType,
          oldValue: undefined,
          newValue: relatedPersonId
        }],
        relatedEntities: [{
          entityType: EntityType.PERSON,
          entityId: relatedPersonId
        }]
      }
    );
  }

  // Log relation removal (for one person)
  async logRelationRemoval(
    userId: mongoose.Types.ObjectId,
    personId: mongoose.Types.ObjectId,
    updatedPerson: IPerson,
    relationType: string,
    relatedPersonId: mongoose.Types.ObjectId
  ) {
    return this.logChange(
      userId,
      personId,
      EntityType.PERSON,
      ChangeAction.REMOVE_RELATION,
      this.toPlainObject(updatedPerson),
      {
        changes: [{
          field: relationType,
          oldValue: relatedPersonId,
          newValue: undefined
        }],
        relatedEntities: [{
          entityType: EntityType.PERSON,
          entityId: relatedPersonId
        }]
      }
    );
  }

// In HistoryService
async getLogById(logId: mongoose.Types.ObjectId): Promise<IChangeLog| null> {
  return ChangeLog.findById(logId); // Ensure this returns a proper document
}

  async undoCreate(log: IChangeLog) {
    const user = await User.findById(log.userId);
     const { deletedPersonId, updatedPersons } = await personService.deletePerson(
          log.snapshot._id,
          'user',
          user?.email
        );
  }



undoDelete = async (log: IChangeLog) => {
  // 1. Pobierz użytkownika
  const user = await User.findById(log.userId);
  if (!user) {
    throw new Error("Użytkownik nie znaleziony");
  }

  // 2. Odtwórz osobę z snapshot
  const snapshot = { ...log.snapshot };
  delete snapshot._id;

  // Dodaj osobę
  const restoredPerson = await personService.addPerson({
    email: user.email,
    body: snapshot,
  });

  // 3. Przywróć relacje
  const relationFields: Array<keyof typeof snapshot> = [
    "parents",
    "children",
    "siblings",
    "spouses",
  ];

  for (const field of relationFields) {
    const relatedItems = snapshot[field];

    if (Array.isArray(relatedItems)) {
      for (const related of relatedItems) {
        let relatedPersonId: string;

        // Obsługa spouse jako obiektu
        if (field === "spouses" && related.personId) {
          relatedPersonId = related.personId.toString();
        } else if (typeof related === "string" || related instanceof mongoose.Types.ObjectId) {
          relatedPersonId = related.toString();
        } else {
          console.warn(`Pomijam nieprawidłową relację: ${JSON.stringify(related)}`);
          continue;
        }

        let relationType: string;
        switch (field) {
          case "parents":
            relationType = "parents";
            break;
          case "children":
            relationType = "children";
            break;
          case "siblings":
            relationType = "siblings";
            break;
          case "spouses":
            relationType = "spouses";
            break;
          default:
            continue;
        }

        // Wywołanie personService.addRelation
        await personService.addRelation(
          restoredPerson._id.toString(),
          relatedPersonId,
          relationType,
          'user',
          user.email
        );
      }
    }
  }

  return {
    message: "Osoba została odtworzona",
    restoredPerson,
  };
};



async undoUpdate(log: IChangeLog) {
  const user = await User.findById(log.userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (!log.snapshot) {
    throw new Error("No snapshot data available to undo update");
  }

  const { _id, ...snapshotData } = log.snapshot;

  if (!log.changes || log.changes.length === 0) throw new Error("No change details available to selectively undo.");

   const updateData: Record<string, any> = {};
  let validChanges = 0;

  for (const change of log.changes) {
    // Skip undefined/null entries and validate required fields
    if (!change || typeof change !== 'object') {
      console.warn('Skipping invalid change entry:', change);
      continue;
    }

    if (!change.field || change.oldValue === undefined) {
      console.warn('Skipping incomplete change entry:', change);
      continue;
    }

    updateData[change.field] = change.oldValue;
    validChanges++;
  }

  if (validChanges === 0) {
    throw new Error("No valid changes found to undo");
  }

  await personService.updatePerson(
    log.entityId.toString(),
    updateData,
    'user',
    user.email
  );
}


  async undoRestore(log: IChangeLog) {

  }

async undoAddRelation(log: IChangeLog) {
  const user = await User.findById(log.userId);

  if (!log.relatedEntities?.[0]?.entityId) {
    throw new Error("relatedEntities[0].entityId is undefined");
  }

  const relatedEntityId = log.relatedEntities[0].entityId.toString();

  await personService.deleteRelation(
    log.entityId.toString(),
    relatedEntityId,
    "user",
    log.userId.toString() // przekazujesz userId jako email
  );
}


  async undoRemoveRelation(log: IChangeLog) {
    const user = await User.findById(log.userId);

    if (!log.relatedEntities?.[0]?.entityId)  
      throw new Error("relatedEntities[0].entityId is undefined");

    await personService.addRelation(
      log.entityId.toString(),
      log.relatedEntities?.[0]?.entityId.toString(),
      log.changes?.[0]?.field || 'spouses',
      'user',
      user?.email // przekazujesz userId jako email
    );
}


  // Helper to convert Mongoose docs to plain objects
  private toPlainObject(data: any): any {
    return data?.toObject ? data.toObject() : data;
  }


  async getChangeHistory(
    userId: mongoose.Types.ObjectId,
    filters?: { entityType?: EntityType; action?: ChangeAction }
  ) {
    const query: any = { userId: userId };
    if (filters?.entityType) query.entityType = filters.entityType;
    if (filters?.action) query.action = filters.action;

    return ChangeLog.find(query)
      .sort({ timestamp: -1 })
      .lean();
  }

  async restoreVersion(logId: mongoose.Types.ObjectId) {
    const logEntry = await ChangeLog.findById(logId);
    if (!logEntry) throw new Error('Log entry not found');

    switch (logEntry.entityType) {
      case EntityType.PERSON:
        return this.restorePerson(logEntry);
      default:
        throw new Error('Unsupported entity type');
    }
  }

  private async restorePerson(logEntry: IChangeLog) {
    const PersonModel = mongoose.model<IPerson>('Person');
    const existingPerson = await PersonModel.findById(logEntry.entityId);
    
    if (existingPerson) {
      existingPerson.set(logEntry.snapshot);
      await existingPerson.save();
    } else {
      const newPerson = new PersonModel(logEntry.snapshot);
      newPerson._id = logEntry.entityId;
      await newPerson.save();
    }

    await this.logChange(
      logEntry.userId,
      logEntry.entityId,
      EntityType.PERSON,
      ChangeAction.RESTORE,
      logEntry.snapshot
    );
  }

  async compareVersions(logId1: string, logId2: string) {
    const [version1, version2] = await Promise.all([
      ChangeLog.findById(logId1),
      ChangeLog.findById(logId2)
    ]);

    if (!version1 || !version2) throw new Error('Version not found');
    
    const diff: any = {};
    const fields = new Set([
      ...Object.keys(version1.snapshot),
      ...Object.keys(version2.snapshot)
    ]);
    
    fields.forEach(field => {
      if (JSON.stringify(version1.snapshot[field]) !== 
          JSON.stringify(version2.snapshot[field])) {
        diff[field] = {
          version1: version1.snapshot[field],
          version2: version2.snapshot[field]
        };
      }
    });
    
    return diff;
  }
}

export default new HistoryService();