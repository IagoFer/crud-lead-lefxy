'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { api } from '@/lib/api';
import { Lead, Interaction, LeadStage } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EditLeadModal } from '@/components/leads/EditLeadModal';
import { ArrowLeft, Sparkles, Send, Loader2, UserCircle, Briefcase, Phone, AtSign, Clock, MessagesSquare, Settings, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [interPage, setInterPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // States para interação
  const [newInteraction, setNewInteraction] = useState('');
  const [interactionType, setInteractionType] = useState<'MESSAGE' | 'CALL' | 'NOTE'>('MESSAGE');
  const [interactionFrom, setInteractionFrom] = useState<'LEAD' | 'USER'>('USER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States para IA
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // States para edição/sucesso
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  useEffect(() => {
    if (!leadId) return;
    const fetchData = async () => {
      try {
        const [leadRes, interactionsRes] = await Promise.all([
          api.get<Lead>(`/leads/${leadId}`),
          api.get<{ data: Interaction[], meta: any }>(`/leads/${leadId}/interactions?page=1&limit=10`)
        ]);
        setLead(leadRes.data);
        setInteractions(interactionsRes.data.data);
        setHasNextPage(interactionsRes.data.meta.page < interactionsRes.data.meta.totalPages);
      } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [leadId]);

  const handleLoadMore = async () => {
    if (!hasNextPage || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = interPage + 1;
      const res = await api.get<{ data: Interaction[], meta: any }>(`/leads/${leadId}/interactions?page=${nextPage}&limit=10`);
      setInteractions((prev) => [...prev, ...res.data.data]);
      setInterPage(nextPage);
      setHasNextPage(res.data.meta.page < res.data.meta.totalPages);
    } catch (error) {
      console.error('Erro ao buscar mais interações:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleCreateInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInteraction.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post<Interaction>(`/leads/${leadId}/interactions`, {
        type: interactionType,
        from: interactionFrom,
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
        <div className="w-full md:w-1/3 flex flex-col gap-6 relative md:sticky md:top-24">
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
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{lead.name}</h1>
                <div className="w-40 z-20">
                  <Select
                    value={lead.stage}
                    options={[
                      { label: 'Novo', value: 'NEW' },
                      { label: 'Qualificado', value: 'QUALIFIED' },
                      { label: 'Proposta', value: 'PROPOSAL' },
                      { label: 'Ganho', value: 'WON' },
                      { label: 'Perdido', value: 'LOST' }
                    ]}
                    onChange={async (val) => {
                      setLead({ ...lead, stage: val as LeadStage });
                      await api.patch(`/leads/${leadId}`, { stage: val });
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4 border-t border-surface-border">
              <div className="flex items-center gap-3 text-foreground/70">
                <Phone size={16} />
                <span className="font-mono text-sm">{lead.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-foreground/70">
                <Briefcase size={16} />
                <span className="text-sm">Canal: {lead.channel}</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Settings size={16} className="mr-2" />
              Editar Informações
            </Button>
          </Card>

          <Card className="p-6 flex flex-col gap-4 relative" glass>
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
              <div className="mt-4 p-4 rounded-xl bg-surface/50 border border-surface-border text-sm leading-relaxed text-foreground/80 space-y-3">
                {aiSummary.split('\n').map((paragraph, index) => (
                  paragraph.trim() ? (
                    <p key={index} dangerouslySetInnerHTML={{
                      __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                    }} />
                  ) : null
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Interactions History */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <h2 className="text-xl font-semibold tracking-tight">Histórico de Interações</h2>

          <Card className="p-4 md:p-6 relative z-20" glass>
            <form onSubmit={handleCreateInteraction} className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-end gap-3">
                <div className="w-full md:w-40 shrink-0">
                  <Select
                    label="Remetente"
                    value={interactionFrom}
                    options={[
                      { label: 'Consultor', value: 'USER' },
                      { label: 'Cliente', value: 'LEAD' }
                    ]}
                    onChange={(val) => setInteractionFrom(val as any)}
                  />
                </div>
                <div className="w-full md:w-48 shrink-0">
                  <Select
                    label="Tipo"
                    value={interactionType}
                    options={[
                      { label: 'Mensagem', value: 'MESSAGE' },
                      { label: 'Call (Ligação)', value: 'CALL' },
                      { label: 'Nota Interna', value: 'NOTE' }
                    ]}
                    onChange={(val) => setInteractionType(val as any)}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                  <div className="flex items-end gap-2 w-full">
                    <Input
                      label="Conteúdo"
                      placeholder="Detalhes da interação..."
                      value={newInteraction}
                      onChange={(e) => setNewInteraction(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" isLoading={isSubmitting} className="h-12 w-14 shrink-0 mb-0">
                      {!isSubmitting && <Send size={18} />}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Card>

          <Card className="p-8 flex flex-col h-[800px]" glass>
            {/* Listagem de mensagens */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar relative">
              {interactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-foreground/40 gap-4">
                  <MessagesSquare size={48} className="opacity-20" />
                  <p>Nenhuma interação registrada ainda.</p>
                </div>
              ) : (
                <>
                  {interactions.map((interaction) => (
                    <div key={interaction._id} className="flex gap-4 group">
                      <div className="flex flex-col items-center gap-2 pt-1">
                        <div className="size-10 rounded-full bg-surface border border-surface-border flex items-center justify-center shrink-0 group-hover:border-primary/50 transition-premium">
                          <Clock size={14} className="text-foreground/40 group-hover:text-primary transition-premium" />
                        </div>
                        <div className="w-px h-full bg-surface-border/50 group-last:hidden" />
                      </div>

                      <Card
                        className={`flex-1 p-5 mb-4 group-hover:border-surface-border/80 transition-premium ${(interaction as any).from === 'LEAD'
                            ? 'border-l-4 border-l-primary/50 bg-primary/5'
                            : 'border-l-4 border-l-foreground/20'
                          }`}
                        glass
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2 items-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${(interaction as any).from === 'LEAD'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-foreground/10 text-foreground/60'
                              }`}>
                              {(interaction as any).from === 'LEAD' ? 'Cliente' : 'Consultor'}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 bg-surface-light rounded-md text-foreground/40 uppercase tracking-widest">
                              {interaction.type}
                            </span>
                          </div>
                          <span className="text-[10px] text-foreground/40 font-mono">
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
                  ))}

                  {/* Botão de carregar mais antigas */}
                  {hasNextPage && (
                    <div className="flex justify-center pt-8 pb-4 z-10 relative border-t border-surface-border/30">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLoadMore}
                        isLoading={isLoadingMore}
                        className="rounded-full bg-surface-light border border-surface-border text-xs px-8 py-2.5 shadow-lg hover:border-primary/50 transition-premium"
                      >
                        Carregar mensagens anteriores
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </main>

      {lead && (
        <EditLeadModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          lead={lead}
          onLeadUpdated={(updated) => {
            setLead(updated);
            showSuccess('Lead atualizado com sucesso!');
          }}
        />
      )}

      {/* Notificação de Sucesso */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-24 right-8 z-[100] flex items-center gap-3 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-500/20 font-bold border border-white/10 backdrop-blur-md"
          >
            <CheckCircle2 className="size-5" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
