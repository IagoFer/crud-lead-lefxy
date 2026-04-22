import { Navbar } from '@/components/layout/Navbar';
import { LeadPipeline } from '@/components/leads/LeadPipeline';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">Pipeline de Vendas</h1>
          <p className="text-foreground/60 text-lg max-w-[65ch]">
            Gerencie e acompanhe a evolução dos seus contatos comerciais de forma ágil.
          </p>
        </div>

        <LeadPipeline />
      </main>
    </>
  );
}
