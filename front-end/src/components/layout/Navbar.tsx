import React from 'react';
import { Scale, LogOut, Bell } from 'lucide-react';
import { Button } from '../ui/Button';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-surface-border">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-gradient-glow flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Scale size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight">LEFXY</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-foreground/70">
          <a href="#" className="text-foreground transition-premium">Pipeline</a>
          <a href="#" className="hover:text-foreground transition-premium">Analytcs</a>
          <a href="#" className="hover:text-foreground transition-premium">Ajustes</a>
        </nav>

        <div className="flex items-center gap-4">
          <button className="text-foreground/70 hover:text-foreground transition-premium relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 size-2 rounded-full bg-primary" />
          </button>
          <div className="w-px h-6 bg-surface-border hidden md:block" />
          <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-foreground/70">
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
