import mongoose, { Types } from 'mongoose';
import User from '../models/User';
import Person from '../models/Person';
import { IPerson } from '../models/Person';
import FamilyTree from '../models/FamilyTree';
import HistoryService from './historyService';
import { EntityType, ChangeAction } from '../models/ChangeLog';

interface AddPersonInput {
  email: string | undefined;
  file?: Express.Multer.File;
  body: {
    gender: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    maidenName?: string;
    birthDateType?: string;
    birthDate?: Date;
    birthDateFrom?: Date;
    birthDateTo?: Date;
    birthPlace?: string;
    deathDateType?: string;
    deathDate?: Date;
    deathDateFrom?: Date;
    deathDateTo?: Date;
    deathPlace?: string;
    burialPlace?: string;
    photoUrl?: string;
    status?: string;
  };
}

interface IEvent {
  type: 'Narodziny' | 'Śmierć' | 'Ślub';
  who: string; // Imię i nazwisko osoby
  date?: Date; // Data wydarzenia
  description: string; // Opis wydarzenia
}

type PersonType = 'user' | 'familyTree';

export class PersonService {
public async deletePerson(
    personId: string,
    type: PersonType,
    userEmail?: string,
    treeId?: string
  ): Promise<{ deletedPersonId: string; updatedPersons: object }> {
    const user = await this.getUserOrTree(type, userEmail, treeId);
    if (!user) throw new Error('Użytkownik nie znaleziony');
    
    if (!Array.isArray(user.persons)) {
      throw new Error('Invalid persons data');
    }

    // Create lookup map first for O(1) access
    const personMap = new Map<string, IPerson>();
    user.persons.forEach(p => {
      if (p?._id) personMap.set(p._id.toString(), p);
    });

    // Jeśli Map nie znajdzie, szukaj po tablicy
let deletingPerson = personMap.get(personId.toString());
if (!deletingPerson) {
  deletingPerson = user.persons.find(
    p => p?._id?.toString() === personId.toString()
  );
}
if (!deletingPerson) throw new Error('Osoba nie znaleziona');


    // Validate user ID
    if (!(user._id instanceof mongoose.Types.ObjectId)) {
      throw new Error('Invalid user ID type');
    }
    const userId = user._id;

    // Log deletion BEFORE modifying relationships
    await HistoryService.logPersonDeletion(
      userId,
      deletingPerson._id as mongoose.Types.ObjectId,
      deletingPerson
    );

    const deletingIdStr = deletingPerson._id.toString();
    const updatedPersonIds = new Set<string>();

    // Track changes for each person
    const changesMap = new Map<string, Map<string, { oldValue: any; newValue: any }>>();

    // Helper to record changes
    const recordChange = (personId: string, field: string, oldValue: any, newValue: any) => {
      if (!changesMap.has(personId)) {
        changesMap.set(personId, new Map());
      }
      const personChanges = changesMap.get(personId)!;
      personChanges.set(field, { oldValue, newValue });
    };

    // Single pass through all persons (SKIP DELETING PERSON)
    for (const person of user.persons) {
      if (!person?._id) continue;
      
      const currentPersonId = person._id.toString();
      
      // Skip the person being deleted
      if (currentPersonId === deletingIdStr) continue;

      let wasModified = false;
      
      // Process standard relations (parents, siblings, children)
      const relations: Array<'parents' | 'siblings' | 'children'> = ['parents', 'siblings', 'children'];
      for (const relType of relations) {
        const relationArray = person[relType] as Types.ObjectId[];
        if (relationArray?.length) {
          const origLength = relationArray.length;
          const originalValues = [...relationArray];
          
          person[relType] = relationArray.filter(
            id => id.toString() !== deletingIdStr
          ) as any;
          
          const newLength = (person[relType] as Types.ObjectId[]).length;
          wasModified ||= newLength !== origLength;
          
          if (newLength !== origLength) {
            recordChange(
              currentPersonId,
              relType,
              originalValues,
              person[relType]
            );
          }
        }
      }

      // Process spouses
      if (person.spouses?.length > 0) {
        const origLength = person.spouses.length;
        const originalSpouses = [...person.spouses];
        
        person.spouses = person.spouses.filter(
          spouse => spouse.personId?.toString() !== deletingIdStr
        );
        
        const newLength = person.spouses.length;
        wasModified ||= newLength !== origLength;
        
        if (newLength !== origLength) {
          recordChange(
            currentPersonId,
            'spouses',
            originalSpouses,
            person.spouses
          );
        }
      }

      if (wasModified) {
        updatedPersonIds.add(currentPersonId);
        personMap.set(currentPersonId, person);
      }
    }

    // Remove deleted person
    user.persons = user.persons.filter(p => 
      p?._id?.toString() !== deletingIdStr
    );
    personMap.delete(deletingIdStr);

    await user.save();

    // Log updates for all modified persons
    for (const personId of updatedPersonIds) {
      const person = personMap.get(personId);
      if (person) {
        const changes = changesMap.get(personId);
        const changesArray = changes ? 
          Array.from(changes.entries()).map(([field, {oldValue, newValue}]) => ({
            field,
            oldValue,
            newValue
          }))
          : [];
        
      }
    }

    return {
      deletedPersonId: deletingIdStr,
      updatedPersons: Array.from(updatedPersonIds, id => 
        this.buildPersonResponse(personMap.get(id)!, personMap)
      ),
    };
  }

