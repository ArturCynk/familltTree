import mongoose, { Document, Schema } from 'mongoose';
import { IPerson, PersonSchema } from './Person';

// Najpierw poprawiamy typ członka drzewa:
export interface IMember {
  _id?: mongoose.Types.ObjectId; // MongoDB doda _id automatycznie
  user: mongoose.Types.ObjectId;
  role: 'admin' | 'editor' | 'guest';
}

// Następnie poprawiamy główny interfejs:
export interface IFamilyTree extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  persons: IPerson[];
  members: IMember[]; // <-- poprawione members
}

// I teraz schemat mongoose:
const FamilyTreeSchema: Schema = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  persons: [PersonSchema],
  members: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      role: { 
        type: String, 
        enum: ['admin', 'editor', 'guest'],
        required: true 
      }
    }
  ]
}, { timestamps: true });

// Eksport modelu:
export default mongoose.model<IFamilyTree>('FamilyTree', FamilyTreeSchema);
