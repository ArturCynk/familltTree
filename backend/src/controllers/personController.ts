import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose, { Types } from 'mongoose';

import Person, { IPerson } from '../models/Person';
import User, { UserDocument } from '../models/User'; // Import the User model
import jwt from 'jsonwebtoken';
import { request } from 'http';

export const addPerson = async (req: Request, res: Response): Promise<void> => {
  // Sprawdź wyniki walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  console.log(3);
  
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

    const user = req.user;
    if (!user) {
      res.status(401).json({ msg: 'Użytkownik nie jest zalogowany' });
      return;
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
      parents: [],
      siblings: [],
      spouses: [],
      children: [],
    });

    // Zapisz nową osobę
    const savedPerson = await newPerson.save();
    console.log("Nowa osoba zapisana:", savedPerson);


    console.log('osoba ' + req.user?.email);
    

    // Zaktualizuj użytkownika, dodając ID nowej osoby do jego listy osób
    const updatedUser = await User.findOneAndUpdate(
      {email: req.user?.email},
      { $push: { persons: savedPerson } }, // Dodaj ID osoby
      { new: true, useFindAndModify: false }
    );

    console.log('update' + updatedUser);
    

    if (!updatedUser) {
      res.status(404).json({ message: 'Użytkownik nie znaleziony' });
      return;
    }

    // Zwróć odpowiedź sukcesu
    res.status(201).json({ message: 'Osoba została dodana', person: savedPerson });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Wystąpił błąd podczas dodawania osoby', error });
  }
};

// Funkcja do aktualizacji danych osoby
export const updatePerson = async (req: Request, res: Response): Promise<void> => {
  // Sprawdź wyniki walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return; // Dodaj return, aby uniknąć dalszego przetwarzania w przypadku błędów walidacji
  }

  try {
    const personId = req.params.id;
    const updateData = req.body;

    // Aktualizuj osobę na podstawie ID i danych z żądania
    const updatedPerson = await Person.findByIdAndUpdate(personId, updateData, { new: true, runValidators: true });

    if (!updatedPerson) {
      res.status(404).json({ message: 'Osoba nie znaleziona' });
      return; // Dodaj return, aby uniknąć dalszego przetwarzania w przypadku braku osoby
    }

    // Zwróć odpowiedź sukcesu
    res.json({ message: 'Osoba została zaktualizowana', person: updatedPerson });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Wystąpił błąd podczas aktualizacji osoby', error });
  }
};

// Funkcja do usuwania osoby
export const deletePerson = async (req: Request, res: Response): Promise<void> => {
  // Sprawdź wyniki walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return; // Dodaj return, aby uniknąć dalszego przetwarzania w przypadku błędów walidacji
  }

  try {
    const personId = req.params.id;

    // Usuń osobę na podstawie ID
    const deletedPerson = await Person.findByIdAndDelete(personId);

    if (!deletedPerson) {
      res.status(404).json({ message: 'Osoba nie znaleziona' });
      return; // Dodaj return, aby uniknąć dalszego przetwarzania w przypadku braku osoby
    }

    // Zwróć odpowiedź sukcesu
    res.json({ message: 'Osoba została usunięta', person: deletedPerson });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Wystąpił błąd podczas usuwania osoby', error });
  }
};

