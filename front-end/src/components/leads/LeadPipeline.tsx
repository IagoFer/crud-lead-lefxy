'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Lead, LeadStage, PaginatedResult } from '@/types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Search, Loader2, Plus, Phone, MessagesSquare } from 'lucide-react';
import { Button } from '../ui/Button';

// Configura as colunas do Pipeline
const STAGES: { id: LeadStage; title: string }[] = [
  { id: 'NEW', title: 'Novos' },
  { id: 'CONTACTED', title: 'Contatados' },
  { id: 'PROPOSAL', title: 'Proposta' },
  { id: 'WON', title: 'Ganhos' },
  { id: 'LOST', title: 'Perdidos' },
];

export function LeadPipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLeads = async (q = '') => {
    try {
      setIsLoading(true);
      // Busca até 50 leads pra renderizar no board de uma vez (simplificação MVP)
      const res = await api.get<PaginatedResult<Lead>>(`/leads?limit=50&q=${q}`);
      setLeads(res.data.data);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce artesanal pra busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLeads(search);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  // Agrupa os leads por estágio memoizado para performance
  const boards = useMemo(() => {
    const grouped = STAGES.reduce((acc, stage) => {
      acc[stage.id] = leads.filter(l => l.stage === stage.id);
      return acc;
    }, {} as Record<LeadStage, Lead[]>);
    return grouped;
  }, [leads]);

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <Input 
            placeholder="Buscar por nome ou telefone..." 
            icon={<Search size={18} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button className="w-full md:w-auto">
          <Plus size={18} className="mr-2" />
          Novo Lead
        </Button>
      </div>

      {/* Board */}
      <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
        {STAGES.map((stage) => (
          <div key={stage.id} className="min-w-[320px] max-w-[320px] flex-shrink-0 flex flex-col gap-4 snap-start">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-semibold text-foreground/90">{stage.title}</h3>
              <span className="text-xs font-bold text-foreground/50 bg-surface px-2 py-1 rounded-full">
                {boards[stage.id]?.length || 0}
              </span>
            </div>

            <div className="flex flex-col gap-3 min-h-[200px]">
              <AnimatePresence mode="popLayout">
                {isLoading && boards[stage.id].length === 0 && stage.id === 'NEW' ? (
                  <div className="w-full flex justify-center py-8">
                    <Loader2 className="animate-spin text-primary opacity-50" />
                  </div>
                ) : (
                  boards[stage.id].map((lead) => (
                    <motion.div
                      layout
                      layoutId={lead._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      key={lead._id}
                    >
                      <Link href={`/leads/${lead._id}`}>
                        <Card className="p-4 cursor-pointer hover:border-primary/50 transition-premium group">
                          <div className="flex flex-col gap-1">
                            <h4 className="font-semibold text-sm truncate">{lead.name}</h4>
                            <span className="text-xs text-foreground/50 font-mono tracking-tight">{lead.phone}</span>
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
                      </Link>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
