import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Interaction, InteractionDocument, InteractionType } from './schemas/interaction.schema';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { LeadsService } from '../leads/leads.service';
import { FollowUpsService } from '../followups/followups.service';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectModel(Interaction.name) private readonly interactionModel: Model<InteractionDocument>,
    private readonly leadsService: LeadsService,
    private readonly followUpsService: FollowUpsService,
  ) {}

  async create(leadId: string, createInteractionDto: CreateInteractionDto): Promise<InteractionDocument> {
    // Valida que o lead existe e não foi deletado
    await this.leadsService.findById(leadId);

    const interaction = new this.interactionModel({
      ...createInteractionDto,
      leadId: new Types.ObjectId(leadId),
    });

    const saved = await interaction.save();

    // Automação: se for MESSAGE, cria follow-up automático
    if (createInteractionDto.type === InteractionType.MESSAGE) {
      await this.followUpsService.createFromInteraction(leadId, saved._id.toString());
    }

    return saved;
  }

  async findByLeadId(leadId: string, page: number = 1, limit: number = 20) {
    // Valida que o lead existe
    await this.leadsService.findById(leadId);

    const filter = { leadId: new Types.ObjectId(leadId) };
    const [data, total] = await Promise.all([
      this.interactionModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.interactionModel.countDocuments(filter).exec()
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

  async findLastByLeadId(leadId: string, limit: number = 10): Promise<InteractionDocument[]> {
    return this.interactionModel
      .find({ leadId: new Types.ObjectId(leadId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
