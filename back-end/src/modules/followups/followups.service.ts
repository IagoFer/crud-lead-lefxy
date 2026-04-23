import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { FollowUp, FollowUpDocument, FollowUpStatus } from './schemas/followup.schema';
import { Interaction, InteractionDocument } from '../interactions/schemas/interaction.schema';

@Injectable()
export class FollowUpsService {
  constructor(
    @InjectModel(FollowUp.name) private readonly followUpModel: Model<FollowUpDocument>,
    @InjectModel(Interaction.name) private readonly interactionModel: Model<InteractionDocument>,
    @InjectQueue('follow-ups') private followUpsQueue: Queue,
    private configService: ConfigService,
  ) {}

  async createFromInteraction(leadId: string, interactionId: string): Promise<FollowUpDocument> {
    const interaction = await this.interactionModel.findById(interactionId);
    if (!interaction) {
      throw new BadRequestException('Interação não encontrada.');
    }
    if (interaction.leadId.toString() !== leadId) {
      throw new BadRequestException('A interação não pertence ao lead informado. Risco de violação de integridade.');
    }

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

  async findPending(page: number = 1, limit: number = 20) {
    const filter = { status: FollowUpStatus.PENDING };
    
    const [data, total] = await Promise.all([
      this.followUpModel
        .find(filter)
        .populate('leadId', 'name phone stage')
        .sort({ dueAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.followUpModel.countDocuments(filter).exec()
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
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
