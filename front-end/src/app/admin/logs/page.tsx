'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Terminal, RefreshCw, AlertCircle, Info, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  ms?: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = useCallback(async (p: number) => {
    try {
      const { data } = await api.get(`/admin/logs?page=${p}&limit=50`);
      setLogs(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(page);
  }, [page, fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs(page);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, page, fetchLogs]);

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'warn': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-12 flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Terminal className="text-primary" />
              Monitoramento de Logs
            </h1>
            <p className="text-muted-foreground mt-1">Acompanhe a atividade do sistema em tempo real</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'border-primary/50 text-primary' : ''}
            >
              <RefreshCw size={16} className={`mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button size="sm" onClick={() => fetchLogs(page)}>
              Atualizar Agora
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex items-center gap-4 border-l-4 border-l-primary" glass>
            <Info className="text-primary size-8 opacity-50" />
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total de Entradas</p>
              <h3 className="text-2xl font-bold">{total}</h3>
            </div>
          </Card>
          <Card className="p-6 flex items-center gap-4 border-l-4 border-l-destructive" glass>
            <AlertCircle className="text-destructive size-8 opacity-50" />
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Erros Hoje</p>
              <h3 className="text-2xl font-bold">{logs.filter(l => l.level === 'error').length}</h3>
            </div>
          </Card>
          <Card className="p-6 flex items-center gap-4 border-l-4 border-l-amber-500" glass>
            <Clock className="text-amber-500 size-8 opacity-50" />
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Status</p>
              <h3 className="text-2xl font-bold">Operacional</h3>
            </div>
          </Card>
        </div>

        <Card className="flex-1 overflow-hidden flex flex-col bg-muted/20 border-white/5" glass>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">Nível</th>
                  <th className="px-6 py-4 font-semibold">Contexto</th>
                  <th className="px-6 py-4 font-semibold">Mensagem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {logs.map((log, i) => (
                    <motion.tr 
                      key={`${log.timestamp}-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${getLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-primary/70 font-medium">[{log.context || 'App'}]</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs max-w-md truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:break-all transition-all">
                        {typeof log.message === 'object' ? JSON.stringify(log.message) : log.message} 
                        {log.ms && <span className="text-primary-light/50 ml-2">{log.ms}</span>}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>

                {!loading && logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhum log encontrado para hoje.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-muted/30 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Mostrando até 50 logs por página</p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </Button>
              <span className="text-sm font-medium px-2">Página {page}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(prev => prev + 1)}
                disabled={logs.length < 50}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
