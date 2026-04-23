import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { api } from '@/lib/api';
import { Lead } from '@/types';
import { maskPhone } from '@/lib/utils';
import { useLeadStore } from '@/stores/useLeadStore';

// Zod Schema para Validação (Edge/Client)
const leadSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  phone: z.string().min(14, 'Telefone inválido'),
  channel: z.enum(['WHATSAPP', 'INSTAGRAM', 'SITE'])
});

type LeadFormData = z.infer<typeof leadSchema>;

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: (lead: Lead) => void;
}

export function CreateLeadModal({ isOpen, onClose, onLeadCreated }: CreateLeadModalProps) {
  const { addLead } = useLeadStore();
  const [globalError, setGlobalError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      phone: '',
      channel: 'WHATSAPP'
    }
  });

  const onSubmit = async (data: LeadFormData) => {
    setGlobalError('');
    try {
      const res = await api.post<Lead>('/leads', {
        name: data.name,
        phone: data.phone.replace(/\D/g, ''),
        channel: data.channel
      });

      // Zustand Store Update
      addLead(res.data);
      onLeadCreated(res.data);

      reset();
      onClose();
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Erro crítico ao processar Lead. Contate suporte.');
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

              {globalError && <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{globalError}</div>}

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <div>
                  <Input
                    label="Nome Completo"
                    placeholder="Ex: João Silva"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name.message}</span>}
                </div>

                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1">
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          label="WhatsApp / Telefone"
                          placeholder="(11) 99999-9999"
                          {...field}
                          onChange={(e) => field.onChange(maskPhone(e.target.value))}
                          className={errors.phone ? 'border-red-500' : ''}
                        />
                      )}
                    />
                    {errors.phone && <span className="text-xs text-red-500 mt-1 block">{errors.phone.message}</span>}
                  </div>

                  <div className="w-full md:w-1/3">
                    <Controller
                      name="channel"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label="Canal"
                          value={field.value}
                          options={[
                            { label: 'WhatsApp', value: 'WHATSAPP' },
                            { label: 'Instagram', value: 'INSTAGRAM' },
                            { label: 'Site', value: 'SITE' },
                          ]}
                          onChange={(val) => field.onChange(val)}
                        />
                      )}
                    />
                    {errors.channel && <span className="text-xs text-red-500 mt-1 block">{errors.channel.message}</span>}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-surface-border mt-2">
                  <Button type="button" variant="ghost" onClick={() => { reset(); onClose(); }}>Cancelar</Button>
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
