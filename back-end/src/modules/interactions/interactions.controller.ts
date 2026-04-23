import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-objectid.pipe';

@Controller('leads/:leadId/interactions')
@UseGuards(JwtAuthGuard)
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('leadId', ParseObjectIdPipe) leadId: string,
    @Body() createInteractionDto: CreateInteractionDto,
  ) {
    return this.interactionsService.create(leadId, createInteractionDto);
  }

  @Get()
  findByLeadId(
    @Param('leadId', ParseObjectIdPipe) leadId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    return this.interactionsService.findByLeadId(leadId, parseInt(page, 10), parseInt(limit, 10));
  }
}
