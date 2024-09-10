import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Person from '../models/Person'; // Zakładam, że masz model w tym katalogu

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
  