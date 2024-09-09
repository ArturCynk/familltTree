import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Person from '../models/Person'; // Import modelu Person

// Funkcja do dodawania nowej osoby
export const addPerson = async (req: Request, res: Response): Promise<void> => {
  // Sprawdź wyniki walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  }

  try {
    const { gender, firstName, middleName, lastName, maidenName, birthDateType, birthDate, birthDateEnd, deathDateType, deathDate, deathDateEnd } = req.body;

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
