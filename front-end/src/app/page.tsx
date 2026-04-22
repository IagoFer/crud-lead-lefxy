'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { LeadPipeline } from '@/components/leads/LeadPipeline';
import { LeadTable } from '@/components/leads/LeadTable';
import { LayoutGrid, List } from 'lucide-react';

export default function Home() {
  const [viewMode, setViewMode] = useState<'PIPELINE' | 'TABLE'>('PIPELINE');

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-12">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">Workspace de Vendas</h1>
            <p className="text-foreground/60 text-lg max-w-[65ch]">
              Gerencie e acompanhe a evolução dos seus contatos comerciais de forma ágil.
            </p>
          </div>
          
          <div className="flex bg-surface p-1 rounded-xl border border-surface-border w-fit">
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-premium flex items-center gap-2 ${viewMode === 'PIPELINE' ? 'bg-primary/20 text-primary-light' : 'text-foreground/50 hover:text-foreground'}`}
              onClick={() => setViewMode('PIPELINE')}
            >
              <LayoutGrid size={16}/> Pipeline
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-premium flex items-center gap-2 ${viewMode === 'TABLE' ? 'bg-primary/20 text-primary-light' : 'text-foreground/50 hover:text-foreground'}`}
              onClick={() => setViewMode('TABLE')}
            >
              <List size={16}/> Tabela
            </button>
          </div>
        </div>

        {viewMode === 'PIPELINE' ? <LeadPipeline /> : <LeadTable />}
      </main>
    </>
  );
}