// Funkcja do pobierania liczby osób w drzewie
export const getPersonCount = async (req: Request, res: Response): Promise<void> => {
    try {
      // Zlicz wszystkie dokumenty w kolekcji
      const personCount = await Person.countDocuments();
  
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
  
  export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      // Pobranie wartości z query string (filtrowanie według litery lub pełnego imienia i nazwiska)
      const searchQuery = req.query.searchQuery as string | undefined;
      const letter = req.query.letter as string | undefined;
      const page = parseInt(req.query.page as string) || 1; // Strona (domyślnie 1)
      const limit = parseInt(req.query.limit as string) || 10; // Liczba użytkowników na stronie (domyślnie 10)
  
      // Budowanie zapytania
      let query = {};
      
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
  
      // Pobieranie użytkowników z paginacją
      const users = await Person.find(query)
        .skip((page - 1) * limit) // Przeskocz odpowiednią liczbę wyników
        .limit(limit) // Ogranicz liczbę wyników do limitu
        .select('firstName lastName maidenName birthPlace _id birthDate deathDate deathPlace gender parents siblings spouses children') // Wybierz pola do zwrócenia
        .exec();
  
      // Pobieranie całkowitej liczby użytkowników (do wyliczenia ilości stron)
      const totalUsers = await Person.countDocuments(query);
  
      // Pobieranie pełnych danych dla relacji
      const result = await Promise.all(users.map(async user => {
        const parents = await getPersonData(user.parents);
        const siblings = await getPersonData(user.siblings);
        const spouses = await getPersonData(user.spouses);
        const children = await getPersonData(user.children);
  
        return {
          _id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          maidenName: user.maidenName,
          birthDate: user.birthDate,
          deathDate: user.deathDate,
          gender: user.gender,
          birthPlace: user.birthPlace,
          deathPlace: user.deathPlace,
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
  
  

  export const getUser = async(req: Request, res: Response): Promise<void> => {
    try {
      const person = await Person.findById(req.params.id);
      if (person) {
        res.json(person);
      } else {
        res.status(404).json({ message: 'Osoba nie znaleziona' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  export const addPersonWithRelationships = async (req: Request, res: Response) => {
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
        id // ID istniejącej osoby, do której dodajemy relację
      } = req.body;
  
      // Utwórz nową osobę z danymi z żądania
      const newPerson: IPerson = new Person({
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
  
      // Zapisz nową osobę w bazie danych
      const savedPerson = await newPerson.save();
  
      // Sprawdź, czy istnieje osoba, do której dodajemy relację
      if (relationType && id) {
        const existingPerson = await Person.findById(id).exec();
  
        if (existingPerson) {
          switch (relationType) {
            case 'Father':
            case 'Mother':
              savedPerson.children.push(id); // Dodaj rodzica do nowej osoby
              existingPerson.parents.push(savedPerson._id); // Dodaj dziecko do istniejącej osoby
              break;
            case 'Sibling':
              // Dodaj nową osobę jako rodzeństwo do istniejącej osoby
              if (!existingPerson.siblings.includes(savedPerson._id)) {
                existingPerson.siblings.push(savedPerson._id);
              }
  
              // Uaktualnij rodzeństwo wśród istniejących rodzeństw
              for (const siblingId of existingPerson.siblings) {
                if (siblingId.toString() !== savedPerson._id.toString()) {
                  const sibling = await Person.findById(siblingId).exec();
                  if (sibling && !sibling.siblings.includes(savedPerson._id)) {
                    sibling.siblings.push(savedPerson._id);
                    await sibling.save();
                  }
                }
              }
  
              // Ustaw rodzeństwo dla nowo dodanej osoby
              savedPerson.siblings = [...existingPerson.siblings.filter(
                (siblingId) => siblingId.toString() !== savedPerson._id.toString()
              )];
              savedPerson.siblings.push(existingPerson._id)
  
              break;
            case 'Daughter':
                case 'Son':
                  savedPerson.parents.push(id); // Dodaj dziecko do nowej osoby
                  existingPerson.children.push(savedPerson._id); // Dodaj rodzica do istniejącej osoby
                  break;
              case 'Partner':
                  savedPerson.spouses.push(id); // Dodaj partnera do nowej osoby
                  existingPerson.spouses.push(savedPerson._id); // Dodaj partnera do istniejącej osoby
                  break;
            default:
              return res.status(400).json({ message: 'Nieznany typ relacji.' });
          }
  
          // Zapisz zmiany
          await savedPerson.save();
          await existingPerson.save();
  
          return res.status(201).json({ message: 'Osoba została dodana z relacjami.', person: savedPerson });
        } else {
          return res.status(404).json({ message: `Osoba o ID ${id} nie została znaleziona.` });
        }
      } else {
        return res.status(400).json({ message: 'Niepoprawny typ relacji lub brak ID osoby do powiązania.' });
      }
    } catch (error) {
      console.error('Błąd podczas dodawania osoby z relacjami:', error);
      return res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
    }
  };

  
 // Interfejsy do typowania
  interface IChild extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    birthDate?: Date;
    deathDate?: Date;
    spouses: mongoose.Types.ObjectId[]; // Referencje do małżonków dziecka
  }
  
  interface ISpouse extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    birthDate?: Date;
    deathDate?: Date;
  }
  
  interface IEvent {
    type: 'Narodziny' | 'Śmierć' | 'Ślub';
    who: string; // Imię i nazwisko osoby
    date?: Date; // Data wydarzenia
    description: string; // Opis wydarzenia
  }
  
  export const getFact = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
  
      // Pobierz osobę na podstawie ID i załaduj jej dzieci oraz małżonków
      const person: IPerson | null = await Person.findById(id)
        .populate({
          path: 'children',
          select: 'firstName lastName birthDate deathDate spouses',
          populate: {
            path: 'spouses',
            select: 'firstName lastName'
          }
        })
        .populate({
          path: 'spouses',
          select: 'firstName lastName birthDate deathDate'
        })
        .exec();
  
      const events: IEvent[] = [];
      
      if (!person) {
        res.status(404).json({ message: 'Person not found' });
        return;
      }
  
      // Dodaj wydarzenia dla osoby (narodziny, śmierć)
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
  
      // Dodaj wydarzenia dla małżonków (narodziny, śmierć, ślub bez daty)
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
  
          // Dodaj wydarzenie ślubu bez daty, jeśli istnieje małżeństwo
          events.push({
            type: 'Ślub',
            who: `${person.firstName} ${person.lastName} & ${spouse.firstName} ${spouse.lastName}`,
            description: `Ślub z ${spouse.firstName} ${spouse.lastName} (bez daty)`
          });
        });
      }
  
      // Dodaj wydarzenia dla dzieci (narodziny, śmierć, ślub)
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
  
            // Poczekaj na wszystkie obietnice i dodaj je do wydarzeń
            const spouseEvents = await Promise.all(spousePromises);
            childEvents.push(...spouseEvents.filter((event): event is IEvent => event !== undefined));
          }
  
          return childEvents;
        });
  
        // Poczekaj na zakończenie wszystkich obietnic i dodaj je do wydarzeń
        const childEventsArray = await Promise.all(childPromises);
        childEventsArray.flat().forEach(event => events.push(event));
      }
  
      // Sortowanie wydarzeń po dacie rosnąco (jeśli data istnieje)
      events.sort((a, b) => (a.date && b.date ? new Date(a.date).getTime() - new Date(b.date).getTime() : 0));
  
      // Zwrócenie wydarzeń
      res.status(200).json(events);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

  export const getRelations = async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log(req.params);
    
  
    try {
      // Pobierz osobę z bazy danych
      const person = await Person.findById(id)
        .populate('parents', 'firstName lastName gender')
        .populate('siblings', 'firstName lastName gender')
        .populate('spouses', 'firstName lastName gender')
        .populate('children', 'firstName lastName gender')
        .exec();
  
      if (!person) {
        return res.status(404).json({ message: 'Person not found' });
      }
  
      // Przygotuj obiekt z relacjami
      const relations = {
        Rodzice: person.parents.map((parent: any) => ({
          _id: parent._id,
          firstName: parent.firstName,
          lastName: parent.lastName,
          gender: parent.gender,
        })),
        Rodzeństwo: person.siblings.map((sibling: any) => ({
          _id: sibling._id,
          firstName: sibling.firstName,
          lastName: sibling.lastName,
          gender: sibling.gender,
        })),
        Małżonkowie: person.spouses.map((spouse: any) => ({
          _id: spouse._id,
          firstName: spouse.firstName,
          lastName: spouse.lastName,
          gender: spouse.gender,
        })),
        Dzieci: person.children.map((child: any) => ({
          _id: child._id,
          firstName: child.firstName,
          lastName: child.lastName,
          gender: child.gender,
        })),
      };
  
      // Zwróć odpowiedź
      res.json(relations);
    } catch (error) {
      console.error('Error fetching relations:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  export const deleteRelationship = async (req: Request, res: Response) => {
    const { personId, relationId } = req.params;
  
    try {
      // Find the person from whom we are removing the relation
      const person = await Person.findById(personId);
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
      const relatedPerson = await Person.findById(relationId);
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
    const personId = req.params.id;
  
    // Sprawdź, czy id jest poprawnym ObjectId
    if (!mongoose.Types.ObjectId.isValid(personId)) {
      return res.status(400).json({ message: 'Niepoprawny format ID' });
    }
  
    try {
      // Znajdź daną osobę po id
      const person = await Person.findById(new mongoose.Types.ObjectId(personId))
        .populate('parents siblings spouses children')
        .exec();
  
      if (!person) {
        return res.status(404).json({
          success: false,
          message: 'Osoba nie została znaleziona',
        });
      }
  
      // Lista wszystkich relacji danej osoby
      const relatedPersonIds = [
        ...person.parents,
        ...person.siblings,
        ...person.spouses,
        ...person.children,
      ].map((relatedPerson: any) => relatedPerson._id);
  
      // Dodaj również id samej osoby, aby nie zwrócić jej jako wyniku
      relatedPersonIds.push(person._id);
  
      // Pobierz wszystkie osoby, które nie są w relacji z daną osobą
      const personsWithoutRelation = await Person.find({
        _id: { $nin: relatedPersonIds }, // Nie zawierają się w relacjach
      }).select('firstName lastName gender'); // Wybieramy tylko potrzebne pola
  
      // Zwróć odpowiedź w formacie JSON
      return res.status(200).json({
        success: true,
        data: personsWithoutRelation,
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
  
    if (!personId || !relatedPersonId || !relationType) {
      return res.status(400).json({ message: 'Brak wymaganych pól' });
    }
  
    // Validate relation type
    const validRelationTypes = ['parent', 'sibling', 'spouse', 'child'];
    if (!validRelationTypes.includes(relationType)) {
      return res.status(400).json({ message: 'Nieprawidłowy typ relacji' });
    }
  
    try {
      const person = await Person.findById(personId);
      const relatedPerson = await Person.findById(relatedPersonId);
  
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
  