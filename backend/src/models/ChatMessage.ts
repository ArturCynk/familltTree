// models/ChatMessage.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IReaction {
  user: mongoose.Types.ObjectId;
  emoji: string;
  createdAt: Date;
}

export interface IEditHistory {
  previousMessage: string;
  editedAt: Date;
}

export interface IChatMessage extends Document {
  familyTree: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  message: string;
  type: 'text' | 'system' | 'notification';
  replyTo?: mongoose.Types.ObjectId;
  readBy: mongoose.Types.ObjectId[];
  reactions: IReaction[];
  edited: boolean;
  editHistory: IEditHistory[];
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema: Schema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  emoji: { 
    type: String, 
    required: true,
    maxlength: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const EditHistorySchema: Schema = new Schema({
  previousMessage: {
    type: String,
    required: true
  },
  editedAt: {
    type: Date,
    default: Date.now
  }
});

const ChatMessageSchema: Schema = new Schema({
  familyTree: { 
    type: Schema.Types.ObjectId, 
    ref: 'FamilyTree', 
    required: true 
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['text', 'system', 'notification'],
    default: 'text'
  },
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'ChatMessage'
  },
  readBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  reactions: [ReactionSchema],
  edited: {
    type: Boolean,
    default: false
  },
  editHistory: [EditHistorySchema],
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Index dla lepszej wydajności
ChatMessageSchema.index({ familyTree: 1, createdAt: -1 });
ChatMessageSchema.index({ 'reactions.user': 1 });

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);