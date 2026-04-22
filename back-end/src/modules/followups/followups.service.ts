import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { FollowUp, FollowUpDocument, FollowUpStatus } from './schemas/followup.schema';

@Injectable()
export class FollowUpsService {
  constructor(
    @InjectModel(FollowUp.name) private readonly followUpModel: Model<FollowUpDocument>,
    @InjectQueue('follow-ups') private followUpsQueue: Queue,
    private configService: ConfigService,
  ) {}

  async createFromInteraction(leadId: string, interactionId: string): Promise<FollowUpDocument> {
    const delayHours = this.configService.get<number>('followUp.delayHours', 24);
    const dueAt = new Date();
    dueAt.setHours(dueAt.getHours() + delayHours);

    const followUp = new this.followUpModel({
      leadId: new Types.ObjectId(leadId),
      interactionId: new Types.ObjectId(interactionId),
      status: FollowUpStatus.PENDING,
      dueAt,
    });

    const saved = await followUp.save();

    // Schedule job in BullMQ
    const delayMs = delayHours * 60 * 60 * 1000;
    await this.followUpsQueue.add(
      'activate-followup',
      { followUpId: saved._id.toString() },
      { delay: delayMs }
    );

    return saved;
  }

  async findPending(): Promise<FollowUpDocument[]> {
    return this.followUpModel
      .find({ status: FollowUpStatus.PENDING })
      .populate('leadId', 'name phone stage')
      .sort({ dueAt: 1 })
      .exec();
  }

  async complete(id: string): Promise<FollowUpDocument> {
    const followUp = await this.followUpModel.findByIdAndUpdate(
      id,
      {
        $set: {
          status: FollowUpStatus.COMPLETED,
          completedAt: new Date(),
        },
      },
      { new: true }
    ).exec();

    if (!followUp) {
      throw new NotFoundException(`FollowUp com ID "${id}" não encontrado`);
    }

    return followUp;
  }
}
