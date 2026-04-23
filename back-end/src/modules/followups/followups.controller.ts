import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FollowUpsService } from './followups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-objectid.pipe';

@ApiTags('Follow-ups')
@ApiBearerAuth()
@Controller('followups')
@UseGuards(JwtAuthGuard)
export class FollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Listar follow-ups pendentes com paginação' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '20' })
  @ApiResponse({ status: 200, description: 'Lista de follow-ups pendentes retornada.' })
  findPending(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    return this.followUpsService.findPending(parseInt(page, 10), parseInt(limit, 10));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Marcar um follow-up como concluído' })
  @ApiParam({ name: 'id', description: 'ID do Follow-up' })
  @ApiResponse({ status: 200, description: 'Follow-up atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Apenas status COMPLETED é aceito.' })
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() body: any) {
    if (body.status === 'COMPLETED') {
      return this.followUpsService.complete(id);
    }
    throw new BadRequestException('Apenas status COMPLETED é suportado via PATCH neste momento.');
  }
}
