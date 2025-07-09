import User from "../models/User";
import { AsyncParser } from '@json2csv/node';
import * as XLSX from 'xlsx';

const allAvailableFields = [
  'personId',
  'gender',
  'firstName',
  'middleName',
  'lastName',
  'maidenName',
  'birthDateType',
  'birthDate',
  'birthDateFrom',
  'birthDateTo',
  'birthDateFreeText',
  'birthPlace',
  'status',
  'deathDateType',
  'deathDate',
  'deathDateFrom',
  'deathDateTo',
  'deathDateFreeText',
  'deathPlace',
  'burialPlace',
  'photo',
  'parents',
  'siblings',
  'spouses',
  'children'
];

export class DataTransferService {
  // JSON
  static async exportJson(userEmail: string, selectedFields?: string[],filters: any = {}): Promise<any[]> {
    const user = await User.findOne({ email: userEmail }).populate('persons').lean();
    if (!user) throw new Error('User not found');
    let persons = user.persons;
    if (!persons || persons.length === 0) throw new Error('No persons found for this user');

     persons = this.applyFilters(persons, filters);

    if (selectedFields) {
      this.validateFields(selectedFields);
    }

    const fields = selectedFields?.length ? selectedFields : allAvailableFields;

    const result = persons.map((person: any) => {
      const mapped: any = {};
      for (const field of fields) {
        if (field === 'personId') mapped[field] = person._id?.toString() || '';
        else if (['parents', 'siblings', 'children'].includes(field)) mapped[field] = person[field]?.join(',') || '';
        else if (field === 'spouses') {
          mapped[field] = person.spouses?.map((s:any) => ({
            personId: s.personId, 
            weddingDate: s.weddingDate
          }));
        } else {
          mapped[field] = person[field];
        }
      }
      return mapped;
    });

    return result;
  }

  // EXCEL
  static async exportExel(userEmail: string, selectedFields?: string[],filters: any = {}): Promise<Buffer> {
    const user = await User.findOne({ email: userEmail }).populate('persons');
    if (!user) throw new Error('User not found');
    let persons = user.persons;
    if (!persons || persons.length === 0) throw new Error('No persons found');

     persons = this.applyFilters(persons, filters);


    if (selectedFields) {
  this.validateFields(selectedFields);
}

    const fields = selectedFields?.length ? selectedFields : allAvailableFields;

    const data = persons.map((person: any) => {
      const mapped: any = {};
      for (const field of fields) {
        if (field === 'personId') mapped[field] = person._id?.toString() || '';
        else if (['parents', 'siblings', 'children'].includes(field)) mapped[field] = person[field]?.join(',') || '';
        else if (field === 'spouses') {
          mapped[field] = person.spouses?.map((s:any) => ({
            personId: s.personId, 
            weddingDate: s.weddingDate
          }));
        } else {
          mapped[field] = person[field];
        }
      }
      return mapped;
    });

const worksheet = XLSX.utils.json_to_sheet(data, {
  cellDates: true, // Automatyczna konwersja dat
  dateNF: 'yyyy-mm-dd' // Format daty
});
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Persons');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  // CSV
  static async exportCsv(userEmail: string, selectedFields?: string[],filters: any = {}): Promise<string> {
    const user = await User.findOne({ email: userEmail }).populate('persons');
    if (!user) throw new Error('User not found');
    let persons = user.persons;
    if (!persons || persons.length === 0) throw new Error('No persons found');

    persons = this.applyFilters(persons, filters);

    if (selectedFields) {
  this.validateFields(selectedFields);
}

    const fields = selectedFields?.length ? selectedFields : allAvailableFields;

    const data = persons.map((person: any) => {
      const mapped: any = {};
      for (const field of fields) {
        if (field === 'personId') mapped[field] = person._id?.toString() || '';
        else if (['parents', 'siblings', 'children'].includes(field)) mapped[field] = person[field]?.join(',') || '';
        else if (field === 'spouses') {
          mapped[field] = person.spouses?.map((s:any) => ({
            personId: s.personId, 
            weddingDate: s.weddingDate
          }));
        } else {
          mapped[field] = person[field];
        }
      }
      return mapped;
    });

    const parser = new AsyncParser({ fields: selectedFields || allAvailableFields });
    return parser.parse(data).promise();
  }

  static validateFields(selectedFields: string[]): void {
  const invalidFields = selectedFields.filter(field => 
    !allAvailableFields.includes(field)
  );
  
  if (invalidFields.length > 0) {
    throw new Error(`Invalid fields selected: ${invalidFields.join(', ')}`);
  }
}


  private static applyFilters(persons: any[], filters: any): any[] {
    return persons.filter(person => {
      // Gender filter
      if (filters.gender) {
        if (person.gender !== filters.gender) return false;
      }

      // Life status filter
      if (filters.status) {
        const hasDeathDate = person.deathDate != null && person.deathDate !== '';
        if (filters.status === 'alive' && hasDeathDate) return false;
        if (filters.status === 'deceased' && !hasDeathDate) return false;
      }

      // Birth date filters
      if (filters.bornBefore && !this.isDateBefore(person.birthDate, filters.bornBefore)) return false;
      if (filters.bornAfter && !this.isDateAfter(person.birthDate, filters.bornAfter)) return false;

      // Death date filters
      if (filters.diedBefore && !this.isDateBefore(person.deathDate, filters.diedBefore)) return false;
      if (filters.diedAfter && !this.isDateAfter(person.deathDate, filters.diedAfter)) return false;

      // Nowe filtry relacyjne
    if (filters.hasSpouse) {
      const hasSpouse = person.spouses && person.spouses.length > 0;
      if (filters.hasSpouse === 'true' && !hasSpouse) return false;
      if (filters.hasSpouse === 'false' && hasSpouse) return false;
    }

    if (filters.hasChildren) {
      const hasChildren = person.children && person.children.length > 0;
      if (filters.hasChildren === 'true' && !hasChildren) return false;
      if (filters.hasChildren === 'false' && hasChildren) return false;
    }

    if (filters.hasSiblings) {
      const hasSiblings = person.siblings && person.siblings.length > 0;
      if (filters.hasSiblings === 'true' && !hasSiblings) return false;
      if (filters.hasSiblings === 'false' && hasSiblings) return false;
    }

    if (filters.birthPlace) {
      const birthPlace = person.birthPlace?.toLowerCase() || '';
      if (!birthPlace.includes(filters.birthPlace.toLowerCase())) {
        return false;
      }
    }

    if (filters.deathPlace) {
      const deathPlace = person.deathPlace?.toLowerCase() || '';
      if (!deathPlace.includes(filters.deathPlace.toLowerCase())) {
        return false;
      }
    }

    if (filters.burialPlace) {
      const burialPlace = person.burialPlace?.toLowerCase() || '';
      if (!burialPlace.includes(filters.burialPlace.toLowerCase())) {
        return false;
      }
    }

      return true;
    });
  }

private static isDateBefore(date: string | null | undefined, reference: string): boolean {
  if (!date) return false;
  return new Date(date) < new Date(reference);
}

private static isDateAfter(date: string | null | undefined, reference: string): boolean {
  if (!date) return false;
  return new Date(date) > new Date(reference);
}

}
