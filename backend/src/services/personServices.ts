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
  public async deletePerson(  personId: string,
    type: PersonType,
    userEmail?: string,
    treeId?: string): Promise<void> {
    const user = type === 'user'
    ? await User.findOne({ email: userEmail }).populate('persons').exec()
    : await FamilyTree.findById(treeId).populate('persons').exec();

    if (!user) {
      throw new Error('Użytkownik nie znaleziony');
    }

    const personIndex = user.persons.findIndex(p => p._id.toString() === personId);
    if (personIndex === -1) {
      throw new Error('Osoba nie znaleziona');
    }

    const deletingPersonId = user.persons[personIndex]._id;

    user.persons.forEach(person => {
      person.parents = this.filterRelations(person.parents, deletingPersonId);
      person.siblings = this.filterRelations(person.siblings, deletingPersonId);
      person.children = this.filterRelations(person.children, deletingPersonId);
      person.spouses = person.spouses.filter(
        spouse => spouse.personId.toString() !== deletingPersonId.toString()
      );
    });

    user.persons.splice(personIndex, 1);
    await user.save();
  }

  private filterRelations(relations: Types.ObjectId[], deletingId: Types.ObjectId): Types.ObjectId[] {
    return relations.filter(id => id.toString() !== deletingId.toString());
  }

  public async addPerson(input: AddPersonInput) {
    const { gender, firstName, middleName, lastName, maidenName, birthDateType, birthDate, 
            birthPlace, deathDateType, deathDate, deathPlace, burialPlace, status, photoUrl } = input.body;

    let photoPath: string | null = null;

    if (input.file) {
      photoPath = `uploads/${input.file.filename}`;
    } else if (photoUrl) {
      photoPath = photoUrl;
    }

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
      { new: true, useFindAndModify: false }
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
  ): Promise<IPerson> {
    const user = type === 'user'
    ? await User.findOne({ email: userEmail }).populate('persons').exec()
    : await FamilyTree.findById(treeId).populate('persons').exec();

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

    user.persons[personIndex] = {
      ...person.toObject(),
      ...updateData,
    };

    await user.save();

    return user.persons[personIndex];
  }

  public async getAllPersonsWithRelations(type: PersonType,
    userEmail?: string,
    treeId?: string): Promise<any[]> {
    const user = type === 'user'
    ? await User.findOne({ email: userEmail }).populate('persons').exec()
    : await FamilyTree.findById(treeId).populate('persons').exec();

    if (!user) throw new Error('Użytkownik nie znaleziony');

    return user.persons.map(person => ({
      ...this.getPersonBasicInfo(person),
      ...this.getPersonRelations(person, user.persons),
    }));
  }

  public async getPerson(personId: string,type: PersonType,
    userEmail?: string,
    treeId?: string): Promise<IPerson | null> {
    const user = type === 'user'
    ? await User.findOne({ email: userEmail }).populate('persons').exec()
    : await FamilyTree.findById(treeId).populate('persons').exec();

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

  public async getAllPersons(query: any,type: PersonType,
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
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 25;

    const { mongoQuery, additionalFilter } = this.buildSearchConditions(searchQuery, letter);

    const loggedInUser = type === 'user'
    ? await User.findOne({ email: userEmail }).populate('persons').exec()
    : await FamilyTree.findById(treeId).populate('persons').exec();

    if (!loggedInUser) {
      throw new Error('Użytkownik nie znaleziony');
    }

    const filteredPersons = loggedInUser.persons.filter(additionalFilter);
    const paginatedPersons = filteredPersons.slice((page - 1) * limit, page * limit);
    const totalUsers = filteredPersons.length;

    const users = paginatedPersons.map(person => ({
      ...this.getPersonBasicInfo(person),
      ...this.getPersonRelations(person, loggedInUser.persons),
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
    const user = type === 'user'
    ? await User.findOne({ email: userEmail }).populate('persons').exec()
    : await FamilyTree.findById(treeId).populate('persons').exec();


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
    const loggedInUser = type === 'user'
    ? await User.findOne({ email: userEmail }).populate('persons').exec()
    : await FamilyTree.findById(treeId).populate('persons').exec();

    if (!loggedInUser) {
      throw new Error('Użytkownik nie znaleziony');
    }

    // Find the person from whom we are removing the relation
    const person = loggedInUser.persons.find(p => p._id.toString() === personId);
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
    const relatedPerson = loggedInUser.persons.find(p => p._id.toString() === relationId);
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

    await loggedInUser.save();
  }

  public async getPersonsWithoutRelation(personId: string,type: PersonType,
    userEmail?: string,
    treeId?: string): Promise<IPerson[]> {
    const loggedInUser = type === 'user'
    ? await User.findOne({ email: userEmail }).populate('persons').exec()
    : await FamilyTree.findById(treeId).populate('persons').exec();

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

    const user = type === 'user'
    ? await User.findOne({ email: userEmail }).populate('persons').exec()
    : await FamilyTree.findById(treeId).populate('persons').exec();

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
      id?: string; // ID of the existing person to whom we are adding a relationship
    };
  }): Promise<IPerson> {
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
      burialPlace,
      photoUrl,
      weddingDate,
      selectedOption,
      selectedIds,
      id
    } = input.body;
  
    // Fetch the logged-in user and populate their persons field
    const loggedInUser = input.type === 'user'
    ? await User.findOne({ email: input.userEmail }).populate('persons').exec()
    : await FamilyTree.findById(input.treeId).populate('persons').exec();
  
    if (!loggedInUser) {
      throw new Error('Użytkownik nie znaleziony');
    }
  
    let photoPath: string | null = null;
  
    if (input.file) {
      photoPath = `uploads/${input.file.filename}`;
    } else if (photoUrl) {
      photoPath = photoUrl;
    }
  
    // Create a new person with data from the request
    const newPerson = new Person({
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
      burialPlace,
      photo: photoPath,
      parents: [],
      siblings: [],
      spouses: [],
      children: []
    });
  
    // Find the existing person from the logged-in user's persons list
    if (relationType && id) {
      const existingPerson = loggedInUser.persons.find((person: IPerson) => person._id.toString() === id);
  
      if (existingPerson) {
        switch (relationType) {
          case 'Father':
            case 'Mother':
              // Sprawdzamy opcję "yes" lub "some"
              if (selectedOption === "yes" || selectedOption === "some") {
                const siblingsIds = selectedOption === "yes" ? existingPerson.siblings : selectedIds || []; // Upewniamy się, że selectedIds nie jest undefined
            
                for (const siblingId of siblingsIds) {
                  const personIndex = loggedInUser.persons.findIndex(p => p._id.toString() === siblingId.toString());
                  const person = loggedInUser.persons[personIndex];
            
                  if (person) {
                    person.parents.push(newPerson._id);
                    newPerson.children.push(person._id);
                  }
                }
            
                await loggedInUser.save();
              }
            
              // Dodanie rodzica do dziecka
              newPerson.children.push(existingPerson._id); // Dodanie nowego rodzica do nowej osoby
              existingPerson.parents.push(newPerson._id); // Dodanie dziecka do istniejącej osoby
            
              break;
          case 'Sibling':
            if (!existingPerson.siblings.includes(newPerson._id)) {
              existingPerson.siblings.push(newPerson._id);
            }
  
            existingPerson.siblings.forEach(async sibling => {
              const personIndex = loggedInUser.persons.findIndex(p => p._id.toString() === sibling.toString());
              let person = loggedInUser.persons[personIndex];
  
              if (person) {
                person.siblings.push(newPerson._id);
              }
            });
  
            await loggedInUser.save();
  
            // Set siblings for the newly added person
            newPerson.siblings = [...existingPerson.siblings.filter(
              (siblingId: any) => siblingId.toString() !== newPerson._id.toString()
            )];
            newPerson.siblings.push(existingPerson._id);
            newPerson.parents.push(...existingPerson.parents);
            existingPerson.parents.forEach(async parent => {
              const personIndex = loggedInUser.persons.findIndex(p => p._id.toString() === parent.toString());
              let person = loggedInUser.persons[personIndex];
  
              if (person) {
                person.children.push(newPerson._id);
              }
            });
            break;
  
            case 'Daughter':
              case 'Son':
                // Add child to the existing person
                newPerson.parents.push(existingPerson._id);
                existingPerson.children.push(newPerson._id);
              
                // If existing person has no spouses, create an unknown parent
                if (existingPerson.spouses.length === 0) {
                  const unknownGender = existingPerson.gender === 'female' ? 'male' : 'female';
                  const unknownParent = new Person({
                    firstName: "Nieznany",
                    lastName: existingPerson.lastName,
                    gender: unknownGender,
                    status: 'alive'
                  });
              
                  // Link unknown parent to existing person
                  existingPerson.spouses.push({ personId: unknownParent._id, weddingDate: new Date() });
                  unknownParent.spouses.push({ personId: existingPerson._id, weddingDate: new Date() });
              
                  loggedInUser.persons.push(unknownParent);
                  await unknownParent.save();
                }
              
                // Link child to spouse if there is one
                const linkChildToSpouse = async (spouseId: string | Types.ObjectId) => {
                  const spousePerson = loggedInUser.persons.find((p: IPerson) => p._id.toString() === spouseId.toString());
                  if (spousePerson) {
                    if (!spousePerson.children.includes(newPerson._id)) {
                      spousePerson.children.push(newPerson._id);
                    }
                    if (!newPerson.parents.includes(spousePerson._id)) {
                      newPerson.parents.push(spousePerson._id);
                    }
              
                    // Update siblings for spouse's children
                    for (const childId of spousePerson.children) {
                      if (childId.toString() !== newPerson._id.toString()) {
                        const sibling = loggedInUser.persons.find((p: IPerson) => p._id.toString() === childId.toString());
                        if (sibling) {
                          if (!sibling.siblings.includes(newPerson._id)) {
                            sibling.siblings.push(newPerson._id);
                            await sibling.save();
                          }
                          if (!newPerson.siblings.includes(sibling._id)) {
                            newPerson.siblings.push(sibling._id);
                          }
                        }
                      }
                    }
                    await spousePerson.save();
                  }
                };
              
                // If there is one spouse, link the child to the spouse
                if (existingPerson.spouses.length === 1) {
                  const spouseId = existingPerson.spouses[0].personId;
                  await linkChildToSpouse(spouseId);
                }
              
                // If selectedIds are provided, link child to selected spouse
                if (selectedIds && selectedIds.length === 1) {
                  const spouseId = selectedIds[0];
                  await linkChildToSpouse(spouseId);
                }
              
                // Update siblings for existing person's children
                for (const childId of existingPerson.children) {
                  if (childId.toString() !== newPerson._id.toString()) {
                    const sibling = loggedInUser.persons.find((p: IPerson) => p._id.toString() === childId.toString());
                    if (sibling) {
                      if (!sibling.siblings.includes(newPerson._id)) {
                        sibling.siblings.push(newPerson._id);
                        await sibling.save();
                      }
                      if (!newPerson.siblings.includes(sibling._id)) {
                        newPerson.siblings.push(sibling._id);
                      }
                    }
                  }
                }
              
                break;
              
            case 'Partner':
              // Dodanie partnera do obu osób
              const weddingDateToUse = weddingDate || new Date(); // Jeśli brak daty, ustawiamy bieżącą
            
              newPerson.spouses.push({
                personId: existingPerson._id,
                weddingDate: weddingDateToUse // Dodanie partnera do nowej osoby
              });
              existingPerson.spouses.push({
                personId: newPerson._id,
                weddingDate: weddingDateToUse // Dodanie partnera do istniejącej osoby
              });
            
              // Dodawanie dzieci, jeśli wybrano odpowiednią opcję
              if (selectedOption === "yes" || selectedOption === "some") {
                const childrenIds = selectedOption === "yes" ? existingPerson.children : selectedIds  || [];
            
                for (const childId of childrenIds) {
                  const personIndex = loggedInUser.persons.findIndex(p => p._id.toString() === childId.toString());
                  const person = loggedInUser.persons[personIndex];
            
                  if (person) {
                    person.parents.push(newPerson._id);
                    newPerson.children.push(person._id);
                  }
                }
            
                await loggedInUser.save();
              }
              break;
          default:
            throw new Error('Nieznany typ relacji.');
        }
  
        // Save the new person to the database
        const savedPerson = await newPerson.save();
  
        // Add the new person to the logged-in user's persons list
        loggedInUser.persons.push(savedPerson);
        await loggedInUser.save();
        await existingPerson.save();
  
        return savedPerson;
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
    };
  }

  private getPersonRelations(person: IPerson, allPersons: IPerson[]) {
    const getRelatedPersons = (ids: mongoose.Types.ObjectId[], type: string) =>
      allPersons
        .filter(p => ids.some(id => id.toString() === p._id.toString()))
        .map(p => ({
          id: p._id,
          firstName: p.firstName,
          lastName: p.lastName,
          gender: p.gender,
          type,
        }));

    return {
      parents: getRelatedPersons(person.parents, 'blood'),
      siblings: getRelatedPersons(person.siblings, 'blood'),
      spouses: getRelatedPersons(
        person.spouses.map(sp => sp.personId),
        'married'
      ),
      children: getRelatedPersons(person.children, 'blood'),
    };
  }
}

export const personService = new PersonService();
