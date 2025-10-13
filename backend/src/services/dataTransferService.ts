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
private static formatRelations(
    ids: any[],
    personMap: Map<string, string>,
    relationFormat: string = 'name'
  ): string {
    if (relationFormat === 'id') {
      return ids.map(id => id?.toString()).filter(Boolean).join(', ');
    }
    // Default to name format
    return ids
      .map(id => personMap.get(id?.toString()))
      .filter(Boolean)
      .join(', ');
  }

  // JSON export
  static async exportJson(
    userEmail: string, 
    selectedFields?: string[],
    filters: any = {}
  ): Promise<any[]> {
    const user = await User.findOne({ email: userEmail }).populate('persons');
    if (!user) throw new Error('User not found');
    let persons = user.persons;
    if (!persons || persons.length === 0) throw new Error('No persons found for this user');

    persons = this.applyFilters(persons, filters);
    if (selectedFields) this.validateFields(selectedFields);
    
    const fields = selectedFields?.length ? selectedFields : allAvailableFields;
    const personMap = this.buildPersonMap(persons);
    const relationFormat = filters.relationFormat || 'name'; // Default to name

    return persons.map((person: any) => {
      const mapped: any = {};
      for (const field of fields) {
        if (field === 'personId') {
          mapped[field] = person._id.toString();
        }
        else if (field === 'parents') {
          mapped[field] = this.formatRelations(
            person.parents || [], 
            personMap, 
            relationFormat
          );
        }
        else if (field === 'siblings') {
          mapped[field] = this.formatRelations(
            person.siblings || [], 
            personMap, 
            relationFormat
          );
        }
        else if (field === 'children') {
          mapped[field] = this.formatRelations(
            person.children || [], 
            personMap, 
            relationFormat
          );
        }
        else if (field === 'spouses') {
          const spouseIds = (person.spouses || []).map((s: any) => s.personId);
          mapped[field] = this.formatRelations(
            spouseIds, 
            personMap, 
            relationFormat
          );
        }
        else {
          mapped[field] = person[field];
        }
      }
      return mapped;
    });
  }

  // Excel export
  static async exportExel(
    userEmail: string, 
    selectedFields?: string[],
    filters: any = {}
  ): Promise<Buffer> {
    const user = await User.findOne({ email: userEmail }).populate('persons');
    if (!user) throw new Error('User not found');
    let persons = user.persons;
    if (!persons || persons.length === 0) throw new Error('No persons found');

    persons = this.applyFilters(persons, filters);
    if (selectedFields) this.validateFields(selectedFields);
    
    const fields = selectedFields?.length ? selectedFields : allAvailableFields;
    const personMap = this.buildPersonMap(persons);
    const relationFormat = filters.relationFormat || 'name'; // Default to name

    const data = persons.map((person: any) => {
      const mapped: any = {};
      for (const field of fields) {
        if (field === 'personId') {
          mapped[field] = person._id?.toString() || '';
        }
        else if (field === 'parents') {
          mapped[field] = this.formatRelations(
            person.parents || [], 
            personMap, 
            relationFormat
          );
        }
        else if (field === 'siblings') {
          mapped[field] = this.formatRelations(
            person.siblings || [], 
            personMap, 
            relationFormat
          );
        }
        else if (field === 'children') {
          mapped[field] = this.formatRelations(
            person.children || [], 
            personMap, 
            relationFormat
          );
        }
        else if (field === 'spouses') {
          const spouseIds = (person.spouses || []).map((s: any) => s.personId);
          mapped[field] = this.formatRelations(
            spouseIds, 
            personMap, 
            relationFormat
          );
        }
        else {
          mapped[field] = person[field];
        }
      }
      return mapped;
    });

    const worksheet = XLSX.utils.json_to_sheet(data, {
      cellDates: true,
      dateNF: 'yyyy-mm-dd'
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Persons');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // CSV export
  static async exportCsv(
    userEmail: string, 
    selectedFields?: string[],
    filters: any = {}
  ): Promise<string> {
    const user = await User.findOne({ email: userEmail }).populate('persons');
    if (!user) throw new Error('User not found');
    let persons = user.persons;
    if (!persons || persons.length === 0) throw new Error('No persons found');

    persons = this.applyFilters(persons, filters);
    if (selectedFields) this.validateFields(selectedFields);
    
    const fields = selectedFields?.length ? selectedFields : allAvailableFields;
    const personMap = this.buildPersonMap(persons);
    const relationFormat = filters.relationFormat || 'name'; // Default to name

    const data = persons.map((person: any) => {
      const mapped: any = {};
      for (const field of fields) {
        if (field === 'personId') {
          mapped[field] = person._id?.toString() || '';
        }
        else if (field === 'parents') {
          mapped[field] = this.formatRelations(
            person.parents || [], 
            personMap, 
            relationFormat
          );
        }
        else if (field === 'siblings') {
          mapped[field] = this.formatRelations(
            person.siblings || [], 
            personMap, 
            relationFormat
          );
        }
        else if (field === 'children') {
          mapped[field] = this.formatRelations(
            person.children || [], 
            personMap, 
            relationFormat
          );
        }
        else if (field === 'spouses') {
          const spouseIds = (person.spouses || []).map((s: any) => s.personId);
          mapped[field] = this.formatRelations(
            spouseIds, 
            personMap, 
            relationFormat
          );
        }
        else {
          mapped[field] = person[field];
        }
      }
      return mapped;
    });

    const parser = new AsyncParser({ fields });
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

private static buildPersonMap(persons: any[]): Map<string, string> {
  const map = new Map<string, string>();
  persons.forEach(person => {
    const fullName = `${person.firstName || ''} ${person.lastName || ''}`.trim();
    if (fullName) {
      map.set(person._id.toString(), fullName);
    }
  });
  return map;
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
