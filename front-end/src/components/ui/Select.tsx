'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export function Select({ label, options, value, onChange, className = '' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`w-full flex flex-col gap-2 relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-foreground ml-1">
          {label}
        </label>
      )}
      <div 
        className="w-full h-12 px-4 rounded-xl transition-premium bg-surface/50 border border-surface-border cursor-pointer flex items-center justify-between text-foreground text-sm hover:border-primary-light/50 relative z-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-[calc(100%+8px)] left-0 w-full bg-surface border border-surface-border rounded-xl shadow-2xl overflow-hidden z-50 p-1"
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                className={`w-full px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-premium flex items-center justify-between ${
                  value === opt.value ? 'bg-primary/20 text-primary-light font-medium' : 'hover:bg-surface-light text-foreground/80'
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
                {value === opt.value && <Check size={14} />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
