export interface Person {
    _id: string;
    firstName: string;
    lastName: string;
    maidenName?: string;
    birthDate?: string;
    deathDate?: string;
    location?: string;
    gender: 'male' | 'female' | 'not-binary';
    parents: { _id: string; firstName?: string; lastName?: string }[];
    siblings: { _id: string; firstName?: string; lastName?: string }[];
    spouses: { _id: string; firstName?: string; lastName?: string }[];
    children: { _id: string; firstName?: string; lastName?: string }[];
  }
  