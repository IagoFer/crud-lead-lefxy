import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/logs')
@UseGuards(JwtAuthGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async getLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50'
  ) {
    return this.logsService.getLogs(parseInt(page), parseInt(limit));
  }
}
