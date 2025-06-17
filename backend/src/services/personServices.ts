import mongoose, { Types } from 'mongoose';
import User from '../models/User';
import Person from '../models/Person';
import { IPerson } from '../models/Person';
import FamilyTree from '../models/FamilyTree';

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

    const deletingPerson = personMap.get(personId);
    if (!deletingPerson) throw new Error('Osoba nie znaleziona');

    const deletingIdStr = deletingPerson._id.toString();
    const updatedPersonIds = new Set<string>();

    // Single pass through all persons
    for (const person of user.persons) {
      if (!person?._id) continue;
      
      const personId = person._id.toString();
      let wasModified = false;
      
      // Process standard relations (parents, siblings, children)
      const relations: Array<'parents' | 'siblings' | 'children'> = ['parents', 'siblings', 'children'];
      for (const relType of relations) {
        const relationArray = person[relType] as Types.ObjectId[];
        if (relationArray?.length) {
          const origLength = relationArray.length;
          person[relType] = relationArray.filter(
            id => id.toString() !== deletingIdStr
          ) as any;
          wasModified ||= (person[relType] as Types.ObjectId[]).length !== origLength;
        }
      }

      // Special handling for spouses
      if (person.spouses?.length) {
        const origLength = person.spouses.length;
        person.spouses = person.spouses.filter(
          spouse => spouse.personId.toString() !== deletingIdStr
        );
        wasModified ||= person.spouses.length !== origLength;
      }

      if (wasModified) {
        updatedPersonIds.add(personId);
        personMap.set(personId, person);
      }
    }

    // Remove deleted person
    user.persons = user.persons.filter(p => 
      p?._id?.toString() !== deletingIdStr
    );
    personMap.delete(deletingIdStr);

    await user.save();

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


  private filterRelations(relations: Types.ObjectId[], deletingId: Types.ObjectId): Types.ObjectId[] {
    return relations.filter(id => id.toString() !== deletingId.toString());
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

    await newPerson.save();

    const updatedUser = await User.findOneAndUpdate(
      { email: input.email },
      { $push: { persons: newPerson } },
      { new: true}
    );

    if (!updatedUser) {
      throw new Error('Nie znaleziono użytkownika');
    }

    await updatedUser.save();

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


    if (!user) {
      throw new Error('Użytkownik nie znaleziony');
    }

    const personIndex = user.persons.findIndex(p => p._id.toString() === personId);

    if (personIndex === -1) {
      throw new Error('Osoba nie znaleziona');
    }

    const person = user.persons[personIndex];

    if (updateData.spouses) {
      const spouse = person.spouses?.find(spouse => spouse.personId.toString() !== personId);
      if (spouse) {
        const spouseIndex = user.persons.findIndex(p => p._id.toString() === spouse.personId.toString());
        if (spouseIndex !== -1) {
          user.persons[spouseIndex].spouses?.forEach(s => {
            if (s.personId.toString() === personId) {
              s.weddingDate = updateData.spouses[0].weddingDate;
            }
          });
        }
      }
    }

    if (file) {
      updateData.photo = file.path;
    } else if (!updateData.photo) {
      updateData.photo = person.photo;
    }

this.cleanDateFields(updateData);

   user.persons[personIndex] = {
  ...user.persons[personIndex].toObject(),
  ...updateData,
};

await user.save();

const updatedPerson = user.persons[personIndex];
const personMap = new Map(user.persons.map(p => [p._id.toString(), p]));

return {
  ...this.getPersonBasicInfo(updatedPerson),
  ...this.getPersonRelations(updatedPerson, personMap),
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

  public async deleteRelation(personId: string, relationId: string,type: PersonType,
    userEmail?: string,
    treeId?: string): Promise<void> {
   const user = await this.getUserOrTree(type, userEmail, treeId);


    if (!user) {
      throw new Error('Użytkownik nie znaleziony');
    }

    // Find the person from whom we are removing the relation
    const person = user.persons.find(p => p._id.toString() === personId);
    if (!person) {
      throw new Error('Osoba nie znaleziona');
    }

    // Typy relacji do usunięcia
    const relationTypes: (keyof IPerson)[] = ['parents', 'siblings', 'spouses', 'children'];

    // Usunięcie relacji z obiektu person
    for (const type of relationTypes) {
      const relations = person[type] as any[];

      let index = -1;
      if (type === 'spouses') {
        // Dla spouses porównujemy właściwość _id, jeśli element jest obiektem
        index = relations.findIndex(rel => {
          if (typeof rel === 'object' && rel !== null && '_id' in rel) {
            return rel.personId.toString() === relationId;
          }
          return rel.toString() === relationId;
        });
      } else {
        // Dla pozostałych typów porównujemy elementy jako stringi
        index = relations.findIndex(rel => rel.toString() === relationId);
      }

      if (index > -1) {
        relations.splice(index, 1);
        await person.save();
        break;
      }
    }

    // Usunięcie osoby z relacji powiązanego obiektu (relatedPerson)
    const relatedPerson = user.persons.find(p => p._id.toString() === relationId);
    if (relatedPerson) {
      for (const type of relationTypes) {
        const relations = relatedPerson[type] as any[];

        let index = -1;
        if (type === 'spouses') {
          index = relations.findIndex(rel => {
            if (typeof rel === 'object' && rel !== null && '_id' in rel) {
              return rel.personId.toString() === personId;
            }
            return rel.toString() === personId;
          });
        } else {
          index = relations.findIndex(rel => rel.toString() === personId);
        }

        if (index > -1) {
          relations.splice(index, 1);
          await relatedPerson.save();
          break;
        }
      }
    }

    await user.save();
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


}

export const personService = new PersonService();
