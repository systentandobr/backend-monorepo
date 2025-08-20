# Dockerfile para serviços Python no Railway
FROM python:3.11-slim AS builder

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Configurar diretório de trabalho
WORKDIR /app

# Copiar requirements
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt

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

# Copiar código fonte
COPY . .

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
