import mongoose, { Document, Schema } from 'mongoose';

export enum ChangeAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  RESTORE = 'restore',
  ADD_RELATION = 'add_relation',
  REMOVE_RELATION = 'remove_relation'
}

export enum EntityType {
  PERSON = 'Person'
}

export interface IChangeLog extends Document {
  userId: mongoose.Types.ObjectId;
  entityId: mongoose.Types.ObjectId;
  entityType: EntityType;
  action: ChangeAction;
  timestamp: Date;
  snapshot: any;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  relatedEntities?: {
    entityType: EntityType;
    entityId: mongoose.Types.ObjectId;
  }[];
}

const ChangeLogSchema = new Schema<IChangeLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  entityId: { type: Schema.Types.ObjectId, required: true },
  entityType: { type: String, enum: Object.values(EntityType), required: true },
  action: { type: String, enum: Object.values(ChangeAction), required: true },
  timestamp: { type: Date, default: Date.now },
  snapshot: { type: Schema.Types.Mixed, required: true },
  changes: [{
    field: String,
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed
  }],
  relatedEntities: [{
    entityType: { type: String, enum: Object.values(EntityType) },
    entityId: { type: Schema.Types.ObjectId }
  }]
});

export default mongoose.model<IChangeLog>('ChangeLog', ChangeLogSchema);