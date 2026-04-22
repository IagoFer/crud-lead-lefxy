import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FollowUpDocument = HydratedDocument<FollowUp>;

export enum FollowUpStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

@Schema({ timestamps: true })
export class FollowUp {
  @Prop({ type: Types.ObjectId, ref: 'Lead', required: true })
  leadId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Interaction', required: true })
  interactionId: Types.ObjectId;

  @Prop({ required: true, enum: FollowUpStatus, default: FollowUpStatus.PENDING })
  status: FollowUpStatus;

  @Prop({ required: true })
  dueAt: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const FollowUpSchema = SchemaFactory.createForClass(FollowUp);

FollowUpSchema.index({ status: 1, dueAt: 1 });
