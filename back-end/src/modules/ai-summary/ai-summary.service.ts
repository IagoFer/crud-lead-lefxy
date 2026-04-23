import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { LeadDocument } from '../leads/schemas/lead.schema';
import { InteractionDocument } from '../interactions/schemas/interaction.schema';

@Injectable()
export class AiSummaryService {
  private ai: GoogleGenAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    
    // Se tiver a chave configurada, inicializa o Gemini
    if (apiKey && apiKey !== '') {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async generateSummary(lead: LeadDocument, interactions: InteractionDocument[]): Promise<string> {
    const prompt = this.buildPrompt(lead, interactions);

    // Usa API Real se estiver configurado
    if (this.ai) {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        return response.text || '';
      } catch (error) {
        console.error('Erro na API do Gemini, usando fallback mock:', error);
        return this.generateMockSummary(lead, interactions);
      }
    }

    // Fallback para Mock se não tiver a chave
    return this.generateMockSummary(lead, interactions);
  }

  private buildPrompt(lead: LeadDocument, interactions: InteractionDocument[]): string {
    const interacoesTxt = interactions
      .map(i => `[${i.createdAt.toISOString()}] ${(i as any).from || 'SISTEMA'} (${i.type}): ${i.content}`)
      .join('\n');

    return `
      Resuma o contexto deste lead comercial (CRM).
      
      Dados do Lead:
      Nome: ${lead.name}
      Canal de entrada: ${lead.channel}
      Estágio no pipeline: ${lead.stage}
      
      Histórico de interações:
      ${interacoesTxt || "Sem interações registradas."}
      
      Com base nessas informações, retorne um texto com a seguinte estrutura em formato Markdown:
      1. Contexto do lead
      2. Necessidade percebida
      3. Próximos passos sugeridos
    `.trim();
  }

  private generateMockSummary(lead: LeadDocument, interactions: InteractionDocument[]): string {
    const ultimaInteracao = interactions.length > 0 ? interactions[0].content : 'Nenhuma';
    return `
**Contexto do lead:** ${lead.name} é um lead no estágio ${lead.stage} vindo pelo canal ${lead.channel}.

**Necessidade percebida:** Recebemos o contato, a última mensagem registrada foi: "${ultimaInteracao}". Parece estar buscando mais informações preliminares.

**Próximos passos sugeridos:** Agendar uma ligação para aprofundar a necessidade e tentar mover o lead para a fase de Proposta.
    `.trim();
  }
}
