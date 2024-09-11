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
    person: string; // Zakładamy, że person to ObjectId lub string reprezentujący ID osoby
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
        id // ID istniejącej osoby, z którą dodajemy relację
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
  
      // Zapisz nową osobę w bazie danych
      const savedPerson = await newPerson.save();
  
      // Sprawdź, czy istnieje osoba, do której dodajemy relację
      if (relationType && id) {
        const existingPerson = await Person.findById(id).exec();
  
        if (existingPerson) {
          // Dodaj relację do nowo utworzonej osoby
          savedPerson.relationships.push({
            person: id,
            type: getInverseRelationshipType(relationType),
          });
  
          // Dodaj odwrotną relację do istniejącej osoby
          existingPerson.relationships.push({
            person: savedPerson._id, // Konwertuj ObjectId na string
            type: relationType,
          });
  
          // Jeśli dodawana osoba jest rodzeństwem, aktualizuj relacje rodzeństwa
          if (relationType === 'Sibling') {
            // Aktualizuj istniejące osoby rodzeństwa
            const existingSiblings = existingPerson.relationships.filter(rel => rel.type === 'Sibling');
  
            for (const siblingRel of existingSiblings) {
              const siblingPerson = await Person.findById(siblingRel.person).exec();
              if (siblingPerson && siblingPerson._id.toString() !== savedPerson._id.toString()) {
                // Dodaj nową osobę do relacji rodzeństwa istniejącej osoby
                if (!siblingPerson.relationships.some(rel => rel.person === savedPerson._id && rel.type === 'Sibling')) {
                  siblingPerson.relationships.push({
                    person: savedPerson._id, // Konwertuj ObjectId na string
                    type: 'Sibling',
                  });
                  await siblingPerson.save();
                }
              }
            }
  
            // Aktualizuj relacje rodzeństwa nowo dodanej osoby
            const newPersonSiblings = await Person.find({
              'relationships.person': savedPerson._id.toString(),
              'relationships.type': 'Sibling'
            }).exec();
  
            for (const newSibling of newPersonSiblings) {
              if (!savedPerson.relationships.some(rel => rel.person === newSibling._id && rel.type === 'Sibling')) {
                savedPerson.relationships.push({
                  person: newSibling._id, // Konwertuj ObjectId na string
                  type: 'Sibling',
                });
              }
            }
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
  
  // Funkcja pomocnicza do uzyskania odwrotnego typu relacji
  const getInverseRelationshipType = (type: string): string => {
    const inverseRelationshipMap: Record<string, string> = {
      'Father': 'Child',
      'Mother': 'Child',
      'Sibling': 'Sibling',
      'Daughter': 'Parent',
      'Son': 'Parent',
      'Partner': 'Partner',
    };
  
    return inverseRelationshipMap[type] || 'unknown';
  };