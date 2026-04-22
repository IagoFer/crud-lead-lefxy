import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FollowUp, FollowUpDocument } from './schemas/followup.schema';

@Processor('follow-ups')
export class FollowUpsProcessor extends WorkerHost {
  constructor(
    @InjectModel(FollowUp.name) private readonly followUpModel: Model<FollowUpDocument>,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'activate-followup') {
      const { followUpId } = job.data;
      
      // Aqui poderíamos enviar um email, notificação socket, etc.
      // Hoje apenas logamos pois a listagem de pendentes já busca no banco
      console.log(`[Job Processado] Follow-up ${followUpId} está na hora!`);
    }
  }
}
