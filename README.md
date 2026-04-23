# LEFXY Mini CRM Jurídico ⚖️

Uma plataforma moderna e performática para gestão de leads avançada em escritórios de advocacia, integrando Inteligência Artificial (Google Gemini) para resumos estratégicos e monitoramento total via logs estruturados.

## 🚀 Guia Rápido de Instalação (Docker)

O projeto está totalmente orquestrado via Docker. Certifique-se de ter o Docker Desktop instalado no seu Windows.

### 1. Configuração do PATH (Fix para Windows)
Se o seu terminal não estiver reconhecendo o comando `docker`, adicione o binário ao seu Path permanentemente:
1. Abra o Menu Iniciar e digite **"Variáveis de Ambiente"**.
2. Clique em **Variáveis de Ambiente** no canto inferior direito.
3. Em **Variáveis do Sistema**, procure por `Path` e clique em Editar.
4. Clique em **Novo** e adicione: `C:\Program Files\Docker\Docker\resources\bin`
5. Dê OK em todas as janelas e **reinicie o VS Code**.

### 2. Executando o Projeto

#### Obtendo a Chave de API do Gemini (IA)
Para habilitar os resumos automáticos:
1. Acesse o [Google AI Studio](https://aistudio.google.com/).
2. Faça login com sua conta Google.
3. Clique em **"Get API key"** no menu lateral.
4. Crie uma nova chave e copie-a.

#### Configurando as Variáveis de Ambiente
Copie o arquivo de exemplo e preencha com a sua chave:
```bash
cp back-end/.env.example back-end/.env
```

Abra o `back-end/.env` e substitua `sua_chave_aqui` pela chave obtida no passo anterior:
```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/lefxy

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# App
PORT=3001
FOLLOW_UP_DELAY_HOURS=24

# Google Gemini AI
GEMINI_API_KEY=cole_sua_chave_aqui
```

> **Nota:** Ao rodar via Docker Compose, as variáveis `MONGO_URI` e `REDIS_HOST` são sobrescritas automaticamente pelo `docker-compose.yml`. O `.env` é necessário apenas para a `GEMINI_API_KEY`.

#### Subindo o Projeto
Abra o terminal na raiz do projeto e rode:
```bash
docker compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Documentação Swagger**: http://localhost:3001/api#/
- **Logs de Monitoramento**: http://localhost:3000/admin/logs (Requer Login)

## 👤 Credenciais de Acesso (Seed Automático)
O sistema pré-cadastra um usuário administrativo na primeira execução:
- **Usuário**: `admin@lefxy.com`
- **Senha**: `admin123`

## 🛠️ Tecnologias e Funcionalidades

### Backend (NestJS + MongoDB + Redis)
- **Segurança**: Autenticação robusta com JWT e Bcrypt.
- **Proteção Anti-DDoS**: Acoplamos limitadores de tráfego (`@nestjs/throttler`) para proteger a saúde das requisições gerais e blindar a infraestrutura de cobrança de Inteligência Artificial L7.
- **Observabilidade**: Sistema de logs estruturados (Winston) que gera arquivos `.log` diários na pasta `back-end/logs`.
- **IA**: Integração com Google Gemini para análise de contexto de leads.
- **Processamento**: BullMQ + Redis para tarefas de background.

### Frontend (Next.js 15 + Tailwind + Framer Motion)
- **Gerenciamento de Estado**: Migração das interações caóticas de `useState` para a maturidade de estado global nativa do ecossistema React via **Zustand**.
- **Performance de Larga Escala (Kanban)**: Infinite Scroll embutido verticalmente para interações entre colunas nativas a cada base requisitada na Store Zustand, aguentando visualização otimizada para mais de 1000 Leads.
- **Formulários Blindados**: O Sistema foi fortificado *Client-Side* adotando as rigorosidades em tempo real da junção **React Hook Form** + **Zod Validator**. 
- **Dashboard**: UI visual com estética "Dark Glassmorphism".
- **Monitoramento**: Painel administrativo para visualização de logs em tempo real.

## 🧠 Decisões Técnicas e Trade-offs

### Arquitetura de Camadas (Clean Architecture Light)
O projeto segue a estrutura de `modules`, `services` e `controllers`, garantindo que a lógica de negócio (como automação de follow-ups) esteja isolada das rotas da API.

### Persistência com MongoDB
O uso do Mongoose permite validações rápidas e escalabilidade.

### Automação com Redis & BullMQ
Para a funcionalidade de **Follow-up automático (+24h)**, utilizei o **BullMQ** sobre o **Redis**. 
- **Trade-off**: Poderia ser feito um simples `setTimeout` em memória, mas isso se perderia ao reiniciar o container. O Redis garante persistência e previsibilidade, transformando o CRM em uma ferramenta resiliente para produção.

### Kanban & Infinite Scroll Dinâmico
Desenvolver um Painel Kanban clássico em React consumindo a API causaria um gargalo grave no DOM com os 1.017 Leads cadastrados no sistema para teste. 
- **Decisão Arquitetural**: Retiramos a pressão de renderização e dividimos a busca. Implementamos a Store do **Zustand** consumindo requisições na API categorizadas por `stage` e aplicamos o modelo de **Infinite Scroll** que re-alimenta os itens verticalmente coluna a coluna à medida do *Scrolling*, mitigando o Memory-Leak na navegação nativa.

### Observabilidade e Segurança (Bônus)
Implementei **Winston** para logs estruturados e **JWT** para segurança, elevando o projeto de um simples MVP para um sistema com padrões de mercado. Isso facilita a auditoria em casos de erro no processamento da IA.

## 📁 Estrutura de Logs
Os logs do sistema são persistidos e podem ser auditados em:
- `back-end/logs/combined-YYYY-MM-DD.log`: Histórico operacional completo.
- `back-end/logs/error-YYYY-MM-DD.log`: Apenas erros críticos.

---
Desenvolvido com foco em excelência técnica e experiência do usuário (UX).
