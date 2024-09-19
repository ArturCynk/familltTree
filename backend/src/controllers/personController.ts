import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose, { Types } from 'mongoose';

import Person, { IPerson } from '../models/Person';
import User, { UserDocument } from '../models/User'; // Import the User model
import jwt from 'jsonwebtoken';
import { request } from 'http';
import { loginUser } from './authController';

export const addPerson = async (req: Request, res: Response): Promise<void> => {
  // Sprawdź wyniki walidacji
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
      status
    } = req.body;

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Token w nagłówku Authorization

    if (!token) {
      res.status(401).json({ msg: 'Brak tokenu' });
      return;
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
      if (err) {
        res.status(403).json({ msg: 'Token jest nieprawidłowy' });
      }
      req.user = decoded as UserDocument;
    });

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
      parents: [],
      siblings: [],
      spouses: [],
      children: [],
    })
    
    const updatedUser = await User.findOneAndUpdate(
      {email: req.user?.email},
      { $push: { persons: newPerson } }, // Dodaj ID osoby
      { new: true, useFindAndModify: false }
    );

    res.status(201).json({ message: 'Osoba została dodana', person: newPerson });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Wystąpił błąd podczas dodawania osoby', error });
  }
};

// Funkcja do aktualizacji danych osoby
export const updatePerson = async (req: Request, res: Response): Promise<void> => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return; // Avoid further processing in case of validation errors
  }

  try {
    const personId = req.params.id;
    const updateData = req.body;

    // Check for token in Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token

    if (!token) {
      res.status(401).json({ msg: 'Brak tokenu' });
      return;
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const user = decoded as UserDocument;

    if (!user) {
      res.status(401).json({ msg: 'Token jest nieprawidłowy' });
      return;
    }

    // Fetch the logged-in user and populate their persons field
    const loggedInUser = await User.findOne({ email: user.email }).populate('persons').exec();

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
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return; // Avoid further processing in case of validation errors
  }

  try {
    const personId = req.params.id;

    // Check for token in Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token

    if (!token) {
      res.status(401).json({ msg: 'Brak tokenu' });
      return;
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const user = decoded as UserDocument;

    if (!user) {
      res.status(401).json({ msg: 'Token jest nieprawidłowy' });
      return;
    }

    // Fetch the logged-in user and populate their persons field
    const loggedInUser = await User.findOne({ email: user.email }).populate('persons').exec();

    if (!loggedInUser) {
      res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
      return;
    }

    // Find the person index in the logged-in user's persons list
    const personIndex = loggedInUser.persons.findIndex(p => p._id.toString() === personId);

    if (personIndex === -1) {
      res.status(404).json({ message: 'Osoba nie znaleziona' });
      return; // Prevent further execution if person is not found
    }

    // Remove the person from the logged-in user's persons list
    loggedInUser.persons.splice(personIndex, 1);

    // Save the updated user document
    await loggedInUser.save();

    // Delete the person from the Person collection
    const deletedPerson = await Person.findByIdAndDelete(personId);

    if (!deletedPerson) {
      res.status(404).json({ message: 'Osoba nie znaleziona w bazie' });
      return; // Prevent further execution if person is not found in the collection
    }

    // Return success response
    res.json({ message: 'Osoba została usunięta', person: deletedPerson });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Wystąpił błąd podczas usuwania osoby', error });
  }
};


// Funkcja do pobierania liczby osób w drzewie
export const getPersonCount = async (req: Request, res: Response): Promise<void> => {
  try {
    // Sprawdź obecność tokena w nagłówku Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Token w nagłówku Authorization

    if (!token) {
      res.status(401).json({ msg: 'Brak tokenu' });
      return;
    }

    // Weryfikacja tokena
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const user = decoded as UserDocument;

    if (!user) {
      res.status(401).json({ msg: 'Token jest nieprawidłowy' });
      return;
    }

    // Znajdź użytkownika na podstawie emaila
    const foundUser = await User.findOne({ email: user.email }).populate('persons');
    
    if (!foundUser) {
      res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
      return;
    }

    // Zlicz liczbę osób przypisanych do użytkownika
    const personCount = foundUser.persons.length;

    // Zwróć liczbę osób
    res.status(200).json({ count: personCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Wystąpił błąd podczas pobierania liczby osób', error });
  }
};
  

  interface PersonData {
    _id: string;
    firstName: string;
    lastName: string;
  }
  
  const getPersonData = async (ids: mongoose.Types.ObjectId[]): Promise<PersonData[]> => {
    if (ids.length === 0) return [];
  
    const people = await Person.find({ _id: { $in: ids } }, 'firstName lastName _id gender').exec();
    return people.map(person => ({
      _id: person._id.toString(),
      firstName: person.firstName,
      lastName: person.lastName,
      gender: person.gender
    }));
  };
  interface Query {
    [key: string]: any; // This allows for dynamic keys but should be used cautiously
  }
  
  export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      // Sprawdzenie obecności tokena w nagłówku Authorization
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1]; // Token w nagłówku Authorization
  
      if (!token) {
        res.status(401).json({ msg: 'Brak tokenu' });
        return;
      }
  
      // Weryfikacja tokena
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      const user = decoded as UserDocument;
  
      if (!user) {
        res.status(401).json({ msg: 'Token jest nieprawidłowy' });
        return;
      }
  
      // Pobranie wartości z query string (filtrowanie według litery lub pełnego imienia i nazwiska)
      const searchQuery = req.query.searchQuery as string | undefined;
      const letter = req.query.letter as string | undefined;
      const page = parseInt(req.query.page as string) || 1; // Strona (domyślnie 1)
      const limit = parseInt(req.query.limit as string) || 10; // Liczba użytkowników na stronie (domyślnie 10)
  
      // Budowanie zapytania
      let query: Query = {};
  
      if (searchQuery) {
        // Szukanie po pełnym imieniu i nazwisku (łączenie firstName i lastName)
        query = {
          $or: [
            { $expr: { $regexMatch: { input: { $concat: ['$firstName', ' ', '$lastName'] }, regex: searchQuery, options: 'i' } } }
          ]
        };
      } else if (letter) {
        // Filtrowanie według pierwszej litery nazwiska
        query = { lastName: { $regex: `^${letter}`, $options: 'i' } };
      }
  
      // Pobieranie użytkownika, a następnie jego osoby
      const loggedInUser = await User.findOne({ email: user.email }).populate('persons').exec();
  
      if (!loggedInUser) {
        res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
        return;
      }
  
      // Pobieranie osób powiązanych z zalogowanym użytkownikiem
      const persons = loggedInUser.persons.filter(person => {
        return Object.keys(query).every(key => {
          const typedKey = key as keyof IPerson; // Type assertion
          return person[typedKey] === query[typedKey];
        });
      });
  
      // Paginacja
      const paginatedPersons = persons.slice((page - 1) * limit, page * limit);
  
      // Pobieranie całkowitej liczby osób (do wyliczenia ilości stron)
      const totalUsers = persons.length;
  
      // Pobieranie pełnych danych dla relacji
      const result = await Promise.all(paginatedPersons.map(async person => {
        const parents = await getPersonData(person.parents);
        const siblings = await getPersonData(person.siblings);
        const spouses = await getPersonData(person.spouses);
        const children = await getPersonData(person.children);
  
        return {
          _id: person._id.toString(),
          firstName: person.firstName,
          lastName: person.lastName,
          maidenName: person.maidenName,
          birthDate: person.birthDate,
          deathDate: person.deathDate,
          gender: person.gender,
          birthPlace: person.birthPlace,
          deathPlace: person.deathPlace,
          parents,
          siblings,
          spouses,
          children
        };
      }));
  
      res.status(200).json({
        users: result,
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit)
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Wystąpił błąd podczas pobierania użytkowników.' });
    }
  };
  

  export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check for token in Authorization header
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1]; // Extract token
  
      if (!token) {
        res.status(401).json({ msg: 'Brak tokenu' });
        return;
      }
  
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      const user = decoded as UserDocument;
  
      if (!user) {
        res.status(401).json({ msg: 'Token jest nieprawidłowy' });
        return;
      }
  
      // Fetch the logged-in user and populate their persons field
      const loggedInUser = await User.findOne({ email: user.email }).populate('persons').exec();
  
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
            id // ID of the existing person to whom we are adding a relationship
        } = req.body;

        // Check for token in Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ msg: 'Brak tokenu' });
            return;
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        const user = decoded as UserDocument;

        if (!user) {
            res.status(401).json({ msg: 'Token jest nieprawidłowy' });
            return;
        }

        // Fetch the logged-in user and populate their persons field
        const loggedInUser = await User.findOne({ email: user.email }).populate('persons').exec();

        if (!loggedInUser) {
            res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
            return;
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
                        newPerson.children.push(existingPerson._id); // Add the parent to the new person
                        existingPerson.parents.push(newPerson._id); // Add the child to the existing person
                        break;
                    case 'Sibling':
                        if (!existingPerson.siblings.includes(newPerson._id)) {
                            existingPerson.siblings.push(newPerson._id);
                        }

                        // Update siblings among existing siblings
                        for (const siblingId of existingPerson.siblings) {
                            if (siblingId.toString() !== newPerson._id.toString()) {
                                const sibling = loggedInUser.persons.find((person: IPerson) => person._id === siblingId) 
                                if (sibling && !sibling.siblings.includes(newPerson._id)) {
                                    sibling.siblings.push(newPerson._id);
                                }
                            }
                        }

                        // Set siblings for the newly added person
                        newPerson.siblings = [...existingPerson.siblings.filter(
                            (siblingId: any) => siblingId.toString() !== savedPerson._id.toString()
                        )];
                        newPerson.siblings.push(existingPerson._id);
                        break;
                    case 'Daughter':
                    case 'Son':
                      newPerson.parents.push(existingPerson._id); // Add the child to the new person
                        existingPerson.children.push(newPerson._id); // Add the parent to the existing person
                        break;
                    case 'Partner':
                      newPerson.spouses.push(existingPerson._id); // Add the partner to the new person
                        existingPerson.spouses.push(newPerson._id); // Add the partner to the existing person
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

        // Check for token in Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ msg: 'Brak tokenu' });
            return;
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        const user = decoded as UserDocument;

        if (!user) {
            res.status(401).json({ msg: 'Token jest nieprawidłowy' });
            return;
        }

        // Fetch the logged-in user and populate their persons field
        const loggedInUser = await User.findOne({ email: user.email }).populate({
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
    // Check for token in Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ msg: 'Brak tokenu' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const user = decoded as UserDocument;

    if (!user) {
      return res.status(401).json({ msg: 'Token jest nieprawidłowy' });
    }

    // Fetch the logged-in user and populate their persons field
    const loggedInUser = await User.findOne({ email: user.email }).populate('persons').exec();

    if (!loggedInUser) {
      return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
    }

    // Find the person from the logged-in user's persons list
    const person = loggedInUser.persons.find((person: IPerson) => person._id.toString() === id);

    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    // Filter relations from logged-in user's persons
    const getPersonsByIds = (ids: mongoose.Types.ObjectId[]) =>
      loggedInUser.persons.filter((p: IPerson) => ids.includes(p._id));

    const relations = {
      Rodzice: getPersonsByIds(person.parents),
      Rodzeństwo: getPersonsByIds(person.siblings),
      Małżonkowie: getPersonsByIds(person.spouses),
      Dzieci: getPersonsByIds(person.children),
    };

    // Return the relations
    res.json({
      Rodzice: relations.Rodzice.map((parent: IPerson) => ({
        _id: parent._id,
        firstName: parent.firstName,
        lastName: parent.lastName,
        gender: parent.gender,
      })),
      Rodzeństwo: relations.Rodzeństwo.map((sibling: IPerson) => ({
        _id: sibling._id,
        firstName: sibling.firstName,
        lastName: sibling.lastName,
        gender: sibling.gender,
      })),
      Małżonkowie: relations.Małżonkowie.map((spouse: IPerson) => ({
        _id: spouse._id,
        firstName: spouse.firstName,
        lastName: spouse.lastName,
        gender: spouse.gender,
      })),
      Dzieci: relations.Dzieci.map((child: IPerson) => ({
        _id: child._id,
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
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
          return res.status(401).json({ msg: 'Brak tokenu' });
      }

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      const user = decoded as UserDocument;

      if (!user) {
          return res.status(401).json({ msg: 'Token jest nieprawidłowy' });
      }

      // Fetch the logged-in user and populate their persons field
      const loggedInUser = await User.findOne({ email: user.email }).populate('persons').exec();

      if (!loggedInUser) {
          return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
      }

      // Find the person from whom we are removing the relation
      const person = loggedInUser.persons.find(p => p._id.toString() === personId);
      if (!person) {
          return res.status(404).json({ message: 'Person not found' });
      }

      // Remove the relation from the person's relations array
      const relationTypes: (keyof IPerson)[] = ['parents', 'siblings', 'spouses', 'children'];
      for (const type of relationTypes) {
          const relations = person[type] as mongoose.Types.ObjectId[];
          const index = relations.indexOf(relationId as unknown as mongoose.Types.ObjectId);
          if (index > -1) {
              relations.splice(index, 1);
              await person.save();
              break;
          }
      }

      // Remove the person from the relations of the related person
      const relatedPerson = loggedInUser.persons.find(p => p._id.toString() === relationId);
      if (relatedPerson) {
          for (const type of relationTypes) {
              const relations = relatedPerson[type] as mongoose.Types.ObjectId[];
              const index = relations.indexOf(personId as unknown as mongoose.Types.ObjectId);
              if (index > -1) {
                  relations.splice(index, 1);
                  await relatedPerson.save();
                  break;
              }
          }
      }

      res.status(200).json({ message: 'Nastąpiło usunięcie relacji' });
  } catch (error) {
      console.error('Error removing relation:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};


export const getPersonsWithoutRelation = async (req: Request, res: Response) => {
  const personId = req.params.id; // ID osoby, dla której szukamy osób bez relacji

  try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
          return res.status(401).json({ msg: 'Brak tokenu' });
      }

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      const user = decoded as UserDocument;

      if (!user) {
          return res.status(401).json({ msg: 'Token jest nieprawidłowy' });
      }

      // Fetch the logged-in user and populate their persons field
      const loggedInUser = await User.findOne({ email: user.email }).populate('persons').exec();

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


  // Validate relation type
  const validRelationTypes = ['parent', 'sibling', 'spouse', 'child'];
  if (!validRelationTypes.includes(relationType)) {
      return res.status(400).json({ message: 'Nieprawidłowy typ relacji' });
  }

  try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
          return res.status(401).json({ msg: 'Brak tokenu' });
      }

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      const user = decoded as UserDocument;

      if (!user) {
          return res.status(401).json({ msg: 'Token jest nieprawidłowy' });
      }

      // Fetch the logged-in user and populate their persons field
      const loggedInUser = await User.findOne({ email: user.email }).populate('persons').exec();

      if (!loggedInUser) {
          return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
      }

      // Find the person and related person from the logged-in user's persons
      const person = loggedInUser.persons.find(p => p._id.toString() === personId);
      const relatedPerson = loggedInUser.persons.find(p => p._id.toString() === relatedPersonId);

      if (!person || !relatedPerson) {
          return res.status(404).json({ message: 'Osoba nie znaleziona' });
      }

      // Add relation
      switch (relationType) {
          case 'parent':
              if (!person.parents.includes(relatedPersonId)) person.parents.push(relatedPersonId);
              if (!relatedPerson.children.includes(personId)) relatedPerson.children.push(personId);
              break;
          case 'sibling':
              if (!person.siblings.includes(relatedPersonId)) person.siblings.push(relatedPersonId);
              if (!relatedPerson.siblings.includes(personId)) relatedPerson.siblings.push(personId);
              break;
          case 'spouse':
              if (!person.spouses.includes(relatedPersonId)) person.spouses.push(relatedPersonId);
              if (!relatedPerson.spouses.includes(personId)) relatedPerson.spouses.push(personId);
              break;
          case 'child':
              if (!person.children.includes(relatedPersonId)) person.children.push(relatedPersonId);
              if (!relatedPerson.parents.includes(personId)) relatedPerson.parents.push(personId);
              break;
          default:
              return res.status(400).json({ message: 'Nieprawidłowy typ relacji' });
      }

      await person.save();
      await relatedPerson.save();

      res.status(200).json({ message: 'Relacja została pomyślnie dodana' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Błąd serwera' });
  }
};
