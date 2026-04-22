'use client';

import React, { useState } from 'react';
import { Scale, LogOut, Bell, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../ui/Button';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('lefxy_token');
    localStorage.removeItem('lefxy_user');
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-surface-border">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-gradient-glow flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Scale size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight">LEFXY</span>
        </div>

        {/* Desktop Navbar */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-foreground/70">
          <Link href="/" className="hover:text-foreground hover:bg-surface-light px-3 py-1.5 rounded-lg transition-premium">Pipeline</Link>
          <Link href="/follow-ups" className="hover:text-foreground hover:bg-surface-light px-3 py-1.5 rounded-lg transition-premium">Tarefas Próximas</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="text-foreground/70 hover:text-foreground transition-premium relative hidden md:block">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 size-2 rounded-full bg-primary" />
          </button>
          <div className="w-px h-6 bg-surface-border hidden md:block" />
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden md:flex gap-2 text-foreground/70"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Sair
          </Button>
          
          {/* Mobile Toggle Button */}
          <button 
            className="md:hidden text-foreground/70"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-background border-b border-surface-border p-4 flex flex-col gap-4 shadow-2xl z-50">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 bg-surface hover:bg-surface-light rounded-xl font-medium transition-premium">
            Pipeline
          </Link>
          <Link href="/follow-ups" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 bg-surface hover:bg-surface-light rounded-xl font-medium transition-premium">
            Tarefas Próximas
          </Link>
          <div className="h-px bg-surface-border my-2" />
          <Button 
            variant="ghost" 
            className="justify-start gap-2 text-foreground/70 px-4"
            onClick={handleLogout}
          >
            <LogOut size={18} /> Sair do Sistema
          </Button>
        </div>
      )}
    </header>
  );
}