  private buildPersonResponse(
    person: IPerson, 
    personMap: Map<string, IPerson>
  ) {
    return {
      ...this.getPersonBasicInfo(person),
      ...this.getPersonRelations(person, personMap),
    };
  }


   public async addRelation(
    personId: string,
    relatedPersonId: string,
    relationType: string,
    type: PersonType,
    userEmail?: string,
    treeId?: string
  ) {
    console.log(type,userEmail);
    
    const user = await this.getUserOrTree(type, userEmail, treeId);
    if (!user) throw new Error('Użytkownik nie znaleziony');

    const validRelationTypes = ['parents', 'siblings', 'spouses', 'children'];
    if (!validRelationTypes.includes(relationType)) {
      throw new Error("Nieprawidłowy typ relacji");
    }

    const person = user.persons.find(p => p._id.toString() === personId);
    const relatedPerson = user.persons.find(p => p._id.toString() === relatedPersonId);

    if (!person || !relatedPerson) {
      throw new Error("Osoba nie znaleziona");
    }

    let wasModified = false;
    const currentDate = new Date();

    switch (relationType) {
      case "parents":
        if (!person.parents.includes(relatedPerson._id)) {
          person.parents.push(relatedPerson._id);
          wasModified = true;
        }
        if (!relatedPerson.children.includes(person._id)) {
          relatedPerson.children.push(person._id);
          wasModified = true;
        }
        break;

      case "children":
        if (!person.children.includes(relatedPerson._id)) {
          person.children.push(relatedPerson._id);
          wasModified = true;
        }
        if (!relatedPerson.parents.includes(person._id)) {
          relatedPerson.parents.push(person._id);
          wasModified = true;
        }
        break;

      case "siblings":
        if (!person.siblings.includes(relatedPerson._id)) {
          person.siblings.push(relatedPerson._id);
          wasModified = true;
        }
        if (!relatedPerson.siblings.includes(person._id)) {
          relatedPerson.siblings.push(person._id);
          wasModified = true;
        }
        break;

      case "spouses":
        if (!person.spouses.some((s) => s.personId.equals(relatedPerson._id))) {
          person.spouses.push({ personId: relatedPerson._id, weddingDate: currentDate });
          wasModified = true;
        }
        if (!relatedPerson.spouses.some((s) => s.personId.equals(person._id))) {
          relatedPerson.spouses.push({ personId: person._id, weddingDate: currentDate });
          wasModified = true;
        }
        break;

      default:
        throw new Error("Nieprawidłowy typ relacji");
    }

    if (wasModified) {
      await person.save();
      await relatedPerson.save();
    }

    await user.save();

    return {
      message: "Relacja została dodana",
      person,
      relatedPerson
    };
  }


  public async addPerson(input: AddPersonInput) {
    const { gender, firstName, middleName, lastName, maidenName, birthDateType, birthDate, 
            birthPlace, deathDateType, deathDate, deathPlace, burialPlace, status, photoUrl } = input.body;

    const photoPath = this.resolvePhotoPath(input.file, input.body.photoUrl);

    const newPerson = new Person({
      gender,
      firstName,
      middleName,
      lastName,
      maidenName,
      birthDateType,
      birthDate,
      birthPlace,
      deathDateType,
      deathDate,
      deathPlace,
      burialPlace,
      status,
      photo: photoPath,
      parents: [],
      siblings: [],
      spouses: [],
      children: [],
    });

    // Save the new person
    await newPerson.save();

    // Find user and update
    const user = await User.findOne({ email: input.email });
    if (!user) {
      throw new Error('Nie znaleziono użytkownika');
    }

    // Validate user ID
    if (!(user._id instanceof mongoose.Types.ObjectId)) {
      throw new Error('Invalid user ID type');
    }

    // Log person creation BEFORE adding to user
    await HistoryService.logPersonCreation(
      user._id,
      newPerson._id,
      newPerson
    );

    // Add person to user's persons array
    user.persons = [...user.persons, newPerson];
    await user.save();

    return newPerson;
}

 public async updatePerson(
    personId: string,
    updateData: any,
    type: PersonType,
    userEmail?: string,
    treeId?: string,
    file?: Express.Multer.File,
  ): Promise<object> {
    const user = await this.getUserOrTree(type, userEmail, treeId);
    if (!user) throw new Error('Użytkownik nie znaleziony');

    const personIndex = user.persons.findIndex(p => p._id.toString() === personId);
    if (personIndex === -1) throw new Error('Osoba nie znaleziona');

    // Capture the original state BEFORE modification
    const originalPerson = user.persons[personIndex];
    const originalPersonData = originalPerson.toObject();

    // Handle photo update
    if (file) {
      updateData.photo = file.path;
    } else if (!updateData.photo) {
      updateData.photo = originalPerson.photo;
    }

    this.cleanDateFields(updateData);

    // Create updated person object
    const updatedPerson = {
      ...originalPerson.toObject(),
      ...updateData,
    };

    // Apply update
    user.persons[personIndex] = updatedPerson as IPerson;
    await user.save();

    // Get the newly updated document
    const savedPerson = user.persons[personIndex];
    const savedPersonData = savedPerson.toObject();

    // Calculate changed fields
    const changes: { field: string; oldValue: any; newValue: any }[] = [];
    const fields = Object.keys(updateData);

    // Include photo if it was modified
    if (file || (!file && updateData.photo !== undefined)) {
      fields.push('photo');
    }

    // Remove duplicates
    const uniqueFields = [...new Set(fields)];

    uniqueFields.forEach(field => {
      const oldValue = originalPersonData[field];
      const newValue = savedPersonData[field];
      
      // Compare values safely
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ field, oldValue, newValue });
      }
    });

    console.log(changes);
    

    // Log the changes to history
    try {
      // Validate user ID
      if (!(user._id instanceof mongoose.Types.ObjectId)) {
        throw new Error('Invalid user ID type');
      }

      // Use the specific update logging method
      await HistoryService.logPersonUpdate(
        user._id,
        savedPerson._id as mongoose.Types.ObjectId,
        savedPerson,
        changes
      );
    } catch (logError) {
      console.error('Failed to log update:', logError);
      // Consider adding proper error handling/reporting here
    }

    // Prepare response
    const personMap = new Map(user.persons.map(p => [p._id.toString(), p]));

    return {
      ...this.getPersonBasicInfo(savedPerson),
      ...this.getPersonRelations(savedPerson, personMap),
    };
  }

