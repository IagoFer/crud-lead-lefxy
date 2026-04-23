'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Lead, PaginatedResult } from '@/types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Search, Loader2, ArrowUpDown, ChevronLeft, ChevronRight, Edit, Trash, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { EditLeadModal } from './EditLeadModal';
import { IconButton } from '../ui/IconButton';
import { AnimatePresence, motion } from 'framer-motion';

const STAGE_TRANSLATIONS: Record<string, string> = {
  NEW: 'Novo',
  QUALIFIED: 'Qualificado',
  PROPOSAL: 'Proposta',
  WON: 'Ganho',
  LOST: 'Perdido',
};

export function LeadTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Controle de Edição/Exclusão/Sucesso
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get<PaginatedResult<Lead>>(
        `/leads?page=${page}&limit=${limit}&q=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      );
      setLeads(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLeads();
    }, 400); // Debounce
    return () => clearTimeout(timeoutId);
  }, [search, page, limit, sortBy, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = (id: string) => {
    setLeadToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    try {
      await api.delete(`/leads/${leadToDelete}`);
      setIsDeleteModalOpen(false);
      setLeadToDelete(null);
      showSuccess('Lead excluído com sucesso!');
      fetchLeads();
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
    }
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  const handleUpdated = () => {
    showSuccess('Lead atualizado com sucesso!');
    fetchLeads();
  };

  return (
    <Card className="flex flex-col overflow-hidden" glass>
      <div className="p-4 border-b border-surface-border flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:w-96">
          <Input
            placeholder="Buscar leads por nome ou telefone..."
            icon={<Search size={18} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface/50 border-b border-surface-border text-foreground/70 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium cursor-pointer hover:text-foreground transition-premium" onClick={() => toggleSort('name')}>
                <div className="flex items-center gap-2">Nome <ArrowUpDown size={14} /></div>
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:text-foreground transition-premium" onClick={() => toggleSort('stage')}>
                <div className="flex items-center gap-2">Estágio <ArrowUpDown size={14} /></div>
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:text-foreground transition-premium" onClick={() => toggleSort('createdAt')}>
                <div className="flex items-center gap-2">Data Entrada <ArrowUpDown size={14} /></div>
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:text-foreground transition-premium" onClick={() => toggleSort('channel')}>
                <div className="flex items-center gap-2">Canal <ArrowUpDown size={14} /></div>
              </th>
              <th className="px-6 py-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {loading && leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex justify-center"><Loader2 className="animate-spin text-primary opacity-50" /></div>
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-foreground/50">
                  Nenhum lead encontrado com estes filtros.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead._id} className="hover:bg-surface-light transition-colors group">
                  <td className="px-6 py-4 font-medium">
                    <div className="flex flex-col">
                      <span>{lead.name}</span>
                      <span className="text-xs text-foreground/50 font-mono mt-0.5">{lead.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-2 py-1 bg-surface rounded text-foreground/70 uppercase border border-surface-border">
                      {STAGE_TRANSLATIONS[lead.stage] || lead.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground/70">
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-foreground/70">
                    <span className="text-xs px-2 py-1 bg-surface-light rounded-md border border-surface-border uppercase">
                      {lead.channel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">

                      {/* VIEW */}
                      <Link href={`/leads/${lead._id}`}>
                        <IconButton
                          icon={Eye}
                          title="Visualizar"
                          iconClassName="text-blue-500"
                          className="hover:border-primary-light"
                        />
                      </Link>

                      {/* EDIT */}
                      <IconButton
                        icon={Edit}
                        onClick={() => handleEdit(lead)}
                        title="Editar"
                        iconClassName="text-yellow-500"
                        className="hover:border-primary-light"
                      />

                      {/* DELETE */}
                      <IconButton
                        icon={Trash}
                        onClick={() => handleDelete(lead._id)}
                        title="Excluir"
                        iconClassName="text-red-500"
                        className="hover:border-destructive"
                      />

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-surface-border flex items-center justify-between text-sm text-foreground/70">
        <div className="flex items-center gap-4">
          <span>Página {page} de {totalPages || 1}</span>
          <select
            className="bg-surface border border-surface-border text-foreground/70 text-xs rounded px-2 py-1 outline-none"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

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

      {/* Modal de Exclusão */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsDeleteModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-surface border border-surface-border rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center gap-6">
                <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                  <AlertTriangle className="size-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight">Confirmar Exclusão</h3>
                  <p className="text-foreground/60 font-medium leading-relaxed">
                    Você está prestes a realizar a exclusão lógica deste lead. Ele deixará de aparecer na sua pipeline principal. Deseja continuar?
                  </p>
                </div>
                <div className="flex gap-3 w-full">
                  <Button variant="ghost" fullWidth onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                  <Button variant="danger" fullWidth onClick={handleConfirmDelete}>Excluir</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedLead && (
        <EditLeadModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          lead={selectedLead}
          onLeadUpdated={handleUpdated}
        />
      )}
    </Card>
  );
}
