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
import { FollowUpsService } from './followups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-objectid.pipe';

@Controller('followups')
@UseGuards(JwtAuthGuard)
export class FollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @Get('pending')
  findPending(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    return this.followUpsService.findPending(parseInt(page, 10), parseInt(limit, 10));
  }

  @Patch(':id')
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() body: any) {
    if (body.status === 'COMPLETED') {
      return this.followUpsService.complete(id);
    }
    throw new BadRequestException('Apenas status COMPLETED é suportado via PATCH neste momento.');
  }
}
