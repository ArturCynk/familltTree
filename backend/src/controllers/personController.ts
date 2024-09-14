import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose, { Types } from 'mongoose';

import Person, { IPerson } from '../models/Person';


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
      birthDateEnd, 
      deathDateType, 
      deathDate, 
      deathDateEnd,
      status
    } = req.body;

    // Utwórz nową osobę na podstawie danych z żądania
    const newPerson = new Person({
      gender,
      firstName,
      middleName,
      lastName,
      maidenName,
      birthDateType,
      birthDate,
      birthDateEnd,
      deathDateType,
      deathDate,
      deathDateEnd,
      status
    });

    // Zapisz osobę do bazy danych
    await newPerson.save();

    // Zwróć odpowiedź sukcesu
    res.status(201).json({ message: 'Osoba została dodana', person: newPerson });
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
  
    const people = await Person.find({ _id: { $in: ids } }, 'firstName lastName _id').exec();
    return people.map(person => ({
      _id: person._id.toString(),
      firstName: person.firstName,
      lastName: person.lastName
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
        .select('firstName lastName maidenName _id birthDate deathDate gender parents siblings spouses children') // Wybierz pola do zwrócenia
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
          parents,
          siblings,
          spouses,
          children
        };
      }));
  
      // Zwracamy użytkowników, całkowitą liczbę użytkowników i aktualną stronę
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
  