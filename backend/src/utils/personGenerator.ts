import { faker } from '@faker-js/faker';
import Person from '../models/Person';

export const createRandomPerson = (gender: 'male' | 'female') => {
  const firstName = gender === 'male' ? faker.person.firstName('male') : faker.person.firstName('female');
  const lastName = faker.person.lastName();
  const status = Math.random() > 0.5 ? 'alive' : 'deceased'; // Losowy status

  return new Person({
    gender,
    firstName,
    middleName: faker.person.firstName(), // Losowe drugie imię
    lastName,
    maidenName: gender === 'female' ? faker.person.lastName() : undefined, // Tylko dla kobiet
    birthDateType: 'exact',
    birthDate: null,
    birthDateFrom: null,
    birthDateTo: null,
    birthPlace: faker.location.city(), // Losowe miejsce urodzenia
    status,
    deathDateType: status === 'deceased' ? 'exact' : null,
    deathDate: status === 'deceased' ? null : null,
    deathDateFrom: null,
    deathDateTo: null,
    deathPlace: status === 'deceased' ? faker.location.city() : null,
    burialPlace: status === 'deceased' ? faker.location.city() : null,
    photo: faker.image.avatar(), // Losowy avatar
    parents: [],
    siblings: [],
    spouses: [],
    children: [],
  });
};
