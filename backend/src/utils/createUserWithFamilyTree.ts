import { faker } from '@faker-js/faker/locale/pl';
import mongoose from 'mongoose';
import User, { UserDocument } from '../models/User';
import { IPerson } from '../models/Person';

// Typ definiujący czyste dane osoby
interface GeneratedPersonData {
  gender: 'male' | 'female';
  firstName: string;
  middleName?: string;
  lastName: string;
  maidenName?: string;
  birthDateType: 'exact';
  birthDate: string; // zapisany jako ISO string
  birthPlace: string;
  status: 'alive' | 'deceased';
  deathDate?: string;
  deathPlace?: string;
  burialPlace?: string;
  photo?: string;
  parents: mongoose.Types.ObjectId[];
  siblings: mongoose.Types.ObjectId[];
  spouses: { personId: mongoose.Types.ObjectId; weddingDate: string }[];
  children: mongoose.Types.ObjectId[];
}

// Funkcja generująca datę urodzenia – wykorzystujemy faker.date.birthdate i zwracamy obiekt Date
const generateBirthDate = (minAge: number, maxAge: number): Date => {
  return faker.date.birthdate({ min: minAge, max: maxAge, mode: 'year' });
};

let counter = 0;

// Funkcja generująca pojedynczą osobę
const generatePerson = (gender: 'male' | 'female'): GeneratedPersonData => {
    try {
      const isMale = gender === 'male';
      const firstName = isMale
        ? faker.person.firstName('male') || 'Unknown'
        : faker.person.firstName('female') || 'Unknown';
      const lastName = faker.person.lastName(isMale ? 'male' : 'female') || 'Unknown';
      const maidenName = isMale ? undefined : faker.person.lastName('female');
      
      const birthDate = generateBirthDate(0, 100);
      const isDeceased = faker.datatype.boolean(0.2);
      const deathDate = isDeceased 
        ? faker.date.between({ from: birthDate, to: new Date() })
        : undefined;
  
      counter++;
      console.log(`Generated person ${counter}: ${firstName} ${lastName}`);
  
      return {
        gender: gender || (isMale ? 'male' : 'female'),
        firstName,
        middleName: faker.datatype.boolean(0.3) ? faker.person.middleName() : undefined,
        lastName,
        maidenName: faker.datatype.boolean(0.3) ? maidenName : undefined,
        birthDateType: 'exact',
        birthDate: birthDate.toISOString(),
        birthPlace: `${faker.location.city()}, ${faker.location.country()}`,
        status: isDeceased ? 'deceased' : 'alive',
        deathDate: isDeceased ? deathDate?.toISOString() : undefined,
        deathPlace: isDeceased ? `${faker.location.city()}, ${faker.location.country()}` : undefined,
        burialPlace: isDeceased ? faker.location.city() : undefined,
        photo: faker.datatype.boolean(0.5) ? faker.image.avatar() : undefined,
        parents: [],
        siblings: [],
        spouses: [],
        children: [],
      };
    } catch (error) {
      console.error('Error generating person:', error);
      // Return a default person if generation fails
      return {
        gender: 'male',
        firstName: 'Unknown',
        lastName: 'Unknown',
        birthDateType: 'exact',
        birthDate: new Date().toISOString(),
        birthPlace: 'Unknown',
        status: 'alive',
        parents: [],
        siblings: [],
        spouses: [],
        children: [],
      };
    }
  };
