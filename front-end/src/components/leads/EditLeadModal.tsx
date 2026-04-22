import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { api } from '@/lib/api';
import { Lead } from '@/types';

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onLeadUpdated: (lead: Lead) => void;
}

export function EditLeadModal({ isOpen, onClose, lead, onLeadUpdated }: EditLeadModalProps) {
  const [name, setName] = useState(lead.name);
  const [phone, setPhone] = useState(lead.phone);
  const [channel, setChannel] = useState(lead.channel);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sincroniza dados se a lead mudar externamente
  useEffect(() => {
    setName(lead.name);
    setPhone(lead.phone);
    setChannel(lead.channel);
  }, [lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      setError('Nome e telefone são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.patch<Lead>(`/leads/${lead._id}`, { name, phone, channel });
      onLeadUpdated(res.data);
      onClose();
    } catch (err) {
      setError('Erro ao atualizar lead. Verifique os dados.');
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
                <h2 className="text-2xl font-bold tracking-tight">Editar Lead</h2>
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

                <div className="flex flex-col gap-4 md:flex-row z-20">
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
                    Salvar Mudanças
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
