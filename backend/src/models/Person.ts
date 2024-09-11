import mongoose, { Document, Schema } from 'mongoose';

export interface IPerson extends Document {
  _id: mongoose.Types.ObjectId; // Typ _id jako ObjectId
  gender: 'male' | 'female' | 'non-binary';
  firstName: string;
  middleName?: string;
  lastName: string;
  maidenName?: string;
  birthDateType?: 'exact' | 'before' | 'after' | 'around' | 'probably' | 'between' | 'fromTo';
  birthDate?: Date;
  birthDateFrom?: Date;
  birthDateTo?: Date;
  birthPlace?: string;
  status: 'alive' | 'deceased';
  deathDate?: Date;
  deathDateType?: 'exact' | 'before' | 'after' | 'around' | 'probably' | 'between' | 'fromTo';
  deathDateFrom?: Date;
  deathDateTo?: Date;
  relationships: {
    person: mongoose.Types.ObjectId; // Typ relacji jako ObjectId
    type: string;
  }[];
}

const PersonSchema: Schema = new Schema({
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
    enum: ['exact', 'before', 'after', 'around', 'probably', 'between', 'fromTo'],
  },
  birthDate: {
    type: Date,
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
  deathDate: {
    type: Date,
  },
  deathDateType: {
    type: String,
    enum: ['exact', 'before', 'after', 'around', 'probably', 'between', 'fromTo'],
  },
  deathDateFrom: {
    type: Date,
  },
  deathDateTo: {
    type: Date,
  },
  relationships: [{
    person: { type: Schema.Types.ObjectId, ref: 'Person' },
    type: { type: String, required: true },
  }],
});

export default mongoose.model<IPerson>('Person', PersonSchema);
