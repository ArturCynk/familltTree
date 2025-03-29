export interface Person {
    id: string;
    firstName: string;
    lastName: string;
    maidenName?: string;
    birthDate?: string;
    deathDate?: string;
    location?: string;
    gender: 'male' | 'female' | 'not-binary';
    parents: { id: string; firstName?: string; lastName?: string }[];
    siblings: { id: string; firstName?: string; lastName?: string }[];
    spouses: { id: string; firstName?: string; lastName?: string }[];
    children: { id: string; firstName?: string; lastName?: string }[];
    Dzieci: { id: string; firstName?: string; lastName?: string }[];
    Rodzeństwo: { id: string; firstName?: string; lastName?: string }[];
    Małżonkowie: { id: string; firstName?: string; lastName?: string }[];
    Rodzice: { id: string; firstName?: string; lastName?: string }[];
  }
