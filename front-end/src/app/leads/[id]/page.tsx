'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { api } from '@/lib/api';
import { Lead, Interaction } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Sparkles, Send, Loader2, UserCircle, Briefcase, Phone, AtSign, Clock } from 'lucide-react';

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States para interação
  const [newInteraction, setNewInteraction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // States para IA
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    if (!leadId) return;
    const fetchData = async () => {
      try {
        const [leadRes, interactionsRes] = await Promise.all([
          api.get<Lead>(`/leads/${leadId}`),
          api.get<Interaction[]>(`/leads/${leadId}/interactions`)
        ]);
        setLead(leadRes.data);
        setInteractions(interactionsRes.data);
      } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [leadId]);

  const handleCreateInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInteraction.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await api.post<Interaction>(`/leads/${leadId}/interactions`, {
        type: 'MESSAGE',
        content: newInteraction
      });
      setInteractions([res.data, ...interactions]);
      setNewInteraction('');
    } catch (error) {
      console.error('Erro ao salvar interação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await api.post<{ summary: string }>(`/leads/${leadId}/ai-summary`);
      setAiSummary(res.data.summary);
    } catch (error) {
      console.error('Erro na IA:', error);
      setAiSummary("Desculpe, não foi possível gerar o resumo neste momento.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary size-8 opacity-50" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-foreground/50">Lead não encontrado.</p>
        <Button onClick={() => router.push('/')} variant="outline">Voltar ao Pipeline</Button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-[1400px] w-full mx-auto px-6 py-12 flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left Column - Profile & AI */}
        <div className="w-full md:w-1/3 flex flex-col gap-6 sticky top-24">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-foreground/50 hover:text-foreground transition-premium w-fit mb-2"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          
          <Card className="p-8 flex flex-col gap-6" glass>
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full bg-surface-light border border-surface-border flex items-center justify-center text-foreground/40">
                <UserCircle size={32} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight">{lead.name}</h1>
                <span className="text-sm font-medium text-primary-light uppercase tracking-wider">{lead.stage}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 pt-4 border-t border-surface-border">
              <div className="flex items-center gap-3 text-foreground/70">
                <Phone size={16} />
                <span className="font-mono text-sm">{lead.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-foreground/70">
                <AtSign size={16} />
                <span className="text-sm">{lead.email || 'Nenhum email cadastrado'}</span>
              </div>
              <div className="flex items-center gap-3 text-foreground/70">
                <Briefcase size={16} />
                <span className="text-sm">Canal: {lead.channel}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 flex flex-col gap-4 relative overflow-hidden" glass>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="flex flex-col gap-2 relative z-10">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles size={16} className="text-primary-light" />
                Resumo por IA
              </h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                Analise todo o histórico de interações com o Google Gemini para extrair dor, contexto e próximos passos.
              </p>
            </div>
            
            {!aiSummary ? (
              <Button 
                onClick={handleGenerateSummary} 
                isLoading={isGeneratingAi} 
                className="mt-2 w-full glass hover:border-primary-light border-surface-border transition-premium text-foreground hover:bg-surface-light"
              >
                Gerar Relatório Inteligente
              </Button>
            ) : (
              <div className="mt-4 p-4 rounded-xl bg-surface/50 border border-surface-border text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                {aiSummary}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Interactions History */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <h2 className="text-xl font-semibold tracking-tight">Histórico de Interações</h2>
          
          <Card className="p-6" glass>
            <form onSubmit={handleCreateInteraction} className="flex gap-3">
              <Input 
                placeholder="Registrar nova mensagem, call ou nota..." 
                value={newInteraction}
                onChange={(e) => setNewInteraction(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" isLoading={isSubmitting} className="w-14 px-0 shrink-0">
                {!isSubmitting && <Send size={18} />}
              </Button>
            </form>
          </Card>

          <div className="flex flex-col gap-4 mt-4">
            {interactions.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center border border-dashed border-surface-border rounded-3xl shrink-0">
                <MessagesSquare className="text-foreground/20 mb-4" size={32} />
                <p className="text-foreground/50">Nenhuma interação registrada ainda.</p>
              </div>
            ) : (
              interactions.map((interaction) => (
                <div key={interaction._id} className="flex gap-4 group">
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <div className="size-10 rounded-full bg-surface border border-surface-border flex items-center justify-center shrink-0 group-hover:border-primary/50 transition-premium">
                      <Clock size={14} className="text-foreground/40 group-hover:text-primary transition-premium" />
                    </div>
                    <div className="w-px h-full bg-surface-border/50 group-last:hidden" />
                  </div>
                  
                  <Card className="flex-1 p-5 mb-4 group-hover:border-surface-border/80 transition-premium">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-medium px-2 py-1 bg-surface-light rounded-md text-foreground/60 uppercase tracking-wider">
                        {interaction.type}
                      </span>
                      <span className="text-xs text-foreground/40 font-mono">
                        {new Date(interaction.createdAt).toLocaleDateString('pt-BR', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-foreground/80 leading-relaxed text-sm">
                      {interaction.content}
                    </p>
                  </Card>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </>
  );
}
