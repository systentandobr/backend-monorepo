# Dockerfile simples para Railway
# Versão otimizada para deploy

FROM node:18-alpine

# Definir build args para variáveis de ambiente
ARG USER_DB
ARG PASS_DB
ARG HOST_DB

# Definir variáveis de ambiente durante o build
ENV USER_DB=$USER_DB
ENV PASS_DB=$PASS_DB
ENV HOST_DB=$HOST_DB

# Instalar curl e ferramentas de rede para debug
# RUN apk add --no-cache curl netcat-openbsd telnet bind-tools

# Instalar dependências do sistema
RUN sudo apt update -y && sudo apt install -y \
    gcc \
    g++ \
    curl 
    # && rm -rf /var/lib/apt/lists/*


# ===========================================
# OPÇÕES PARA INSTALAR YARN
# ===========================================

# OPÇÃO 1: Instalar Yarn via npm (mais simples)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt install -y nodejs \
    && npm install -g yarn

# OPÇÃO 2: Instalar Yarn via repositório oficial (mais rápido)
# RUN curl -fsSL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor -o /usr/share/keyrings/yarnkey.gpg \
#     && echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
#     && apt-get update \
#     && apt-get install -y yarn

# OPÇÃO 3: Instalar Yarn via corepack (Node.js 16.10+)
# RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
#     && apt-get install -y nodejs \
#     && corepack enable \
#     && corepack prepare yarn@stable --activate

# OPÇÃO 4: Instalar Yarn via script oficial (mais flexível)
# RUN curl -o- -L https://yarnpkg.com/install.sh | bash

# Configurar diretório de trabalho
WORKDIR /app

# Teste de IP de saída durante o build
RUN echo "=== TESTE DE IP DURANTE BUILD ===" && \
    echo "Data/Hora: $(date)" && \
    echo "IP Público (ifconfig.me):" && \
    curl -s ifconfig.me || echo "Erro ao obter IP" && \
    echo "IP Público (ipinfo.io):" && \
    curl -s ipinfo.io/ip || echo "Erro ao obter IP" && \
    echo "IP Público (icanhazip.com):" && \
    curl -s icanhazip.com || echo "Erro ao obter IP" && \
    echo "=== FIM DO TESTE DE IP ==="

# Copiar script de teste MongoDB
COPY test-mongodb-build.sh /app/test-mongodb-build.sh
RUN chmod +x /app/test-mongodb-build.sh

# Teste de conectividade MongoDB (se variáveis estiverem disponíveis)
RUN /app/test-mongodb-build.sh

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
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#     CMD curl -f http://localhost:3000/debug/health || exit 1

# Comando de inicialização com debug
CMD ["/app/start-with-debug.sh"] 