import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LeadDocument = HydratedDocument<Lead>;

export enum Channel {
  WHATSAPP = 'WHATSAPP',
  INSTAGRAM = 'INSTAGRAM',
  SITE = 'SITE',
}

export enum Stage {
  NEW = 'NEW',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  WON = 'WON',
  LOST = 'LOST',
}

@Schema({ timestamps: true })
export class Lead {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, enum: Channel, default: Channel.WHATSAPP })
  channel: Channel;

  @Prop({ required: true, enum: Stage, default: Stage.NEW })
  stage: Stage;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

LeadSchema.index({ name: 1 });
LeadSchema.index({ stage: 1 });
LeadSchema.index({ channel: 1 });
LeadSchema.index({ deletedAt: 1 });
