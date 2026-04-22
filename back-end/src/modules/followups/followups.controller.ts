import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FollowUpsService } from './followups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('followups')
@UseGuards(JwtAuthGuard)
export class FollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @Get('pending')
  findPending() {
    return this.followUpsService.findPending();
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.followUpsService.complete(id);
  }
}
