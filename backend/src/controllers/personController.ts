import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Person, { IPerson } from '../models/Person';
import User, { UserDocument } from '../models/User'; 
import jwt from 'jsonwebtoken';

export const addPerson = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
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
      deathDateType, 
      deathDate, 
      deathDateFrom,
      deathDateTo,
      deathPlace,
      burialPlace,
      photo, 
      photoUrl,
      status
    } = req.body;

   

    let photoPath: string | null = null;

    if (req.file) {
      // Jeśli zdjęcie jest plikiem, zapisujemy jego ścieżkę
      photoPath = `uploads/${req.file.filename}`;
    } else if (photoUrl) {
      // Jeśli zdjęcie jest URL-em, zapisujemy go w bazie danych
      photoPath = photoUrl;
    }

    // Utwórz nową osobę na podstawie danych z żądania
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
      deathDateType,
      deathDate,
      deathDateFrom,
      deathDateTo,
      deathPlace,
      burialPlace,
      photo: photoPath,
      parents: [],
      siblings: [],
      spouses: [],
      children: [],
    });


    await newPerson.save();  // Save the subdocument first
    const updatedUser = await User.findOneAndUpdate(
      { email: req.user?.email },
      { $push: { persons: newPerson } },
      { new: true, useFindAndModify: false }
    );
    
    // Check if updatedUser is null
    if (!updatedUser) {
      res.status(404).json({ message: 'Nie znaleziono użytkownika' });
      return;
    }
    
    // Save the updated user document
    await updatedUser.save();
    
    res.status(201).json({ message: 'Osoba została dodana', person: newPerson });
    
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Wystąpił błąd podczas dodawania osoby', error });
  }
};

