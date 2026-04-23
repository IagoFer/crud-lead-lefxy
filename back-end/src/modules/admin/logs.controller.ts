import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Admin / Logs')
@ApiBearerAuth()
@Controller('admin/logs')
@UseGuards(JwtAuthGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar logs de erro do sistema (Auditoria)' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '20' })
  @ApiResponse({ status: 200, description: 'Lista de logs retornada.' })
  getLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    return this.logsService.getLogs(parseInt(page, 10), parseInt(limit, 10));
  }
}
