# Dockerfile para serviços Python no Railway
FROM python:3.11-slim AS builder

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# ===========================================
# OPÇÕES PARA INSTALAR YARN
# ===========================================

# OPÇÃO 1: Instalar Yarn via npm (mais simples)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
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

# Copiar requirements primeiro (para cache de layers)
COPY life-tracker/agent-onboarding/requirements.txt /app/requirements.txt

# Instalar dependências Python
RUN pip install --no-cache-dir -r /app/requirements.txt

# ===========================================
# RUNTIME STAGE
# ===========================================
FROM python:3.11-slim AS runtime

# Instalar curl para health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root
RUN groupadd -r python && useradd -r -g python python

# Configurar diretório de trabalho
WORKDIR /app

# Copiar dependências instaladas
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copiar Node.js e Yarn do builder (se necessário)
COPY --from=builder /usr/bin/node /usr/bin/node
COPY --from=builder /usr/bin/npm /usr/bin/npm
COPY --from=builder /usr/bin/yarn /usr/bin/yarn
COPY --from=builder /usr/local/bin/yarn /usr/local/bin/yarn

# Copiar código fonte do projeto
COPY life-tracker/agent-onboarding/ /app/

# Mudar permissões
RUN chown -R python:python /app

# Mudar para usuário não-root
USER python

# Expor porta
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Comando de inicialização
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
