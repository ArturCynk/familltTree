export interface Person {
    id: string;
  gender: 'male' | 'female' | 'not-binary';
  firstName: string;
  middleName?: string;
  lastName: string;
  maidenName?: string;
  birthDateType: 'exact' | 'before' | 'after' | 'around' | 'probably' | 'between' | 'fromTo' | 'freeText';
  birthDate?: string;
  birthDateFrom?: string;
  birthDateTo?: string;
  birthPlace?: string;
  status: 'alive' | 'deceased';
  deathDateType?: 'exact' | 'before' | 'after' | 'around' | 'probably' | 'between' | 'fromTo' | 'freeText';
  deathDate?: string;
  deathDateFrom?: string;
  deathDateTo?: string;
  burialPlace?: string;
  birthDateFreeText?: string;
  deathDateFreeText?: string;
    parents: { id: string; firstName?: string; lastName?: string }[];
    siblings: { id: string; firstName?: string; lastName?: string }[];
    spouses: { id: string; firstName?: string; lastName?: string }[];
    children: { id: string; firstName?: string; lastName?: string }[];
    Dzieci: { id: string; firstName?: string; lastName?: string }[];
    Rodzeństwo: { id: string; firstName?: string; lastName?: string }[];
    Małżonkowie: { id: string; firstName?: string; lastName?: string }[];
    Rodzice: { id: string; firstName?: string; lastName?: string }[];

  }
