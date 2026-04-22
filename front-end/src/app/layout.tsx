'use client';

import { Inter } from "next/font/google";
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const isLoginPage = pathname === '/login';
    const token = typeof window !== 'undefined' ? localStorage.getItem('lefxy_token') : null;

    if (!isLoginPage && !token) {
      router.push('/login');
    } else {
      setCheckingAuth(false);
    }
  }, [pathname, router]);

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary/30 selection:text-primary-light">
          {(!checkingAuth || pathname === '/login') ? children : (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
