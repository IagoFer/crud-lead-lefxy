import { Module } from '@nestjs/common';
import { AiSummaryService } from './ai-summary.service';
import { AiSummaryController } from './ai-summary.controller';
import { LeadsModule } from '../leads/leads.module';
import { InteractionsModule } from '../interactions/interactions.module';

@Module({
  imports: [LeadsModule, InteractionsModule],
  controllers: [AiSummaryController],
  providers: [AiSummaryService],
})
export class AiSummaryModule {}
