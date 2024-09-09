import mongoose, { Document, Schema } from 'mongoose';

// Interface for the Person document
export interface IPerson extends Document {
  gender: 'male' | 'female' | 'non-binary';
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

// Definition of the Person schema
const PersonSchema: Schema = new Schema({
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary'], // Enum definition for gender
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
});

export default mongoose.model<IPerson>('Person', PersonSchema);
