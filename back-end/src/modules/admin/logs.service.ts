import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);
  private readonly logsDir = path.join(process.cwd(), 'logs');

  async getLogs(page: number = 1, limit: number = 50) {
    const today = new Date().toISOString().split('T')[0];
    const fileName = `combined-${today}.log`;
    const filePath = path.join(this.logsDir, fileName);

    if (!fs.existsSync(filePath)) {
      return { data: [], total: 0 };
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim() !== '');
      
      const logs = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return { message: line, level: 'info', timestamp: new Date().toISOString() };
        }
      });

      // Ordenar do mais recente para o mais antigo
      const sortedLogs = logs.reverse();

      const total = sortedLogs.length;
      const start = (page - 1) * limit;
      const data = sortedLogs.slice(start, start + limit);

      return {
        data,
        total,
        page,
        limit
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro ao ler arquivo de log: ${errorMessage}`);
      return { data: [], total: 0 };
    }
  }
}
