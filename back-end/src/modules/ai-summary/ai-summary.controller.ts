import { Controller, Post, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiSummaryService } from './ai-summary.service';
import { LeadsService } from '../leads/leads.service';
import { InteractionsService } from '../interactions/interactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-objectid.pipe';

@Controller('leads/:id/ai-summary')
@UseGuards(JwtAuthGuard)
export class AiSummaryController {
  constructor(
    private readonly aiSummaryService: AiSummaryService,
    private readonly leadsService: LeadsService,
    private readonly interactionsService: InteractionsService,
  ) { }

  @Post()
  @Throttle({ default: { limit: 1, ttl: 60000 } }) // Max 1 summaries per minute per IP
  async generateSummary(@Param('id', ParseObjectIdPipe) id: string) {
    const lead = await this.leadsService.findById(id);
    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    // Busca as últimas 10 interações
    const interactions = await this.interactionsService.findLastByLeadId(id, 10);

    const summary = await this.aiSummaryService.generateSummary(lead, interactions);

    return {
      summary,
    };
  }
}
