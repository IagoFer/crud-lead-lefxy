import { Controller, Post, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AiSummaryService } from './ai-summary.service';
import { LeadsService } from '../leads/leads.service';
import { InteractionsService } from '../interactions/interactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-objectid.pipe';

@ApiTags('IA Summary')
@ApiBearerAuth()
@Controller('leads/:id/ai-summary')
@UseGuards(JwtAuthGuard)
export class AiSummaryController {
  constructor(
    private readonly aiSummaryService: AiSummaryService,
    private readonly leadsService: LeadsService,
    private readonly interactionsService: InteractionsService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Gera um novo resumo de IA para um lead' })
  @ApiParam({ name: 'id', description: 'ID do Lead' })
  @ApiResponse({ status: 201, description: 'Resumo gerado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Lead não encontrado.' })
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
