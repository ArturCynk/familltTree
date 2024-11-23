// PersonUtils.tsx
import { Person } from './Types';

export const getDisplayName = (person: Person, showMaidenName: boolean, showHusbandSurname: boolean) => {
  if (showMaidenName) { return person.maidenName ? `${person.firstName} ${person.lastName} (z d. ${person.maidenName})` : `${person.firstName} ${person.lastName}`; }
  if (showHusbandSurname) { return person.maidenName ? `${person.firstName} ${person.maidenName} (${person.lastName})` : `${person.firstName} ${person.lastName}`; }
  return `${person.firstName} ${person.lastName}`;
};

export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Miesiące w Date zaczynają się od 0
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
