'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldAlert, Eye, EyeOff, Scale } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@lefxy.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('lefxy_token', data.access_token);
      localStorage.setItem('lefxy_user', JSON.stringify(data.user));
      
      // Salva no Cookie para o Next.js Middleware ler no lado do servidor
      document.cookie = `lefxy_token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;
      
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciais inválidas. Tente admin@lefxy.com / admin123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background overflow-hidden">
      {/* Left Panel - Visual Identity */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
        <div className="absolute inset-0 z-10 bg-black/40" />
        <img
          src="/legal_crm_login_hero_1776895278159.png"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom"
        />

        <div className="relative z-20 p-16 flex flex-col h-full justify-between items-start text-white">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Scale size={24} />
            </div>
            <span className="font-bold text-2xl tracking-tight">LEFXY</span>
          </div>

          <div className="max-w-md">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-6xl font-black leading-[1.1] tracking-tighter"
            >
              REVOLUCIONE <br /> O SEU CRM
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-xl text-white/80 font-medium leading-relaxed"
            >
              Leads jurídicos, automação com IA e gestão de pipeline em um só lugar.
            </motion.p>
          </div>

          <div className="text-white/50 text-sm">
            © 2026 LEFXY Systems. Todos os direitos reservados.
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-16 bg-background relative">
        <div className="w-full max-w-sm space-y-10">
          <div className="space-y-4">
            <h2 className="text-3xl font-black tracking-tight uppercase">Entrar</h2>
            <p className="text-muted-foreground font-medium">Acesse sua conta com seu e-mail</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 bg-surface border border-surface-border rounded-2xl pl-12 pr-4 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  placeholder="Seu e-mail"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 bg-surface border border-surface-border rounded-2xl pl-12 pr-12 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="size-4 rounded border-surface-border accent-primary" />
                <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">Lembrar</span>
              </label>
              <button type="button" className="text-primary hover:text-primary-dark font-bold transition-colors underline-offset-4 hover:underline">
                Esqueceu a senha?
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-sm"
              >
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <p className="font-medium text-destructive">{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              isLoading={loading}
              className="w-full h-14 rounded-2xl text-lg font-black uppercase tracking-tight shadow-xl shadow-primary/20"
            >
              Entrar
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Acesso administrativo: <span className="text-foreground">admin@lefxy.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
