import {
  Controller,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { FollowUpsService } from './followups.service';

@Controller('followups')
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
