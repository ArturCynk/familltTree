import mongoose, { Document, Schema } from 'mongoose';



export interface IPerson extends Document {
  _id: mongoose.Types.ObjectId;
  gender: 'male' | 'female' | 'non-binary';
  firstName: string;
  middleName?: string;
  lastName: string;
  maidenName?: string;
  birthDateType?: 'exact' | 'before' | 'after' | 'around' | 'probably' | 'between' | 'fromTo' | 'freeText';
  birthDate?: Date;
  birthDateFrom?: Date;
  birthDateTo?: Date;
  birthDateFreeText?: string; // <-- Dodane
  birthPlace?: string;
  status: 'alive' | 'deceased';
  deathDate?: Date ;
  deathDateType?: 'exact' | 'before' | 'after' | 'around' | 'probably' | 'between' | 'fromTo' | 'freeText';
  deathDateFrom?: Date;
  deathDateTo?: Date;
  deathDateFreeText?: string; // <-- Dodane
  deathPlace?: string;
  burialPlace?: string;
  photo?: string;
  parents: mongoose.Types.ObjectId[];
  siblings: mongoose.Types.ObjectId[];
  spouses: { personId: mongoose.Types.ObjectId, weddingDate: Date }[];
  children: mongoose.Types.ObjectId[];
}

export const PersonSchema: Schema = new Schema({
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary'],
    required: [true, 'Gender is required'],
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
  },
  middleName: {
    type: String,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
  },
  maidenName: {
    type: String,
  },
  birthDateType: {
    type: String,
    enum: ['exact', 'before', 'after', 'around', 'probably', 'between', 'fromTo', 'freeText'],
  },
  birthDate: {
    type: Date,
  },
  birthDateFreeText: { // <-- Dodane
    type: String,
  },
  deathDate: {
    type: Date,
  },
  deathDateFreeText: { // <-- Dodane
    type: String,
  },
  birthDateFrom: {
    type: Date,
  },
  birthDateTo: {
    type: Date,
  },
  birthPlace: {
    type: String,
  },
  status: {
    type: String,
    enum: ['alive', 'deceased'],
    required: [true, 'Status is required'],
  },
  deathDateType: {
    type: String,
    enum: ['exact', 'before', 'after', 'around', 'probably', 'between', 'fromTo', 'freeText'],
  },
  deathDateFrom: {
    type: Date,
  },
  deathDateTo: {
    type: Date,
  },
  deathPlace: {
    type: String,
  },
  burialPlace: {
    type: String,
  },
  photo: { // Dodane pole na zdjęcie
    type: String, // Można użyć typu String, jeśli przechowujesz URL do zdjęcia
    required: false, // Można ustawić na false, jeśli zdjęcie nie jest wymagane
  },
  parents: [{ type: Schema.Types.ObjectId, ref: 'Person' }],
  siblings: [{ type: Schema.Types.ObjectId, ref: 'Person' }],
  spouses: [{
    personId: { type: Schema.Types.ObjectId, ref: 'Person' },
    weddingDate: { type: Date }
  }],
  children: [{ type: Schema.Types.ObjectId, ref: 'Person' }],
});

export default mongoose.model<IPerson>('Person', PersonSchema);
