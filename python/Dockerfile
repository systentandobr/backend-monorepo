# Dockerfile para serviços Python no Railway
FROM python:3.11-slim-bookworm AS builder

# Configurar variáveis de ambiente para melhorar a conectividade
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Configurar diretório de trabalho
WORKDIR /app

# Configurar DNS alternativos para melhorar conectividade
# RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf && \
#     echo "nameserver 8.8.4.4" >> /etc/resolv.conf

# Atualizar pip para versão mais recente
RUN pip install --upgrade pip setuptools wheel

# Copiar requirements primeiro (para cache de layers)
COPY python/life-tracker/agent-onboarding/requirements.txt /app/requirements.txt

# Instalar dependências Python com retry e timeout
RUN pip install --no-cache-dir --timeout 100 --retries 3 -U -r /app/requirements.txt
RUN pip install -U agno openai groq
RUN pip install -U tavily-python
# ===========================================
# RUNTIME STAGE
# ===========================================
FROM python:3.11-slim-bookworm AS runtime

# Configurar variáveis de ambiente
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Criar usuário não-root
RUN groupadd -r python && useradd -r -g python python

# Configurar diretório de trabalho
WORKDIR /app

# Copiar dependências instaladas
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copiar código fonte do projeto
RUN ls -la /app
RUN pwd
COPY python/life-tracker/agent-onboarding/ /app/

# Mudar permissões
RUN chown -R python:python /app

# Mudar para usuário não-root
USER python

# Expor porta
EXPOSE 8000


# # Health check
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#     CMD curl -f http://0.0.0.0:8000/health || exit 1

# Adicionar logs de debug
RUN echo "=== Verificando estrutura de arquivos ===" && \
    ls -la /app && \
    echo "=== Verificando Python path ===" && \
    python -c "import sys; print('\\n'.join(sys.path))" && \
    echo "=== Verificando imports ===" && \
    python -c "import fastapi; print('FastAPI OK')" && \
    python -c "import uvicorn; print('Uvicorn OK')"

# Usar script de inicialização
# CMD ["python", "run_script.py" "main"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "debug"]
