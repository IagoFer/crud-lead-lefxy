'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Lead, PaginatedResult } from '@/types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Search, Loader2, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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
                <div className="flex items-center gap-2">Nome <ArrowUpDown size={14}/></div>
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:text-foreground transition-premium" onClick={() => toggleSort('stage')}>
                <div className="flex items-center gap-2">Estágio <ArrowUpDown size={14}/></div>
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:text-foreground transition-premium" onClick={() => toggleSort('createdAt')}>
                <div className="flex items-center gap-2">Data Entrada <ArrowUpDown size={14}/></div>
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:text-foreground transition-premium" onClick={() => toggleSort('channel')}>
                <div className="flex items-center gap-2">Canal <ArrowUpDown size={14}/></div>
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
                    <Link href={`/leads/${lead._id}`}>
                      <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-premium">
                        Perfil
                      </Button>
                    </Link>
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
            <ChevronLeft size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
