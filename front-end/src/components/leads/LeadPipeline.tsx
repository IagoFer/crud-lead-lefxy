'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Lead, LeadStage, PaginatedResult } from '@/types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Search, Loader2, Plus, Phone, MessagesSquare, CheckCircle2, GripVertical } from 'lucide-react';
import { Button } from '../ui/Button';
import { CreateLeadModal } from './CreateLeadModal';

import { useLeadStore } from '@/stores/useLeadStore';

// Configura as colunas do Pipeline
const STAGES: { id: LeadStage; title: string }[] = [
  { id: 'NEW', title: 'Novos' },
  { id: 'QUALIFIED', title: 'Qualificados' },
  { id: 'PROPOSAL', title: 'Proposta' },
  { id: 'WON', title: 'Ganhos' },
  { id: 'LOST', title: 'Perdidos' },
];

export function LeadPipeline() {
  const { 
    leadsByStage, 
    isInitialLoading, 
    searchQuery, 
    setSearchQuery, 
    fetchInitialStages,
    fetchNextPage,
    updateLeadStage
  } = useLeadStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Drag & Drop state
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [draggedFromStage, setDraggedFromStage] = useState<LeadStage | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStage | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Setup Inicial
  useEffect(() => {
    fetchInitialStages('');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Função para checar final de scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>, stage: LeadStage) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    // Dispara a próxima página quando faltar só 20px pro final da rolagem
    if (scrollHeight - scrollTop <= clientHeight + 20) {
      fetchNextPage(stage);
    }
  };

  // Debounce artesanal pra busca fluida (Impede disparo a cada letra)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchInitialStages(searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // ===== Drag & Drop Handlers =====
  const handleDragStart = (e: React.DragEvent, lead: Lead, fromStage: LeadStage) => {
    setDraggedLead(lead);
    setDraggedFromStage(fromStage);
    e.dataTransfer.effectAllowed = 'move';
    // Adiciona uma imagem de arraste customizada (opcional, melhora o visual)
    e.dataTransfer.setData('text/plain', lead._id);
  };

  const handleDragOver = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Só limpa se saiu da coluna (não de um filho interno)
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (
      clientX < rect.left || clientX > rect.right ||
      clientY < rect.top || clientY > rect.bottom
    ) {
      setDragOverStage(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStage: LeadStage) => {
    e.preventDefault();
    setDragOverStage(null);

    if (!draggedLead || !draggedFromStage || draggedFromStage === targetStage) {
      setDraggedLead(null);
      setDraggedFromStage(null);
      return;
    }

    // 1. Atualização otimista no store (move o card instantaneamente)
    updateLeadStage(draggedLead._id, targetStage, draggedFromStage);
    
    const stageTitle = STAGES.find(s => s.id === targetStage)?.title || targetStage;
    showSuccess(`${draggedLead.name} movido para ${stageTitle}`);

    // 2. Faz o PATCH na API
    try {
      await api.patch(`/leads/${draggedLead._id}`, { stage: targetStage });
    } catch (error) {
      console.error('Erro ao atualizar estágio:', error);
      // Reverte em caso de erro
      updateLeadStage(draggedLead._id, draggedFromStage, targetStage);
      showSuccess(''); // Limpa a mensagem de sucesso
    }

    setDraggedLead(null);
    setDraggedFromStage(null);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDraggedFromStage(null);
    setDragOverStage(null);
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <Input 
            placeholder="Buscar por nome ou telefone..." 
            icon={<Search size={18} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="w-full md:w-auto" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} className="mr-2" />
          Novo Lead
        </Button>
      </div>

      <CreateLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onLeadCreated={() => {
          showSuccess('Lead criado com sucesso!');
        }} 
      />

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

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar" style={{ transform: 'rotateX(180deg)' }}>
        {STAGES.map((stage) => (
          <div 
            key={stage.id} 
            className={`min-w-[340px] max-w-[340px] flex-shrink-0 flex flex-col rounded-[2rem] p-4 snap-start h-fit shadow-inner transition-all duration-300 ${
              dragOverStage === stage.id && draggedFromStage !== stage.id
                ? 'bg-primary/10 border-2 border-primary/50 border-dashed scale-[1.02]' 
                : 'bg-surface/30 border border-surface-border/50'
            }`}
            style={{ transform: 'rotateX(180deg)' }}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <div className="flex items-center justify-between px-2 mb-6">
              <div className="flex items-center gap-3">
                <div className={`size-2 rounded-full ${
                  stage.id === 'WON' ? 'bg-emerald-500' : 
                  stage.id === 'LOST' ? 'bg-red-500' : 
                  stage.id === 'PROPOSAL' ? 'bg-amber-500' : 'bg-primary'
                }`} />
                <h3 className="font-bold text-lg tracking-tight text-foreground/90">{stage.title}</h3>
              </div>
              <span className="text-xs font-black text-primary-light bg-primary/10 px-3 py-1 rounded-full border border-primary/10">
                {leadsByStage[stage.id]?.total || 0}
              </span>
            </div>

            <div 
              className="flex flex-col gap-3 min-h-[150px] max-h-[650px] overflow-y-auto px-1 pb-4 custom-scrollbar"
              onScroll={(e) => handleScroll(e, stage.id)}
            >
              <AnimatePresence mode="popLayout">
                {isInitialLoading ? (
                  <div className="w-full flex justify-center py-8">
                    <Loader2 className="animate-spin text-primary opacity-50" />
                  </div>
                ) : (
                  leadsByStage[stage.id].data.map((lead) => (
                    <motion.div
                      layout
                      layoutId={lead._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      key={lead._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, lead, stage.id)}
                      onDragEnd={handleDragEnd}
                      className={`${draggedLead?._id === lead._id ? 'opacity-40 scale-95' : ''} transition-all duration-200`}
                    >
                      <Card className="p-4 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-premium group">
                        <div className="flex items-start gap-2">
                          <div className="mt-1 text-foreground/20 group-hover:text-foreground/40 transition-premium">
                            <GripVertical size={14} />
                          </div>
                          <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <Link href={`/leads/${lead._id}`} onClick={(e) => { if (draggedLead) e.preventDefault(); }}>
                              <h4 className="font-semibold text-sm truncate hover:text-primary transition-colors">{lead.name}</h4>
                            </Link>
                            <span className="text-xs text-foreground/50 font-mono tracking-tight">{lead.phone}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-border">
                          <span className="text-[10px] font-medium px-2 py-1 bg-surface-light rounded-md text-foreground/60 uppercase tracking-wider">
                            {lead.channel}
                          </span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-premium">
                            <button className="text-foreground/40 hover:text-primary transition-premium">
                              <Phone size={14} />
                            </button>
                            <button className="text-foreground/40 hover:text-primary transition-premium">
                              <MessagesSquare size={14} />
                            </button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
                
                {leadsByStage[stage.id].isLoadingMore && (
                  <div className="w-full flex justify-center py-4">
                    <Loader2 className="animate-spin text-primary opacity-50" size={20} />
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
