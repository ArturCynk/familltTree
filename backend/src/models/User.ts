import mongoose, { Document, Schema } from 'mongoose';
import { PersonSchema, IPerson } from './Person';



export interface UserDocument extends Document {
  email: string;
  password: string;
  isActive: boolean;
  activationToken?: string;
  resetPasswordToken?: string;
  createdAt: Date;
  updatedAt: Date;
  persons: IPerson[]; // Array of embedded Person documents
}

const UserSchema: Schema<UserDocument> = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    activationToken: String,
    resetPasswordToken: String,
    persons: [PersonSchema], // Embed the entire Person schema
  },
  {
    versionKey: false,  // Wyłącza wersjonowanie
    timestamps: true    // Dodaje pola `createdAt` i `updatedAt`
  }
);

const User = mongoose.model<UserDocument>('User', UserSchema);
export default User;