// Funkcja tworząca relacje rodzinne między osobami
const createFamilyRelations = (
  persons: (GeneratedPersonData & { _id: mongoose.Types.ObjectId })[]
): (GeneratedPersonData & { _id: mongoose.Types.ObjectId })[] => {
  // Sortowanie wg daty urodzenia (zamieniamy ISO string na Date)
  persons.sort((a, b) => new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime());

  // Dzielimy osoby na pokolenia – początkowo przyjmujemy przedział 25 lat
  const generations: (GeneratedPersonData & { _id: mongoose.Types.ObjectId })[][] = [];
  let currentGeneration: (GeneratedPersonData & { _id: mongoose.Types.ObjectId })[] = [];
  let currentYearRange = 25;

  persons.forEach((person, index) => {
    const personYear = new Date(person.birthDate).getFullYear();
    if (index === 0) {
      currentGeneration.push(person);
    } else {
      const previousYear = new Date(persons[index - 1].birthDate).getFullYear();
      if (personYear - previousYear < currentYearRange) {
        currentGeneration.push(person);
      } else {
        generations.push([...currentGeneration]);
        currentGeneration = [person];
        currentYearRange = 30;
      }
    }
  });
  if (currentGeneration.length > 0) {
    generations.push(currentGeneration);
  }

  // Tworzymy relacje rodzinne między pokoleniami
  for (let i = 0; i < generations.length - 1; i++) {
    const parentsGeneration = generations[i];
    const childrenGeneration = generations[i + 1];
    const familySize = Math.floor(childrenGeneration.length / (parentsGeneration.length / 2));
    let childIndex = 0;

    for (let j = 0; j < parentsGeneration.length; j += 2) {
      if (j + 1 >= parentsGeneration.length) break;
      const father = parentsGeneration[j];
      const mother = parentsGeneration[j + 1];

      // Ustanawianie małżeństwa dla pary mężczyzna / kobieta
      if (father.gender === 'male' && mother.gender === 'female') {
        const fatherBirthYear = new Date(father.birthDate).getFullYear();
        const motherBirthYear = new Date(mother.birthDate).getFullYear();
        const minWeddingYear = Math.max(fatherBirthYear + 18, motherBirthYear + 18);
        const maxWeddingYear = fatherBirthYear + 40;
        const weddingDate = faker.date.between({
          from: new Date(minWeddingYear, 0, 1),
          to: new Date(maxWeddingYear, 0, 1)
        });
        
        father.spouses.push({
          personId: mother._id,
          weddingDate: weddingDate.toISOString()
        });
        mother.spouses.push({
          personId: father._id,
          weddingDate: weddingDate.toISOString()
        });
      }

      // Przypisywanie dzieci do rodziców
      const familyChildren = childrenGeneration.slice(childIndex, childIndex + familySize);
      childIndex += familySize;

      familyChildren.forEach(child => {
        child.parents.push(father._id, mother._id);
        father.children.push(child._id);
        mother.children.push(child._id);
        familyChildren.forEach(sibling => {
          if (sibling._id.toString() !== child._id.toString() &&
              !child.siblings.includes(sibling._id)) {
            child.siblings.push(sibling._id);
          }
        });
      });
    }
  }

  console.log(persons);
  

  return persons;
};

// Główna funkcja tworząca użytkownika z drzewem genealogicznym – w dwóch krokach:
// 1. Tworzymy osoby i zapisujemy je do bazy w polu user.persons.
// 2. Pobieramy dane, tworzymy relacje rodzinne i zapisujemy ponownie zaktualizowane dane.
export const createUserWithFamilyTree = async (email: string, password: string) => {
  try {
    const user = await User.findOne({ email: "arturcynk02@gmail.com" });

if (!user) {
  console.log(`Użytkownik nie został znaleziony`);
  return;
}

user.persons.forEach((person: any) => {
    const isMale = person.gender === 'male';
    person.firstName = isMale
      ? faker.person.firstName('male') || 'Unknown'
      : faker.person.firstName('female') || 'Unknown';
    person.lastName = faker.person.lastName(isMale ? 'male' : 'female') || 'Unknown';
    person.maidenName = isMale ? undefined : faker.person.lastName('female');
  });
  

await user.save();
console.log(`Krok 2: Zaktualizowano dane użytkownika ${user.email} z utworzonymi relacjami rodzinnymi`);

    return user;
  } catch (error) {
    console.error('Błąd podczas tworzenia użytkownika z drzewem genealogicznym:', error);
    throw error;
  }
};
