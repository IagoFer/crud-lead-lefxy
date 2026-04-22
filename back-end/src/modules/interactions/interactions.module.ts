import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Interaction, InteractionSchema } from './schemas/interaction.schema';
import { InteractionsService } from './interactions.service';
import { InteractionsController } from './interactions.controller';
import { LeadsModule } from '../leads/leads.module';
import { FollowUpsModule } from '../followups/followups.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Interaction.name, schema: InteractionSchema }]),
    LeadsModule,
    FollowUpsModule,
  ],
  controllers: [InteractionsController],
  providers: [InteractionsService],
  exports: [InteractionsService],
})
export class InteractionsModule {}
