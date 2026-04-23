# Frontend: Client Workspace LEFXY (Next.js 15) 🎨

Este repositório encapsula o painel CRM desenvolvido em arquitetura App Router do Next.js utilizando as melhores práticas do ecosistema React, focado para gerenciar e atolar o navegador com mais de 1000 Contatos em Fluxo de Etapas (Pipeline) de forma performática.

## 🚀 Engenharia Client-Side
- **Infinite Scrolling por Estágios**: Substituímos os arrays únicos lentos da versão inicial por subdivisões dimensionais dentro de uma _Store global_ controlada pela biblioteca **Zustand**. Agora cada estágio de Kanban possuí uma linha separada controlada por interseções, evitando colapso visual do DOM em contagens massivas.
- **Validação Antecipada Otimizada**: Adotamos pacotização da biblioteca `zod` combinada com as amarrações do `react-hook-form` nos modais, permitindo checagem limpa, em tempo real de schemas restritos em Node sem delegar tudo pro endpoint `/leads` estourar.
- **Tailwind v3.4 + Framer Motion**: Estética Dark rica em _animations_ focada para uma UX Profissional sem impactar latência Client/Server.

## 🧹 Manutenção e Clean Code
Foram removidos _Arquivos Mortos do Escopo Genérico_ originados durante a CLI do Create Next App:
* O arquivo `page.module.css` (Obsoleto em decorrência do CSS global do Tailwind CSS).
* Desacoplamento massivo do `useState` obsoleto substituído por Stores.

> 📚 **Ambiente Geral:** Todo o sistema foi construído para funcionar através do serviço do Docker em paridade limpa com o seu backend. Verifique o Root Repositório (`README.md`) para inicializar junto com o `docker compose up`.
