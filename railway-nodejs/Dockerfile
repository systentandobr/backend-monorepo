# Dockerfile para serviços Node.js no Railway
FROM node:18-alpine AS builder

# Instalar dependências do sistema
RUN apk add --no-cache python3 make g++

# Configurar diretório de trabalho
WORKDIR /app

# Copiar package.json e yarn.lock
COPY package.json yarn.lock* ./

# Instalar dependências
RUN yarn install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build da aplicação
RUN yarn build

# ===========================================
# RUNTIME STAGE
# ===========================================
FROM node:18-alpine AS runtime

# Instalar curl para health checks
RUN apk add --no-cache curl

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Configurar diretório de trabalho
WORKDIR /app

# Copiar node_modules e arquivos buildados
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# Mudar para usuário não-root
USER nestjs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Comando de inicialização
CMD ["node", "dist/main"]
