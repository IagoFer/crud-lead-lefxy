import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { api } from '@/lib/api';
import { Lead } from '@/types';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: (lead: Lead) => void;
}

export function CreateLeadModal({ isOpen, onClose, onLeadCreated }: CreateLeadModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState('WHATSAPP');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      setError('Nome e telefone são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.post<Lead>('/leads', { name, phone, channel });
      onLeadCreated(res.data);
      setName('');
      setPhone('');
      setChannel('WHATSAPP');
      onClose();
    } catch (err) {
      setError('Erro ao criar lead. Verifique os dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 m-auto w-full max-w-md h-fit z-50 px-4"
          >
            <Card className="p-6 md:p-8 flex flex-col gap-6" glass>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Novo Lead</h2>
                <button onClick={onClose} className="text-foreground/50 hover:text-foreground">
                  <X size={24} />
                </button>
              </div>

              {error && <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">{error}</div>}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Nome Completo"
                  placeholder="Ex: João Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />

                <div className="flex flex-col gap-4 md:flex-row">
                  <Input
                    label="Telefone / WhatsApp"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />

                  <div className="w-full md:w-1/3">
                    <Select
                      label="Canal"
                      value={channel}
                      options={[
                        { label: 'WhatsApp', value: 'WHATSAPP' },
                        { label: 'Instagram', value: 'INSTAGRAM' },
                        { label: 'Site', value: 'SITE' },
                      ]}
                      onChange={(val) => setChannel(val)}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-surface-border mt-2">
                  <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                  <Button type="submit" isLoading={isSubmitting}>
                    Salvar Lead
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
