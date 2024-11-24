import User from '../models/User';
import { createRandomPerson } from './personGenerator';
import { IPerson } from '../models/Person';

/**
 * Dodaje 100 losowych osób do użytkownika.
 * @param userEmail Email użytkownika, do którego mają zostać przypisane osoby.
 */
export const add100PersonsToUser = async (userEmail: string) => {
    const persons: IPerson[] = [];

  for (let i = 0; i < 100; i++) {
    const gender = i % 2 === 0 ? 'male' : 'female'; // Naprzemienne płcie
    const newPerson = createRandomPerson(gender);
    persons.push(newPerson);

    console.log(`Utworzono osobę ${i + 1}: ${newPerson.firstName} ${newPerson.lastName}`);
    await newPerson.save();
  }

  const updatedUser = await User.findOneAndUpdate(
    { email: userEmail },
    { $push: { persons: { $each: persons } } },
    { new: true, useFindAndModify: false }
  );

  console.log('Zaktualizowano użytkownika:', updatedUser);
};

// Wywołanie funkcji
// add100PersonsToUser('arturcynk197@gmail.com')
//   .then(() => console.log('Dodano 100 osób pomyślnie'))
//   .catch((error) => console.error('Błąd podczas dodawania osób:', error));
