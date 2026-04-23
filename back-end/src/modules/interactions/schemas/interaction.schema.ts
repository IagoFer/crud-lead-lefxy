import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InteractionDocument = HydratedDocument<Interaction>;

export enum InteractionType {
  MESSAGE = 'MESSAGE',
  CALL = 'CALL',
  NOTE = 'NOTE',
}

@Schema({ timestamps: true })
export class Interaction {
  @Prop({ type: Types.ObjectId, ref: 'Lead', required: true, index: true })
  leadId: Types.ObjectId;

  @Prop({ required: true, enum: InteractionType })
  type: InteractionType;

  @Prop({ required: true, enum: ['LEAD', 'USER'], default: 'USER' })
  from: string;

  @Prop({ required: true, trim: true })
  content: string;

  createdAt: Date;
  updatedAt: Date;
}

export const InteractionSchema = SchemaFactory.createForClass(Interaction);

InteractionSchema.index({ leadId: 1, createdAt: -1 });
