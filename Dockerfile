# Dockerfile simples para Railway
# Versão otimizada para deploy

FROM node:18-alpine

# Instalar curl e ferramentas de rede para debug
RUN apk add --no-cache curl netcat-openbsd telnet

# Instalar yarn
RUN npm install -g yarn

# Configurar diretório de trabalho
WORKDIR /app

# Copiar package.json limpo
COPY nodejs/apis/package.json.clean ./package.json

# Instalar dependências com yarn
RUN yarn install --frozen-lockfile

# Copiar código fonte
COPY nodejs/apis/apps/ ./apps/
COPY nodejs/apis/libs/ ./libs/
COPY nodejs/apis/nest-cli.json ./
COPY nodejs/apis/tsconfig*.json ./
COPY nodejs/apis/.eslintrc.js ./
COPY nodejs/apis/.prettierrc ./

# Copiar scripts de debug
COPY debug-railway.sh /app/debug-railway.sh
COPY start-with-debug.sh /app/start-with-debug.sh
RUN chmod +x /app/debug-railway.sh /app/start-with-debug.sh

# Build da aplicação
RUN yarn build

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/debug/health || exit 1

# Comando de inicialização com debug
CMD ["/app/start-with-debug.sh"] 