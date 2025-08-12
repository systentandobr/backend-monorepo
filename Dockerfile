# Dockerfile Principal - Backend Monorepo
# Agrupa serviços por tecnologia usando multi-stage build

# ===========================================
# STAGE 1: NODE.JS SERVICES
# ===========================================
FROM node:18-alpine AS nodejs-builder

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Configurar diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração do Node.js
COPY nodejs/apis/package*.json ./nodejs/apis/
COPY nodejs/apis/pnpm*.yaml ./nodejs/apis/
# COPY nodejs/catalog-products/package*.json ./nodejs/catalog-products/

# Instalar dependências
WORKDIR /app/nodejs/apis
RUN pnpm install --frozen-lockfile

# WORKDIR /app/nodejs/catalog-products
# RUN npm install

# Copiar código fonte
COPY nodejs/apis/ ./nodejs/apis/
# COPY nodejs/catalog-products/ ./nodejs/catalog-products/

# Build das aplicações Node.js
WORKDIR /app/nodejs/apis
RUN pnpm run build

# WORKDIR /app/nodejs/catalog-products
# RUN npm run build

# ===========================================
# STAGE 2: PYTHON SERVICES
# ===========================================
FROM python:3.11-slim AS python-builder

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar requirements
COPY python/meu-nutri/requirements.txt ./python/meu-nutri/

# Instalar dependências Python
WORKDIR /app/python/meu-nutri
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fonte Python
COPY python/meu-nutri/ ./python/meu-nutri/

# ===========================================
# STAGE 3: GOLANG SERVICES
# ===========================================
FROM golang:1.21-alpine AS golang-builder

# Instalar dependências do sistema
RUN apk add --no-cache git

WORKDIR /app

# Copiar go.mod e go.sum
COPY golang/go.mod golang/go.sum ./

# Download dependencies
RUN go mod download

# Copiar código fonte Go
COPY golang/ ./

# Build das aplicações Go
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/invest-tracker ./invest-tracker/cmd
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/zen-launcher ./zen-launcher/cmd
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/catalog-structure ./catalog-strutucture/cmd
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/business ./business/cmd

# ===========================================
# STAGE 4: RUNTIME IMAGE
# ===========================================
FROM ubuntu:22.04 AS runtime

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    ca-certificates \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root
RUN useradd -m -u 1000 appuser

# Configurar diretórios
WORKDIR /app
RUN mkdir -p /app/services/nodejs /app/services/python /app/services/golang /app/logs

# Copiar binários Go
COPY --from=golang-builder /app/invest-tracker /app/services/golang/
COPY --from=golang-builder /app/zen-launcher /app/services/golang/
COPY --from=golang-builder /app/catalog-structure /app/services/golang/
COPY --from=golang-builder /app/business /app/services/golang/

# Copiar aplicações Node.js
COPY --from=nodejs-builder /app/nodejs/apis/dist /app/services/nodejs/apis
COPY --from=nodejs-builder /app/nodejs/apis/node_modules /app/services/nodejs/apis/node_modules
COPY --from=nodejs-builder /app/nodejs/apis/package.json /app/services/nodejs/apis/
# COPY --from=nodejs-builder /app/nodejs/catalog-products/dist /app/services/nodejs/catalog-products
# COPY --from=nodejs-builder /app/nodejs/catalog-products/node_modules /app/services/nodejs/catalog-products/node_modules
# COPY --from=nodejs-builder /app/nodejs/catalog-products/package.json /app/services/nodejs/catalog-products/

# Copiar aplicações Python
COPY --from=python-builder /app/python/meu-nutri /app/services/python/meu-nutri
COPY --from=python-builder /usr/local/lib/python3.11/site-packages /app/services/python/meu-nutri/lib

# Copiar scripts de inicialização
COPY deploy/scripts/ /app/scripts/
RUN chmod +x /app/scripts/*.sh

# Definir permissões
RUN chown -R appuser:appuser /app

# Mudar para usuário não-root
USER appuser

# Expor portas
EXPOSE 3000 3001 8000 8001 8080 8081 8082 8083

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Comando de inicialização
CMD ["/app/scripts/start-services.sh"] 