public async getAllPersonsWithRelations(
  type: PersonType,
  userEmail?: string,
  treeId?: string
): Promise<any[]> {
 const user = await this.getUserOrTree(type, userEmail, treeId);

  if (!user) throw new Error('Użytkownik nie znaleziony');

  const allPersons = user.persons as IPerson[];
  const personMap = new Map<string, IPerson>(
    allPersons.map(p => [p._id.toString(), p])
  );

  


// const result = await this.findMaxGenerations(userEmail);
// console.log(`Najdłuższa linia z powtarzającym się nazwiskiem (${result.longestNameLine.count}x "${result.longestNameLine.lastName}"):`);

// result.longestNameLine.line.forEach(person => {
//     console.log(`Pokolenie ${person.generation}: ${person.firstName} ${person.lastName}`);
// });

return allPersons.map(person => this.buildPersonWithRelations(person, personMap));
}


  public async getPerson(personId: string,type: PersonType,
    userEmail?: string,
    treeId?: string): Promise<IPerson | null> {
  const user = await this.getUserOrTree(type, userEmail, treeId);


    if (!user) {
      throw new Error('Użytkownik nie znaleziony');
    }

    // Find the person in the user's persons list
    const person = user.persons.find(p => p._id.toString() === personId);
    
    if (!person) {
      throw new Error('Osoba nie znaleziona');
    }       

    return person;
  }             


  
    
