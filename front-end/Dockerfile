FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependências ----
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---- Builder ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Usar modo standalone do Next.js se configurado no next.config.js, ou build normal
# Para funcionar bem em container, desabilitamos o Lint rigoroso no CI/Build em caso de avisos 
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# ---- Produção ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# O Next.js com 'output: standalone' agrupa tudo no dir .next/standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