export const updatePerson = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return; 
  }

  try {
    const personId = req.params.id;
    const updateData = req.body;

    const loggedInUser = await User.findOne({ email: req.user?.email }).populate('persons').exec();

    if (!loggedInUser) {
      res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
      return;
    }

    // Find the person index in the logged-in user's persons list
    const personIndex = loggedInUser.persons.findIndex(p => p._id.toString() === personId);

    if (personIndex === -1) {
      res.status(404).json({ message: 'Osoba nie znaleziona' });
      return;
    }

    if (updateData.spouses) {
      // Update the wedding date for the person's spouse as well
      const person = loggedInUser.persons[personIndex];
      const spouse = person.spouses?.find(spouse => spouse.personId.toString() !== personId);

      if (spouse) {
        // Find the index of the spouse in the user's persons list
        const spouseIndex = loggedInUser.persons.findIndex(p => p._id.toString() === spouse.personId.toString());
        if (spouseIndex !== -1) {
          // Update the spouse's wedding date
          loggedInUser.persons[spouseIndex].spouses?.forEach(s => {
            if (s.personId.toString() === personId) {
              s.weddingDate = updateData.spouses[0].weddingDate;  // Update wedding date for spouse
            }
          });
        }
      }
    }

    if (req.file) {
      updateData.photo = req.file.path; 
    } else if (updateData.photo) {
      updateData.photo = updateData.photo; 
    } else if (req.file === undefined && !updateData.photo) {
      updateData.photo = loggedInUser.persons[personIndex].photo;
    }

    // Update the person's details
    loggedInUser.persons[personIndex] = { ...loggedInUser.persons[personIndex].toObject(), ...updateData };

    // Save the updated user document
    await loggedInUser.save();

    // Return success response
    res.json({ message: 'Osoba została zaktualizowana', person: loggedInUser.persons[personIndex] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Wystąpił błąd podczas aktualizacji osoby', error });
  }
};

export const deletePerson = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const personId = req.params.id;

    const loggedInUser = await User.findOne({ email: req.user?.email }).populate('persons').exec();

    if (!loggedInUser) {
      res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
      return;
    }

    // Find the person to delete
    const personIndex = loggedInUser.persons.findIndex(p => p._id.toString() === personId);
    if (personIndex === -1) {
      res.status(404).json({ message: 'Osoba nie znaleziona' });
      return;
    }

    // ID osoby do usunięcia
    const deletingPersonId = loggedInUser.persons[personIndex]._id;

    // Usuwamy referencje do osoby w relacjach innych osób
    loggedInUser.persons.forEach(person => {
      // Usuwanie z parents
      person.parents = person.parents.filter(parentId => parentId.toString() !== deletingPersonId.toString());

      // Usuwanie z siblings
      person.siblings = person.siblings.filter(siblingId => siblingId.toString() !== deletingPersonId.toString());

      // Usuwanie z children
      person.children = person.children.filter(childId => childId.toString() !== deletingPersonId.toString());

      // Usuwanie z spouses
      person.spouses = person.spouses.filter(spouse => spouse.personId.toString() !== deletingPersonId.toString());
    });

    // Usuwamy osobę z listy osób użytkownika
    loggedInUser.persons.splice(personIndex, 1);

    // Zapisujemy zmiany
    await loggedInUser.save();

    res.status(200).json({ message: 'Osoba została usunięta wraz z powiązaniami' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Wystąpił błąd podczas usuwania osoby', error });
  }
};


  export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {

      // Pobranie parametrów zapytania
      const searchQuery = req.query.searchQuery as string | undefined;
      const letter = req.query.letter as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 25;
  
      // Budowanie warunków wyszukiwania
      const { mongoQuery, additionalFilter } = buildSearchConditions(searchQuery, letter);
  
      // Pobranie użytkownika z osobami
      const loggedInUser = await User.findOne({ email : req.user?.email })
        .populate<{ persons: IPerson[] }>({
          path: 'persons',
          match: mongoQuery,
        })
        .exec();
  
      if (!loggedInUser) {
         res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
         return;
      }
  
      // Filtracja dodatkowa po stronie serwera
      const filteredPersons = loggedInUser.persons.filter(person => 
        additionalFilter(person)
      );
  
      // Paginacja
      const paginatedPersons = filteredPersons.slice((page - 1) * limit, page * limit);
      const totalUsers = filteredPersons.length;
  
      // Mapowanie wyników
      const result = paginatedPersons.map(person => ({
        ...getPersonBasicInfo(person),
        ...getPersonRelations(person, loggedInUser.persons)
      }));


  
      res.status(200).send(JSON.stringify({
        users: result,
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit)
      },null,0))
    } catch (error) {
      console.error('Błąd podczas pobierania użytkowników:', error);
      const status = error instanceof jwt.JsonWebTokenError ? 401 : 500;
      res.status(status).json({ 
        message: error instanceof Error ? error.message : 'Wystąpił błąd podczas pobierania użytkowników.' 
      });
    }
  };
  
  // Typy dla funkcji pomocniczych
  interface SearchConditions {
    mongoQuery: any;
    additionalFilter: (person: IPerson) => boolean;
  }
  
  interface RelationPerson {
    id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    gender: string;
    type: string;
  }
  
  // Funkcje pomocnicze
  const buildSearchConditions = (searchQuery?: string, letter?: string): SearchConditions => {
    let mongoQuery: any = {};
    let additionalFilter = (person: IPerson) => true;
  
    if (searchQuery) {
      const [firstName, lastName] = searchQuery.split(' ');
      
      mongoQuery = {
        $or: [
          { firstName: { $regex: firstName, $options: 'i' } },
          ...(lastName ? [{ lastName: { $regex: lastName, $options: 'i' } }] : [])
        ]
      };
  
      additionalFilter = (person: IPerson): boolean => {
        if (firstName === "=") {
          return lastName 
            ? person.lastName.toLowerCase().includes(lastName.toLowerCase())
            : true;
        }
        
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
          { lastName: { $regex: `^${letter}`, $options: 'i' } }
        ]
      };
    }
  
    return { mongoQuery, additionalFilter };
  };
  
  const getPersonBasicInfo = (person: IPerson) => ({
    id: person._id.toString(),
    firstName: person.firstName,
    lastName: person.lastName,
    maidenName: person.maidenName,
    birthDate: person.birthDate,
    deathDate: person.deathDate,
    gender: person.gender,
    birthPlace: person.birthPlace,
    // deathPlace: person.deathPlace,
    burialPlace: person.burialPlace,
    // photo: person.photo,
    status: person.status
  });
  
  const getPersonRelations = (person: IPerson, allPersons: IPerson[]): {
    parents: RelationPerson[];
    siblings: RelationPerson[];
    spouses: RelationPerson[];
    children: RelationPerson[];
  } => {
    const getRelatedPersons = (ids: mongoose.Types.ObjectId[], type: string): RelationPerson[] =>
      allPersons
        .filter(p => ids.some(id => id.toString() === p._id.toString()))
        .map(p => ({
          id: p._id,
          firstName: p.firstName,
          lastName: p.lastName,
          gender: p.gender,
          type
        }));
  
    return {
      parents: getRelatedPersons(person.parents, 'blood'),
      siblings: getRelatedPersons(person.siblings, 'blood'),
      spouses: getRelatedPersons(
        person.spouses.map(spouse => spouse.personId),
        'married'
      ),
      children: getRelatedPersons(person.children, 'blood')
    };
  };
  export const getAllUserss = async (req: Request, res: Response): Promise<void> => {
    try {
      // Pobranie użytkownika z osobami
      const user = await User.findOne({ email: req.user?.email })
        .populate<{ persons: IPerson[] }>('persons')
        .lean()
        .exec();
  
        if (!user) {
          res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
          return;
       }
  
      // Mapowanie wyników
      const result = user.persons.map(person => ({
        ...getPersonBasicInfo(person),
        ...getPersonRelations(person, user.persons)
      }));
  
      res.status(200).send(JSON.stringify({
        users: result,
        totalUsers: result.length
      },null,0))
  
    } catch (error) {
      console.error('Błąd podczas pobierania użytkowników:', error);
      const status = error instanceof jwt.JsonWebTokenError ? 401 : 500;
      res.status(status).json({ 
        message: error instanceof Error ? error.message : 'Wystąpił błąd podczas pobierania użytkowników.' 
      });
    }
  };
  
  

  export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const loggedInUser = await User.findOne({ email: req.user?.email }).populate('persons').exec();
  
      if (!loggedInUser) {
        res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
        return;
      }
  
      // Find the person in the logged-in user's persons list
      const person = loggedInUser.persons.find(p => p._id.toString() === req.params.id);
  
      if (person) {
        res.json(person);
      } else {
        res.status(404).json({ message: 'Osoba nie znaleziona' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  export const addPersonWithRelationships = async (req: Request, res: Response): Promise<void> => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    try {
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
            photo, 
      photoUrl,
      weddingDate,
      selectedOption,
      selectedIds,
            id // ID of the existing person to whom we are adding a relationship
        } = req.body;

        // Fetch the logged-in user and populate their persons field
        const loggedInUser = await User.findOne({ email: req.user?.email }).populate('persons').exec();

        if (!loggedInUser) {
            res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
            return;
        }

        let photoPath: string | null = null;

    if (req.file) {
      // Jeśli zdjęcie jest plikiem, zapisujemy jego ścieżkę
      photoPath = `uploads/${req.file.filename}`;
    } else if (photoUrl) {
      // Jeśli zdjęcie jest URL-em, zapisujemy go w bazie danych
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
                              if(selectedOption === "yes"){
                                existingPerson.siblings.forEach(async sibling => {
                                  const personIndex = loggedInUser.persons.findIndex(p => p._id.toString() === sibling.toString());
                                  let person = loggedInUser.persons[personIndex];

                                  if (person) {
                                    person.parents.push(newPerson._id);
                                    newPerson.children.push(person._id)
                                  } 
                                });
                                await loggedInUser.save();
                              }
                              if(selectedOption === "some"){
                                selectedIds.forEach((id: string) => {
                                  const personIndex = loggedInUser.persons.findIndex(p => p._id.toString() === id.toString());
                                  let person = loggedInUser.persons[personIndex];

                                  if (person) {
                                    person.parents.push(newPerson._id);
                                    newPerson.children.push(person._id)
                                  }  
                                });
                                await loggedInUser.save();
                              }

                                newPerson.children.push(existingPerson._id); // Add the parent to the new person
                                existingPerson.parents.push(newPerson._id); // Add the child to the existing person
                                
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

                                      if(existingPerson.spouses.length === 1){
                                        const spouseId = existingPerson.spouses[0].personId;
                                        const spousePerson = loggedInUser.persons.find(
                                            (p: IPerson) => p._id.toString() === spouseId.toString()
                                        );
                                
                                        if (spousePerson) {
                                            // Link child to spouse
                                            if (!spousePerson.children.includes(newPerson._id)) {
                                                spousePerson.children.push(newPerson._id);
                                            }
                                            if (!newPerson.parents.includes(spousePerson._id)) {
                                                newPerson.parents.push(spousePerson._id);
                                            }
                                      }
                                    }
                                  
                                      
                                      if (selectedIds && selectedIds.length === 1) {
                                          const spouseId = selectedIds[0];
                                          const spousePerson = loggedInUser.persons.find(
                                              (p: IPerson) => p._id.toString() === spouseId.toString()
                                          );
                                  
                                          if (spousePerson) {
                                              // Link child to spouse
                                              if (!spousePerson.children.includes(newPerson._id)) {
                                                  spousePerson.children.push(newPerson._id);
                                              }
                                              if (!newPerson.parents.includes(spousePerson._id)) {
                                                  newPerson.parents.push(spousePerson._id);
                                              }
                                  
                                              // Update siblings for spouse's children
                                              for (const childId of spousePerson.children) {
                                                  if (childId.toString() !== newPerson._id.toString()) {
                                                      const sibling = loggedInUser.persons.find(
                                                          (p: IPerson) => p._id.toString() === childId.toString()
                                                      );
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
                                      }
                                  
                                      // Update siblings for existing person's children
                                      for (const childId of existingPerson.children) {
                                          if (childId.toString() !== newPerson._id.toString()) {
                                              const sibling = loggedInUser.persons.find(
                                                  (p: IPerson) => p._id.toString() === childId.toString()
                                              );
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
                              newPerson.spouses.push({
                                personId: existingPerson._id,
                                weddingDate: weddingDate
                              }); // Add the partner to the new person
                                existingPerson.spouses.push({
                                  personId: newPerson._id,
                                  weddingDate: weddingDate
                                }); 

                                if(selectedOption === "yes"){
                                  existingPerson.children.forEach(async children => {
                                    const personIndex = loggedInUser.persons.findIndex(p => p._id.toString() === children.toString());
                                    let person = loggedInUser.persons[personIndex];
  
                                    if (person) {                                      
                                      person.parents.push(newPerson._id);
                                      newPerson.children.push(person._id)
                                    } 
                                  });
                                  await loggedInUser.save();
                                }

  
                                if(selectedOption === "some"){
                                  selectedIds.forEach((id: string) => {
                                    const personIndex = loggedInUser.persons.findIndex(p => p._id.toString() === id.toString());
                                    let person = loggedInUser.persons[personIndex];
  
                                    if (person) {
                                      person.parents.push(newPerson._id);
                                      newPerson.children.push(person._id)
                                    }  
                                  });
                                  await loggedInUser.save();
                                }
                                break;
                            default:
                                res.status(400).json({ message: 'Nieznany typ relacji.' });
                                return;
                        }
        
                               // Save the new person to the database
                const savedPerson = newPerson
        
                // Add the new person to the logged-in user's persons list
                loggedInUser.persons.push(savedPerson);
                await loggedInUser.save();
                        existingPerson.save();
                        loggedInUser.save()
        
                        res.status(201).json({ message: 'Osoba została dodana z relacjami.', person: savedPerson });
                    } else {
                        res.status(404).json({ message: `Osoba o ID ${id} nie została znaleziona wśród osób użytkownika.` });
                    }
                } else {
                    res.status(400).json({ message: 'Niepoprawny typ relacji lub brak ID osoby do powiązania.' });
                }
    } catch (error) {
        console.error('Błąd podczas dodawania osoby z relacjami:', error);
        res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
    }
};


  interface IEvent {
    type: 'Narodziny' | 'Śmierć' | 'Ślub';
    who: string; // Imię i nazwisko osoby
    date?: Date; // Data wydarzenia
    description: string; // Opis wydarzenia
  }
  
  export const getFact = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Fetch the logged-in user and populate their persons field
        const loggedInUser = await User.findOne({ email: req.user?.email }).populate({
            path: 'persons',
            populate: [
                {
                    path: 'children',
                    select: 'firstName lastName birthDate deathDate spouses',
                    populate: {
                        path: 'spouses',
                        select: 'firstName lastName'
                    }
                },
                {
                    path: 'spouses',
                    select: 'firstName lastName birthDate deathDate'
                }
            ]
        }).exec();

        if (!loggedInUser) {
            res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
            return;
        }

        // Find the person from the logged-in user's persons list
        const person: IPerson | undefined = loggedInUser.persons.find((person: IPerson) => person._id.toString() === id);

        if (!person) {
            res.status(404).json({ message: 'Person not found' });
            return;
        }

        const events: IEvent[] = [];

        // Add events for the person (birth, death)
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

        // Add events for spouses (birth, death, marriage without date)
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

                // Add marriage event without date if there is a marriage
                events.push({
                    type: 'Ślub',
                    who: `${person.firstName} ${person.lastName} & ${spouse.firstName} ${spouse.lastName}`,
                    description: `Ślub z ${spouse.firstName} ${spouse.lastName} (bez daty)`
                });
            });
        }

        // Add events for children (birth, death, marriage)
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

                    // Wait for all promises and add them to events
                    const spouseEvents = await Promise.all(spousePromises);
                    childEvents.push(...spouseEvents.filter((event): event is IEvent => event !== undefined));
                }

                return childEvents;
            });

            // Wait for all promises and add them to events
            const childEventsArray = await Promise.all(childPromises);
            childEventsArray.flat().forEach(event => events.push(event));
        }

        // Sort events by date (ascending) if date exists
        events.sort((a, b) => (a.date && b.date ? new Date(a.date).getTime() - new Date(b.date).getTime() : 0));

        // Return events
        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getRelations = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {

    const loggedInUser = await User.findOne({ email: req.user?.email }).populate('persons').exec();

    if (!loggedInUser) {
      return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
    }

    // Find the person from the logged-in user's persons list
    const person = loggedInUser.persons.find((person: IPerson) => person._id.toString() === id);

    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    console.log(person)
    const getPersonsByIds = (ids: mongoose.Types.ObjectId[]) =>
      loggedInUser.persons.filter((p: IPerson) =>
        ids.some(id => id.toString() === p._id.toString())
      );
    
    
      const getPersonsByIdsSpouses = (ids: mongoose.Types.ObjectId[]) =>
        loggedInUser.persons.filter(p =>
          ids.some(id => id.toString() === p._id.toString()) // Porównujemy personId z _id osób w loggedInUser.persons
        );
      
      const relations = {
        Rodzice: getPersonsByIds(person.parents),
        Rodzeństwo: getPersonsByIds(person.siblings),
        Małżonkowie: getPersonsByIdsSpouses(person.spouses.map(spouse => spouse.personId)), // Mapujemy po personId
        Dzieci: getPersonsByIds(person.children),
      };
    console.log(getPersonsByIds(person.spouses.map(spouse => spouse.personId)))
    console.log(getPersonsByIds(person.children));

    // Return the relations
    res.json({
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
    });
  } catch (error) {
    console.error('Error fetching relations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const deleteRelationship = async (req: Request, res: Response) => {
  const { personId, relationId } = req.params;

  try {
    // Fetch the logged-in user and populate their persons field
    const loggedInUser = await User.findOne({ email: req.user?.email }).populate('persons').exec();

    if (!loggedInUser) {
      return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
    }

    // Find the person from whom we are removing the relation
    const person = loggedInUser.persons.find(p => p._id.toString() === personId);
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
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

    res.status(200).json({ message: 'Nastąpiło usunięcie relacji' });
  } catch (error) {
    console.error('Error removing relation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const getPersonsWithoutRelation = async (req: Request, res: Response) => {
  const personId = req.params.id; // ID osoby, dla której szukamy osób bez relacji

  try {
      const loggedInUser = await User.findOne({ email: req.user?.email }).populate('persons').exec();

      if (!loggedInUser) {
          return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
      }

      // Find the person from the logged-in user's persons
      const person = loggedInUser.persons.find(p => p._id.toString() === personId);
      if (!person) {
          return res.status(404).json({
              success: false,
              message: 'Osoba nie została znaleziona',
          });
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

      // Map the filtered persons to the required fields for the frontend
      const result = personsWithoutRelation.map(p => ({
          firstName: p.firstName,
          lastName: p.lastName,
          gender: p.gender,
          _id: p._id
      }));

      // Return the response in JSON format
      return res.status(200).json({
          success: true,
          data: result,
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({
          success: false,
          message: 'Błąd serwera',
      });
  }
};

export const addRelation = async (req: Request, res: Response) => {
  const { personId, relatedPersonId, relationType } = req.body;

  const validRelationTypes = ['parent', 'sibling', 'spouse', 'child'];
  if (!validRelationTypes.includes(relationType)) {
    return res.status(400).json({ message: 'Nieprawidłowy typ relacji' });
  }

  try {
    const loggedInUser = await User.findOne({ email: req.user?.email }).populate('persons').exec();

    if (!loggedInUser) {
      return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
    }

    const person = loggedInUser.persons.find((p: any) => p._id.toString() === personId);
    const relatedPerson = loggedInUser.persons.find((p: any) => p._id.toString() === relatedPersonId);

    if (!person || !relatedPerson) {
      return res.status(404).json({ message: 'Osoba nie znaleziona' });
    }

    // Modify the person and relatedPerson
    switch (relationType) {
      case 'parent':
        if (!person.parents.includes(relatedPersonId)) person.parents.push(relatedPersonId);
        if (!relatedPerson.children.includes(personId)) relatedPerson.children.push(personId);
        break;
      case 'sibling':
        if (!person.siblings.includes(relatedPersonId)) person.siblings.push(relatedPersonId);
        if (!relatedPerson.siblings.includes(personId)) relatedPerson.siblings.push(personId);
        break;
        case 'spouse': {
          const currentDate = new Date();
      
          // Sprawdź, czy relatedPersonId nie jest już w liście współmałżonków
          if (!person.spouses.some(spouse => spouse.personId.equals(relatedPersonId))) {
            person.spouses.push({ personId: relatedPersonId, weddingDate: currentDate });
          }
      
          // Sprawdź, czy personId nie jest już w liście współmałżonków relatedPerson
          if (!relatedPerson.spouses.some(spouse => spouse.personId.equals(person._id))) {
            relatedPerson.spouses.push({ personId: person._id, weddingDate: currentDate });
          }
          break;
        }
      case 'child':
        if (!person.children.includes(relatedPersonId)) person.children.push(relatedPersonId);
        if (!relatedPerson.parents.includes(personId)) relatedPerson.parents.push(personId);
        break;
      default:
        return res.status(400).json({ message: 'Nieprawidłowy typ relacji' });
    }

    // Save the updated User document
    await loggedInUser.save();

    res.status(200).json({ message: 'Relacja została pomyślnie dodana' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};