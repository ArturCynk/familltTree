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
  

 export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await Person.find({}, 'firstName lastName gender _id'); // Pobierz tylko pola firstName, lastName i gender
      res.status(200).json(users);
    } catch (error) {
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

  interface IRelationship {
    personId: string;
    type: string;
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
        id
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
        relationships: []
      });
  
      // Zapisz osobę w bazie danych
      const savedPerson = await newPerson.save();
  

  
          // Sprawdź, czy osoba, do której dodajemy relację, istnieje
          const relatedPerson = await Person.findById(id).exec();
  
          if (relatedPerson) {
            // Dodaj relację do nowo utworzonej osoby
            savedPerson.relationships.push({
              person: savedPerson._id,  // Konwertuj ObjectId na string
              type: getInverseRelationshipType(relationType),
            });
            
            // Dodaj odwrotną relację do osoby, do której tworzymy relację
            relatedPerson.relationships.push({
              person: savedPerson._id,  // Konwertuj ObjectId na string
              type: relationType,
            });
            
            await relatedPerson.save();            
          } else {
            // Jeśli osoba, do której dodajemy relację, nie istnieje
            return res.status(404).json({ message: `Osoba o ID ${id} nie została znaleziona.` });
          }
  
        // Zapisz nowo utworzoną osobę z dodanymi relacjami
        await savedPerson.save();
  
      return res.status(201).json({ message: 'Osoba została dodana z relacjami.', person: savedPerson });
    } catch (error) {
      console.error('Błąd podczas dodawania osoby z relacjami:', error);
      return res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
    }
  };
  
  // Funkcja pomocnicza do uzyskania odwrotnego typu relacji
  const getInverseRelationshipType = (type: string): string => {
    const inverseRelationshipMap: Record<string, string> = {
      'Father': 'Child',
      'Mother': 'Child',
      'Brother': 'Sibling',
      'Sister': 'Sibling',
      'Daughter': 'Parent',
      'Son': 'Parent',
      'Partner': 'Partner',
    };
  
    // Sprawdzamy, czy przekazany typ istnieje w mapie
    if (type in inverseRelationshipMap) {
      return inverseRelationshipMap[type];
    } else {
      // Jeżeli typ nie istnieje w mapie, zwracamy 'unknown'
      return 'unknown';
    }
  };
  