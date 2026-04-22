'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { api } from '@/lib/api';
import { FollowUp, Lead } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Phone, CalendarClock, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function FollowUpsPage() {
  const [tasks, setTasks] = useState<FollowUp[]>([]);
  const [completedTasks, setCompletedTasks] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get<FollowUp[]>('/followups/pending');
      setTasks(res.data);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (task: FollowUp) => {
    try {
      // Otimista (UX instantânea)
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
      setCompletedTasks((prev) => [task, ...prev]);
      await api.patch(`/followups/${task._id}/complete`);
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
      fetchTasks();
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-[1000px] w-full mx-auto px-6 py-12">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-2 flex items-center gap-3">
              <CalendarClock className="text-primary" size={32} />
              Tarefas Próximas
            </h1>
            <p className="text-foreground/60 text-lg">
              Follow-ups gerados automaticamente para você não perder negócios.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <span className="text-2xl font-bold text-foreground">{tasks.length}</span>
            <span className="text-xs uppercase tracking-wider text-foreground/50 font-medium">Pendentes</span>
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center">
            <Loader2 className="animate-spin text-primary opacity-50" size={32} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-center border border-dashed border-surface-border rounded-[2.5rem]">
            <CheckCircle2 size={48} className="text-primary/20" />
            <h3 className="text-xl font-bold">Tudo limpo por aqui!</h3>
            <p className="text-foreground/50 max-w-sm">
              Você não tem nenhuma atividade pendente de resposta com seus clientes.
            </p>
            <Link href="/">
              <Button variant="outline" className="mt-4">Voltar ao Pipeline</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => {
                const lead = task.leadId as unknown as Lead; // O mongoose retorna populado
                return (
                  <motion.div
                    layout
                    key={task._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, x: 20 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <Card className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-primary/50 transition-premium" glass>
                      
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="size-12 rounded-2xl bg-surface border border-surface-border flex items-center justify-center shrink-0">
                          <Phone size={20} className="text-primary-light" />
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <h4 className="font-semibold text-lg flex gap-2 items-center">
                            {lead.name || 'Lead Excluído'}
                            {lead.stage && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-surface-light rounded text-foreground/70 uppercase">
                                {lead.stage}
                              </span>
                            )}
                          </h4>
                          <span className="text-sm font-mono text-foreground/50">{lead.phone || 'Sem contato'}</span>
                        </div>
                      </div>

                      <div className="flex items-center w-full md:w-auto justify-between md:justify-end gap-6 border-t md:border-none border-surface-border pt-4 md:pt-0">
                        <div className="flex flex-col md:items-end">
                          <span className="text-xs uppercase tracking-wider text-foreground/50 font-medium">Vencimento</span>
                          <span className="text-sm font-bold text-red-400">
                            {new Date(task.dueAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="flex gap-3">
                          <Link href={lead._id ? `/leads/${lead._id}` : '#'}>
                            <Button variant="secondary" size="sm">Ver Perfil</Button>
                          </Link>
                          <Button size="sm" onClick={() => handleCompleteTask(task)} className="gap-2">
                            <CheckCircle2 size={16} /> Concluir
                          </Button>
                        </div>
                      </div>

                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {completedTasks.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground/50">
                  <CheckCircle2 size={20} /> Concluídas Recentemente
                </h3>
                <div className="flex flex-col gap-4 opacity-50">
                  {completedTasks.map(task => {
                    const lead = task.leadId as unknown as Lead;
                    return (
                      <Card key={task._id} className="p-4 flex flex-col md:flex-row items-center justify-between" glass>
                        <span className="font-semibold line-through">{lead.name || 'Sem nome'}</span>
                        <span className="text-sm font-mono">{new Date(task.dueAt).toLocaleDateString()}</span>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
