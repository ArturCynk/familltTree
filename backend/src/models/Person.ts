import mongoose, { Document, Schema } from 'mongoose';

// Definiowanie interfejsu
interface IPerson extends Document {
  gender: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  maidenName?: string;
  birthDateType?: 'exact' | 'before' | 'after' | 'around' | 'probably' | 'between' | 'fromTo';
  birthDate?: Date;
  birthDateEnd?: Date;
  deathDateType?: 'exact' | 'before' | 'after' | 'around' | 'probably' | 'between' | 'fromTo';
  deathDate?: Date;
  deathDateEnd?: Date;
}

// Definiowanie schematu
const PersonSchema: Schema = new Schema({
  gender: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
  },
  lastName: {
    type: String,
    required: true,
  },
  maidenName: {
    type: String,
  },
  birthDateType: {
    type: String,
    enum: ['exact', 'before', 'after', 'around', 'probably', 'between', 'fromTo'],
  },
  birthDate: {
    type: Date,
  },
  birthDateEnd: {
    type: Date,
  },
  deathDateType: {
    type: String,
    enum: ['exact', 'before', 'after', 'around', 'probably', 'between', 'fromTo'],
  },
  deathDate: {
    type: Date,
  },
  deathDateEnd: {
    type: Date,
  },
}, {
  timestamps: true, // Dodaje pola createdAt i updatedAt
  collection: 'persons',
});

// Tworzenie modelu
const Person = mongoose.model<IPerson>('Person', PersonSchema);

export default Person;
