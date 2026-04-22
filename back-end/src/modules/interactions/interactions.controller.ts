import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';

@Controller('leads/:leadId/interactions')
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('leadId') leadId: string,
    @Body() createInteractionDto: CreateInteractionDto,
  ) {
    return this.interactionsService.create(leadId, createInteractionDto);
  }

  @Get()
  findByLeadId(@Param('leadId') leadId: string) {
    return this.interactionsService.findByLeadId(leadId);
  }
}
