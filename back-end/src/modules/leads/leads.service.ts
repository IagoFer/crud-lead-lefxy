import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Lead, LeadDocument } from './schemas/lead.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { FilterLeadDto } from './dto/filter-lead.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class LeadsService {
  private readonly CACHE_PREFIX = 'leads:';

  constructor(
    @InjectModel(Lead.name) private readonly leadModel: Model<LeadDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<LeadDocument> {
    const lead = new this.leadModel(createLeadDto);
    const saved = await lead.save();
    await this.invalidateCache();
    return saved;
  }

  async findAll(filterDto: FilterLeadDto): Promise<PaginatedResult<LeadDocument>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', stage, channel, q } = filterDto;

    const cacheKey = this.buildCacheKey(filterDto);
    const cached = await this.cacheManager.get<PaginatedResult<LeadDocument>>(cacheKey);
    if (cached) {
      return cached;
    }

    const filter: Record<string, unknown> = { deletedAt: null };

    if (stage) {
      filter.stage = stage;
    }

    if (channel) {
      filter.channel = channel;
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ];
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      this.leadModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.leadModel.countDocuments(filter).exec(),
    ]);

    const result: PaginatedResult<LeadDocument> = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    await this.cacheManager.set(cacheKey, result, 60000);

    return result;
  }

  async findById(id: string): Promise<LeadDocument> {
    const lead = await this.leadModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!lead) {
      throw new NotFoundException(`Lead com ID "${id}" não encontrado`);
    }
    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto): Promise<LeadDocument> {
    const lead = await this.leadModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { $set: updateLeadDto },
        { new: true },
      )
      .exec();

    if (!lead) {
      throw new NotFoundException(`Lead com ID "${id}" não encontrado`);
    }

    await this.invalidateCache();
    return lead;
  }

  async softDelete(id: string): Promise<LeadDocument> {
    const lead = await this.leadModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { $set: { deletedAt: new Date() } },
        { new: true },
      )
      .exec();

    if (!lead) {
      throw new NotFoundException(`Lead com ID "${id}" não encontrado`);
    }

    await this.invalidateCache();
    return lead;
  }

  private buildCacheKey(filterDto: FilterLeadDto): string {
    const { page, limit, sortBy, sortOrder, stage, channel, q } = filterDto;
    return `${this.CACHE_PREFIX}${stage || 'all'}:${channel || 'all'}:${q || ''}:${page}:${limit}:${sortBy}:${sortOrder}`;
  }

  private async invalidateCache(): Promise<void> {
    try {
      // Tenta limpar keys com prefixo de leads
      const stores = this.cacheManager.stores;
      if (stores && stores.length > 0) {
        await stores[0].clear();
      }
    } catch {
      // Fallback silencioso — cache expira naturalmente pelo TTL
    }
  }
}
