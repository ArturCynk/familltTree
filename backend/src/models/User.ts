import mongoose, { Document, Schema, Types } from 'mongoose';
import { PersonSchema, IPerson } from './Person';

// Dodajemy enum dla typu konta
export enum AccountType {
  PRIVATE = 'private',
  PUBLIC = 'public'
}

export interface UserDocument extends Document {
  email: string;
  password: string;
  isActive: boolean;
  accountType: AccountType; // Nowe pole typu konta
  activationToken?: string;
  resetPasswordToken?: string;
  createdAt: Date;
  updatedAt: Date;
  persons: IPerson[];
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'app' | 'email' | 'sms';
  twoFactorSecret?: string;
  twoFactorPhone?: string;
  backupCodes?: {
    code: string;
    used: boolean;
  }[];
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
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    accountType: {
      type: String,
      enum: {
        values: Object.values(AccountType),
        message: 'Invalid account type'
      },
      default: AccountType.PRIVATE
    },
    
    activationToken: String,
    resetPasswordToken: String,
    persons: [PersonSchema],
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorMethod: {
      type: String,
      enum: ['app', 'email', 'sms'],
    },
    twoFactorSecret: String,
    twoFactorPhone: String,
    backupCodes: [
      {
        code: String,
        used: {
          type: Boolean,  // Poprawiona definicja
          default: false  // Poprawiona definicja
        }
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: { virtuals: true } // Konfiguracja dla transformacji danych wyjściowych
  }
);

const User = mongoose.model<UserDocument>('User', UserSchema);
export default User;