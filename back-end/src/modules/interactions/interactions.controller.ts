import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-objectid.pipe';

@ApiTags('Interações')
@ApiBearerAuth()
@Controller('leads/:leadId/interactions')
@UseGuards(JwtAuthGuard)
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar uma nova interação (chamada, e-mail, nota) para um lead' })
  @ApiParam({ name: 'leadId', description: 'ID do Lead' })
  @ApiResponse({ status: 201, description: 'Interação registrada com sucesso.' })
  create(
    @Param('leadId', ParseObjectIdPipe) leadId: string,
    @Body() createInteractionDto: CreateInteractionDto,
  ) {
    return this.interactionsService.create(leadId, createInteractionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as interações de um lead específico' })
  @ApiParam({ name: 'leadId', description: 'ID do Lead' })
  @ApiResponse({ status: 200, description: 'Lista de interações retornada.' })
  findByLeadId(@Param('leadId', ParseObjectIdPipe) leadId: string) {
    return this.interactionsService.findByLeadId(leadId);
  }
}