public async getAllPersons(
  query: any,
  type: PersonType,
  userEmail?: string,
  treeId?: string
): Promise<{
  users: any[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
}> {
  const searchQuery = query.searchQuery as string | undefined;
  const letter = query.letter as string | undefined;
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.max(1, parseInt(query.limit as string) || 25);

  const { mongoQuery, additionalFilter } = this.buildSearchConditions(searchQuery, letter);

  const user = await this.getUserOrTree(type, userEmail, treeId);

  if (!user || !user.persons) {
    throw new Error('Użytkownik nie znaleziony lub brak osób');
  }

  const filteredPersons = user.persons.filter(additionalFilter);
  const totalUsers = filteredPersons.length;
  const totalPages = Math.ceil(totalUsers / limit);

  const paginatedPersons = filteredPersons.slice((page - 1) * limit, page * limit);
  const personMap = new Map(user.persons.map(p => [p._id.toString(), p]));

  const users = paginatedPersons.map(person => ({
    ...this.getPersonBasicInfo(person),
    ...this.getPersonRelations(person, personMap),
  }));

    return {
      users,
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
    };
  }

  public async getRelationsForPerson(personId: string,type: PersonType,
    userEmail?: string,
    treeId?: string) {
    const user = await this.getUserOrTree(type, userEmail, treeId);


    if (!user) {
      throw new Error('Użytkownik nie znaleziony');
    }

    const person = user.persons.find(p => p._id.toString() === personId);

    if (!person) {
      throw new Error('Osoba nie znaleziona');
    }

    // Funkcje pomocnicze
    const getPersonsByIds = (ids: mongoose.Types.ObjectId[]) =>
      user.persons.filter(p => ids.some(id => id.toString() === p._id.toString()));

    const getPersonsByIdsSpouses = (ids: mongoose.Types.ObjectId[]) =>
      user.persons.filter(p =>
        ids.some(id => id.toString() === p._id.toString())
      );

    const relations = {
      Rodzice: getPersonsByIds(person.parents),
      Rodzeństwo: getPersonsByIds(person.siblings),
      Małżonkowie: getPersonsByIdsSpouses(person.spouses.map(spouse => spouse.personId)),
      Dzieci: getPersonsByIds(person.children),
    };

    return {
      Rodzice: relations.Rodzice.map((parent: IPerson) => ({
        id: parent._id,
        firstName: parent.firstName,
        lastName: parent.lastName,
        gender: parent.gender,
      })),
      Rodzeństwo: relations.Rodzeństwo.map((sibling: IPerson) => ({
        id: sibling._id,
        firstName: sibling.firstName,
        lastName: sibling.lastName,
        gender: sibling.gender,
      })),
      Małżonkowie: relations.Małżonkowie.map((spouse: IPerson) => ({
        id: spouse._id,
        firstName: spouse.firstName,
        lastName: spouse.lastName,
        gender: spouse.gender,
      })),
      Dzieci: relations.Dzieci.map((child: IPerson) => ({
        id: child._id,
        firstName: child.firstName,
        lastName: child.lastName,
        gender: child.gender,
      })),
    };
  }

public async deleteRelation(
  personId: string,
  relationId: string,
  type: PersonType,
  userEmail?: string,
  treeId?: string
): Promise<void> {
  const user = await this.getUserOrTree(type, userEmail, treeId);
  if (!user) throw new Error('Użytkownik nie znaleziony');

  // Validate user ID type
  if (!(user._id instanceof mongoose.Types.ObjectId)) {
    throw new Error('Invalid user ID type');
  }

  // Find both persons
  const person = user.persons.find(p => p._id.toString() === personId);
  if (!person) throw new Error('Osoba nie znaleziona');

  const relatedPerson = user.persons.find(p => p._id.toString() === relationId);
  
  // Capture snapshots BEFORE modification
  const personBefore = person.toObject();
  const relatedPersonBefore = relatedPerson?.toObject();

  // Track which relation types were modified
  let removedFromType: keyof IPerson | null = null;
  let removedFromRelatedType: keyof IPerson | null = null;

  // Relation types to process
  const relationTypes: (keyof IPerson)[] = ['parents', 'siblings', 'spouses', 'children'];

  // Remove relation from the main person
  for (const type of relationTypes) {
    const relations = person[type] as any[];
    if (!relations?.length) continue;

    const index = this.findRelationIndex(relations, type, relationId);
    if (index > -1) {
      relations.splice(index, 1);
      removedFromType = type;
      break;
    }
  }

  // Remove relation from the related person
  if (relatedPerson) {
    for (const type of relationTypes) {
      const relations = relatedPerson[type] as any[];
      if (!relations?.length) continue;

      const index = this.findRelationIndex(relations, type, personId);
      if (index > -1) {
        relations.splice(index, 1);
        removedFromRelatedType = type;
        break;
      }
    }
  }

  // Save changes to the user document
  await user.save();

  // Log the relation removal as a single entry
  try {
    if (removedFromType || removedFromRelatedType) {
      const changes = [];
      
      if (removedFromType) {
        changes.push({
          field: removedFromType,
          oldValue: personBefore[removedFromType],
          newValue: person[removedFromType]
        });
      }
      
      if (removedFromRelatedType && relatedPerson) {
        changes.push({
          field: removedFromRelatedType,
          oldValue: relatedPersonBefore?.[removedFromRelatedType],
          newValue: relatedPerson[removedFromRelatedType]
        });
      }

      // Prepare options object
      const options = {
        changes,
        relatedEntities: relatedPerson ? [{
          entityType: EntityType.PERSON,
          entityId: relatedPerson._id
        }] : undefined
      };

      // Create a combined log entry
      await HistoryService.logChange(
        user._id,
        person._id as mongoose.Types.ObjectId,
        EntityType.PERSON,
        ChangeAction.REMOVE_RELATION,
        {
          person: person.toObject(),
          relatedPerson: relatedPerson?.toObject()
        },
        options
      );
    }
  } catch (logError) {
    console.error('Failed to log relation deletion:', logError);
  }
}

// Helper function to find relation index
private findRelationIndex(
  relations: any[],
  relationType: keyof IPerson,
  targetId: string
): number {
  if (relationType === 'spouses') {
    return relations.findIndex(rel => {
      if (typeof rel === 'object' && rel !== null && 'personId' in rel) {
        return rel.personId.toString() === targetId;
      }
      return rel.toString() === targetId;
    });
  }
  return relations.findIndex(rel => rel.toString() === targetId);
}

  public async getPersonsWithoutRelation(personId: string,type: PersonType,
    userEmail?: string,
    treeId?: string): Promise<IPerson[]> {
   const loggedInUser = await this.getUserOrTree(type, userEmail, treeId);

    if (!loggedInUser) {
      throw new Error('Użytkownik nie znaleziony');
    }

    // Find the person from the logged-in user's persons
    const person = loggedInUser.persons.find(p => p._id.toString() === personId);
    if (!person) {
      throw new Error('Osoba nie została znaleziona');
    }

    // List all related persons' IDs (parents, siblings, spouses, children)
    const relatedPersonIds = new Set([
      ...person.parents.map((relatedPerson: any) => relatedPerson._id.toString()),
      ...person.siblings.map((relatedPerson: any) => relatedPerson._id.toString()),
      ...person.spouses.map((relatedPerson: any) => relatedPerson._id.toString()),
      ...person.children.map((relatedPerson: any) => relatedPerson._id.toString()),
      person._id.toString()  // Include the current person (req.params.id)
    ]);

    // Filter persons from the logged-in user's persons who are not in relatedPersonIds
    const personsWithoutRelation = loggedInUser.persons.filter(p => !relatedPersonIds.has(p._id.toString()));

    // Return the filtered persons
    return personsWithoutRelation;
  }

  

  public async getEventsForPerson(personId: string, type: PersonType,
    userEmail?: string,
    treeId?: string): Promise<IEvent[]> {
    const events: IEvent[] = [];

       const user = await this.getUserOrTree(type, userEmail, treeId);

    if (!user) throw new Error(`${type} not found`);

    const persons: IPerson[] = user.persons;
    const person = persons.find(p => p._id.toString() === personId);
    if (!person) throw new Error('Person not found');


    if (!person) {
      throw new Error('Osoba nie znaleziona');
    }

    // Dodawanie wydarzeń (Narodziny, Śmierć)
    if (person.birthDate) {
      events.push({
        type: 'Narodziny',
        who: `${person.firstName} ${person.lastName}`,
        date: person.birthDate,
        description: 'Narodziny osoby'
      });
    }

    if (person.deathDate) {
      events.push({
        type: 'Śmierć',
        who: `${person.firstName} ${person.lastName}`,
        date: person.deathDate,
        description: 'Śmierć osoby'
      });
    }

    // Dodawanie wydarzeń dla małżonków
    if (person.spouses && person.spouses.length > 0) {
      person.spouses.forEach((spouse: any) => {
        if (spouse.birthDate) {
          events.push({
            type: 'Narodziny',
            who: `${spouse.firstName} ${spouse.lastName}`,
            date: spouse.birthDate,
            description: 'Narodziny małżonka/małżonki'
          });
        }
        if (spouse.deathDate) {
          events.push({
            type: 'Śmierć',
            who: `${spouse.firstName} ${spouse.lastName}`,
            date: spouse.deathDate,
            description: 'Śmierć małżonka/małżonki'
          });
        }
        
        // Dodanie wydarzenia ślubu
        events.push({
          type: 'Ślub',
          who: `${person.firstName} ${person.lastName} & ${spouse.firstName} ${spouse.lastName}`,
          description: `Ślub z ${spouse.firstName} ${spouse.lastName} (bez daty)`
        });
      });
    }

    // Dodawanie wydarzeń dla dzieci
    if (person.children && person.children.length > 0) {
      const childPromises = person.children.map(async (child: any) => {
        const childEvents: IEvent[] = [];

        if (child.birthDate) {
          childEvents.push({
            type: 'Narodziny',
            who: `${child.firstName} ${child.lastName}`,
            date: child.birthDate,
            description: 'Narodziny dziecka'
          });
        }

        if (child.deathDate) {
          childEvents.push({
            type: 'Śmierć',
            who: `${child.firstName} ${child.lastName}`,
            date: child.deathDate,
            description: 'Śmierć dziecka'
          });
        }

        if (child.spouses && child.spouses.length > 0) {
          const spousePromises = child.spouses.map(async (spouseId: mongoose.Types.ObjectId) => {
            const spouse = await Person.findById(spouseId).exec();
            if (spouse) {
              return {
                type: 'Ślub',
                who: `${child.firstName} ${child.lastName} & ${spouse.firstName} ${spouse.lastName}`,
                description: `Ślub dziecka z ${spouse.firstName} ${spouse.lastName} (bez daty)`
              };
            }
            return undefined;
          });

          // Czekamy na zakończenie wszystkich obietnic (promises) i dodajemy je do wydarzeń
          const spouseEvents = await Promise.all(spousePromises);
          childEvents.push(...spouseEvents.filter((event): event is IEvent => event !== undefined));
        }

        return childEvents;
      });

      // Czekamy na wszystkie obietnice i dodajemy je do wydarzeń
      const childEventsArray = await Promise.all(childPromises);
      childEventsArray.flat().forEach(event => events.push(event));
    }

    // Sortowanie wydarzeń po dacie (rosnąco)
    events.sort((a, b) => (a.date && b.date ? new Date(a.date).getTime() - new Date(b.date).getTime() : 0));

    return events;
  }

public async addPersonWithRelationships(input: {
    type: PersonType,
    userEmail?: string,
    treeId?: string
    file?: Express.Multer.File;
    body: {
      gender: string;
      firstName: string;
      middleName?: string;
      lastName: string;
      maidenName?: string;
      birthDateType?: string;
      birthDate?: Date;
      birthDateFrom?: Date;
      birthDateTo?: Date;
      birthPlace?: string;
      status?: string;
      deathDate?: Date;
      deathDateType?: string;
      deathDateFrom?: Date;
      deathDateTo?: Date;
      relationType?: string;
      burialPlace?: string;
      photoUrl?: string;
      weddingDate?: Date;
      selectedOption?: string;
      selectedIds?: string[];
      birthDateFreeText?: string;
      deathDateFreeText?: string;
      id?: string;
    };
  }): Promise<{ newPerson: object; changedPersons: object[] }> {
    const {
      gender,
      firstName,
      middleName,
      lastName,
      maidenName,
      birthDateType,
      birthDate,
      birthDateFrom,
      birthDateTo,
      birthPlace,
      status,
      deathDate,
      deathDateType,
      deathDateFrom,
      deathDateTo,
      relationType,
      birthDateFreeText,
      deathDateFreeText,
      burialPlace,
      photoUrl,
      weddingDate,
      selectedOption,
      selectedIds,
      id
    } = input.body;
  
    // Track all changed person IDs
    const changedPersonsIds: string[] = [];
    const addToChanged = (personId: Types.ObjectId | string) => {
      const idStr = personId.toString();
      if (!changedPersonsIds.includes(idStr)) {
        changedPersonsIds.push(idStr);
      }
    };

    // Fetch user/family tree
    const loggedInUser = await this.getUserOrTree(input.type, input.userEmail, input.treeId);
  
    if (!loggedInUser) {
      throw new Error('Użytkownik nie znaleziony');
    }

    let photoPath: string | null = null;
    if (input.file) {
      photoPath = `uploads/${input.file.filename}`;
    } else if (photoUrl) {
      photoPath = photoUrl;
    }
  
    // Create new person
    const newPerson = new Person({
      gender,
      firstName,
      middleName,
      lastName,
      maidenName,
      birthDateType,
      birthDateFreeText,
      deathDateFreeText,
      birthDate,
      birthDateFrom,
      birthDateTo,
      birthPlace,
      status,
      deathDate,
      deathDateType,
      deathDateFrom,
      deathDateTo,
      burialPlace,
      photo: photoPath,
      parents: [],
      siblings: [],
      spouses: [],
      children: []
    });
  
                  if (!(loggedInUser._id instanceof mongoose.Types.ObjectId)) {
    throw new Error('Invalid user ID type');
  }
    if (relationType && id) {
      const existingPerson = loggedInUser.persons.find(
        (person: IPerson) => person._id.toString() === id
      );
  
      if (existingPerson) {
        // Track existing person (will be modified)
        addToChanged(existingPerson._id);
        
        switch (relationType) {
          case 'Father':
          case 'Mother':
            if (selectedOption === "yes" || selectedOption === "some") {
              const siblingsIds = selectedOption === "yes" 
                ? existingPerson.siblings 
                : selectedIds || [];
            
              for (const siblingId of siblingsIds) {
                const sibling = loggedInUser.persons.find(
                  (p: IPerson) => p._id.toString() === siblingId.toString()
                );
            
                if (sibling) {
                  sibling.parents.push(newPerson._id);
                  newPerson.children.push(sibling._id);
                  addToChanged(sibling._id);
                }
              }
            }

             // Check if existing person has exactly one existing parent
  if (existingPerson.parents.length === 1) {
    const existingParentId = existingPerson.parents[0];
    const existingParent = loggedInUser.persons.find(
      (p: IPerson) => p._id.toString() === existingParentId.toString()
    );

    if (existingParent) {
      // Add mutual spousal relationship
      existingParent.spouses.push({personId: newPerson._id, weddingDate: weddingDate || new Date()});
      newPerson.spouses.push({personId: existingParent._id, weddingDate: weddingDate || new Date()});
      addToChanged(existingParent._id);
    }
  }
            
            // Add parent-child relationship
            newPerson.children.push(existingPerson._id);
            existingPerson.parents.push(newPerson._id);
            break;

          case 'Sibling':
            // Add to existing siblings
            if (!existingPerson.siblings.includes(newPerson._id)) {
              existingPerson.siblings.push(newPerson._id);
            }
                
            // Update all siblings
            for (const siblingId of existingPerson.siblings) {
              if (siblingId.toString() === newPerson._id.toString()) continue;
              
              const sibling = loggedInUser.persons.find(
                (p: IPerson) => p._id.toString() === siblingId.toString()
              );
              
              if (sibling && !sibling.siblings.includes(newPerson._id)) {
                sibling.siblings.push(newPerson._id);
                addToChanged(sibling._id);
              }
            }
  
            // Set siblings for new person
            newPerson.siblings = [
              ...existingPerson.siblings.filter(
                (siblingId: any) => siblingId.toString() !== newPerson._id.toString()
              ),
              existingPerson._id
            ];
            
            // Share parents
            newPerson.parents.push(...existingPerson.parents);
            for (const parentId of existingPerson.parents) {
              const parent = loggedInUser.persons.find(
                (p: IPerson) => p._id.toString() === parentId.toString()
              );
              
              if (parent && !parent.children.includes(newPerson._id)) {
                parent.children.push(newPerson._id);
                addToChanged(parent._id);
              }
            }
            break;
  
          case 'Daughter':
          case 'Son':
            // Add parent-child relationship
            newPerson.parents.push(existingPerson._id);
            existingPerson.children.push(newPerson._id);
          
            // Create unknown parent if needed
            if (existingPerson.spouses.length === 0) {
              const unknownGender = existingPerson.gender === 'female' ? 'male' : 'female';
              const unknownParent = new Person({
                firstName: "Nieznany",
                lastName: existingPerson.lastName,
                gender: unknownGender,
                status: 'alive'
              });
          
              // Link unknown parent
              existingPerson.spouses.push({ 
                personId: unknownParent._id, 
                weddingDate: weddingDate || new Date()
              });
              unknownParent.spouses.push({
                personId: existingPerson._id,
                weddingDate: weddingDate || new Date()
              });
              unknownParent.children.push(newPerson._id);
              newPerson.parents.push(unknownParent._id);




              await HistoryService.logPersonCreation(
            loggedInUser._id,
            unknownParent._id,
            unknownParent
          );
          
              loggedInUser.persons.push(unknownParent);
              await unknownParent.save();
              addToChanged(unknownParent._id);
            } 
          
            // Link child to spouse(s)
            const linkChildToSpouse = async (spouseId: string | Types.ObjectId) => {
              const spouse = loggedInUser.persons.find(
                (p: IPerson) => p._id.toString() === spouseId.toString()
              );
              
              if (spouse) {
                if (!spouse.children.includes(newPerson._id)) {
                  spouse.children.push(newPerson._id);
                  addToChanged(spouse._id);
                }
                if (!newPerson.parents.includes(spouse._id)) {
                  newPerson.parents.push(spouse._id);
                }
          
                // Add sibling relationships
                for (const childId of spouse.children) {
                  if (childId.toString() === newPerson._id.toString()) continue;
                  
                  const sibling = loggedInUser.persons.find(
                    (p: IPerson) => p._id.toString() === childId.toString()
                  );
                  
                  if (sibling) {
                    if (!sibling.siblings.includes(newPerson._id)) {
                      sibling.siblings.push(newPerson._id);
                      await sibling.save();
                      addToChanged(sibling._id);
                    }
                    if (!newPerson.siblings.includes(sibling._id)) {
                      newPerson.siblings.push(sibling._id);
                    }
                  }
                }
                await spouse.save();
              }
            };

                          if (existingPerson.spouses.length === 1) {
    await linkChildToSpouse(existingPerson.spouses[0].personId);
  }
          
            // Link to all spouses if "yes" selected
            if (selectedOption === "yes") {
              for (const spouse of existingPerson.spouses) {
                await linkChildToSpouse(spouse.personId);
              }
            } 
            // Link to specific spouse if "some" selected
            else if (selectedOption === "some" && selectedIds) {
              for (const spouseId of selectedIds) {
                await linkChildToSpouse(spouseId);
              }
            }
          
            // Add sibling relationships for existing children
            for (const childId of existingPerson.children) {
              if (childId.toString() === newPerson._id.toString()) continue;
              
              const sibling = loggedInUser.persons.find(
                (p: IPerson) => p._id.toString() === childId.toString()
              );
              
              if (sibling) {
                if (!sibling.siblings.includes(newPerson._id)) {
                  sibling.siblings.push(newPerson._id);
                  await sibling.save();
                  addToChanged(sibling._id);
                }
                if (!newPerson.siblings.includes(sibling._id)) {
                  newPerson.siblings.push(sibling._id);
                }
              }
            }
            break;
          
          case 'Partner':
            // Add partner relationship
            const weddingDateToUse = weddingDate || new Date();
            
            newPerson.spouses.push({
              personId: existingPerson._id,
              weddingDate: weddingDateToUse
            });
            existingPerson.spouses.push({
              personId: newPerson._id,
              weddingDate: weddingDateToUse
            });
            
            // Add children if selected
            if (selectedOption === "yes" || selectedOption === "some") {
              const childrenIds = selectedOption === "yes" 
                ? existingPerson.children 
                : selectedIds || [];
            
              for (const childId of childrenIds) {
                const child = loggedInUser.persons.find(
                  (p: IPerson) => p._id.toString() === childId.toString()
                );
            
                if (child) {
                  child.parents.push(newPerson._id);
                  newPerson.children.push(child._id);
                  addToChanged(child._id);
                }
              }
            }
            break;
            
          default:
            throw new Error('Nieznany typ relacji.');
        }

        // Save all changes
        const savedPerson = await newPerson.save();
        addToChanged(savedPerson._id);

        await HistoryService.logPersonCreation(
      loggedInUser._id,
      savedPerson._id,
      savedPerson
    );
        
        // Add to user's persons list
        loggedInUser.persons.push(savedPerson);
        await loggedInUser.save();
        await existingPerson.save();

          const personMap = new Map(loggedInUser.persons.map(p => [p._id.toString(), p]));
  
return {
  newPerson: {
    ...this.getPersonBasicInfo(savedPerson),
    ...this.getPersonRelations(savedPerson, personMap),
  },
  changedPersons: changedPersonsIds.map(id => {
    const person = loggedInUser.persons.find(p => p._id.equals(id));
    return person
      ? {
          ...this.getPersonBasicInfo(person),
          ...this.getPersonRelations(person, personMap),
        }
      : null;
  }).filter(p => p !== null), // na wypadek gdyby osoba nie została znaleziona
};
      } else {
        throw new Error(`Osoba o ID ${id} nie została znaleziona wśród osób użytkownika.`);
      }
    } else {
      throw new Error('Niepoprawny typ relacji lub brak ID osoby do powiązania.');
    }
  }


  private buildSearchConditions(searchQuery?: string, letter?: string) {
    let mongoQuery: any = {};
    let additionalFilter = (person: IPerson) => true;

    if (searchQuery) {
      const [firstName, lastName] = searchQuery.split(' ');

      mongoQuery = {
        $or: [
          { firstName: { $regex: firstName, $options: 'i' } },
          ...(lastName ? [{ lastName: { $regex: lastName, $options: 'i' } }] : []),
        ],
      };

      additionalFilter = (person: IPerson): boolean => {
        const matchesFirstName = person.firstName.toLowerCase().includes(firstName.toLowerCase());
        const matchesLastName = lastName
          ? person.lastName.toLowerCase().includes(lastName.toLowerCase())
          : true;

        return matchesFirstName && matchesLastName;
      };
    } else if (letter) {
      mongoQuery = {
        $or: [
          { firstName: { $regex: `^${letter}`, $options: 'i' } },
          { lastName: { $regex: `^${letter}`, $options: 'i' } },
        ],
      };
    }

    return { mongoQuery, additionalFilter };
  }

private buildPersonWithRelations(person: IPerson, personMap: Map<string, IPerson>) {
  return {
    ...this.getPersonBasicInfo(person),
    ...this.getPersonRelations(person, personMap),
  };
}

private getPersonBasicInfo(person: IPerson) {
  return {
    id: person._id.toString(),
    firstName: person.firstName,
    lastName: person.lastName,
    maidenName: person.maidenName,
    birthDate: person.birthDate,
    deathDate: person.deathDate,
    gender: person.gender,
    birthPlace: person.birthPlace,
    burialPlace: person.burialPlace,
    status: person.status,
    birthDateFreeText: person.birthDateFreeText,
    deathDateFreeText: person.deathDateFreeText,
  };
}

private getPersonRelations(person: IPerson, personMap: Map<string, IPerson>) {
  const getRelatedPersons = (ids: mongoose.Types.ObjectId[], type: string) =>
    ids
      // First filter out any null/undefined IDs
      .filter(id => id && mongoose.Types.ObjectId.isValid(id))
      .map(id => {
        try {
          return personMap.get(id.toString());
        } catch (error) {
          return undefined;
        }
      })
      // Filter out undefined values and ensure type safety
      .filter((p): p is IPerson => Boolean(p))
      .map(p => ({
        id: p._id.toString(),
        firstName: p.firstName,
        lastName: p.lastName,
        gender: p.gender,
        type,
      }));

  return {
    parents: getRelatedPersons(person.parents || [], 'blood'),
    siblings: getRelatedPersons(person.siblings || [], 'blood'),
    spouses: getRelatedPersons(
      person.spouses?.map(sp => sp.personId) || [],
      'married'
    ),
    children: getRelatedPersons(person.children || [], 'blood'),
  };
}
private async getUserOrTree(type: PersonType, userEmail?: string, treeId?: string) {
  return type === 'user'
    ? await User.findOne({ email: userEmail }).populate('persons').exec()
    : await FamilyTree.findById(treeId).populate('persons').exec();
}

private resolvePhotoPath(file?: Express.Multer.File, photoUrl?: string, existingPhoto?: string): string | null {
  if (file) return `uploads/${file.filename}`;
  if (photoUrl) return photoUrl;
  return existingPhoto || null;
}
private cleanDateFields(data: any) {
  if (data.birthDateType === 'freeText') data.birthDate = undefined;
  if (data.birthDateType === 'exact') data.birthDateFreeText = undefined;
  if (data.deathDateType === 'freeText') data.deathDate = undefined;
  if (data.deathDateType === 'exact') data.deathDateFreeText = undefined;
}

private async findMaxGenerations(userEmail?: string, treeId?: string): Promise<{
  maxGenerations: number;
  longestNameLine: {
    count: number;
    lastName: string;
    line: Array<{
      id: string;
      firstName: string;
      lastName: string;
      generation: number;
    }>;
  };
}> {
  const user = await this.getUserOrTree('user', userEmail, treeId);

  if (!user || !user.persons || user.persons.length === 0) {
    throw new Error('User not found or no persons in the tree');
  }

  const persons = user.persons;
  
  // Inicjalizacja struktur danych
  const inDegree = new Map<string, number>();
  const childrenMap = new Map<string, string[]>();
  const personDataMap = new Map<string, { firstName: string; lastName: string }>();
  const queue: string[] = [];
  
  // Typ dla śledzenia nazwisk
  type Streak = {
    count: number;
    lastName: string;
    path: string[];
  };

  type LineItem = {
    id: string;
    firstName: string;
    lastName: string;
    generation: number;
  };

  // Nowe struktury do śledzenia nazwisk
  const lastNameStreakMap = new Map<string, Streak>();
  let bestStreak: {
    count: number;
    lastName: string;
    line: LineItem[];
  } = { count: 0, lastName: '', line: [] };

  // Inicjalizacja
  persons.forEach(person => {
      const id = person._id.toString();
      inDegree.set(id, person.parents?.length || 0);
      childrenMap.set(id, []);
      personDataMap.set(id, {
          firstName: person.firstName,
          lastName: person.lastName
      });
      
      // Dla korzeni inicjalizujemy ciąg nazwisk
      if (inDegree.get(id) === 0) {
          lastNameStreakMap.set(id, { 
              count: 1, 
              lastName: person.lastName, 
              path: [id] 
          });
          queue.push(id);
      }
  });

  // Budowanie childrenMap
  persons.forEach(person => {
      const parentId = person._id.toString();
      person.children?.forEach(childId => {
          const childIdStr = childId.toString();
          childrenMap.get(parentId)?.push(childIdStr);
      });
  });

  // Przetwarzanie BFS
  while (queue.length > 0) {
      const parentId = queue.shift()!;
      const parentStreak = lastNameStreakMap.get(parentId)!;
      const parentLastName = personDataMap.get(parentId)!.lastName;

      const children = childrenMap.get(parentId) || [];
      for (const childId of children) {
          let deg = inDegree.get(childId) || 0;
          deg--;
          inDegree.set(childId, deg);

          const childLastName = personDataMap.get(childId)!.lastName;
          let newStreak: Streak;

          if (childLastName === parentLastName) {
              // Kontynuacja ciągu
              newStreak = {
                  count: parentStreak.count + 1,
                  lastName: childLastName,
                  path: [...parentStreak.path, childId]
              };
          } else {
              // Nowy ciąg
              newStreak = {
                  count: 1,
                  lastName: childLastName,
                  path: [childId]
              };
          }

          // Aktualizacja jeśli znaleźliśmy lepszy ciąg
          const currentStreak = lastNameStreakMap.get(childId);
          if (!currentStreak || newStreak.count > currentStreak.count) {
              lastNameStreakMap.set(childId, newStreak);
              
              if (newStreak.count > bestStreak.count) {
                  bestStreak = {
                      count: newStreak.count,
                      lastName: newStreak.lastName,
                      line: newStreak.path.map((id, index) => ({
                          id,
                          firstName: personDataMap.get(id)!.firstName,
                          lastName: personDataMap.get(id)!.lastName,
                          generation: index + parentStreak.path.length - newStreak.path.length + 1
                      }))
                  };
              }
          }

          if (deg === 0) {
              queue.push(childId);
          }
      }
    }

   return {
      maxGenerations: bestStreak.line.length,
      longestNameLine: bestStreak
    };
  }
}

export const personService = new PersonService();
