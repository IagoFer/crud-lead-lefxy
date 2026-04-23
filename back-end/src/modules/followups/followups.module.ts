import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { FollowUp, FollowUpSchema } from './schemas/followup.schema';
import { Interaction, InteractionSchema } from '../interactions/schemas/interaction.schema';
import { FollowUpsService } from './followups.service';
import { FollowUpsController } from './followups.controller';
import { FollowUpsProcessor } from './followups.processor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FollowUp.name, schema: FollowUpSchema },
      { name: Interaction.name, schema: InteractionSchema }
    ]),
    BullModule.registerQueue({
      name: 'follow-ups',
    }),
  ],
  controllers: [FollowUpsController],
  providers: [FollowUpsService, FollowUpsProcessor],
  exports: [FollowUpsService],
})
export class FollowUpsModule {}
