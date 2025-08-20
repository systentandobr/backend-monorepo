# Dockerfile para serviços Go no Railway
FROM golang:1.21-alpine AS builder

# Instalar dependências do sistema
RUN apk add --no-cache git ca-certificates tzdata

# Configurar diretório de trabalho
WORKDIR /app

# Copiar go mod files
COPY go.mod go.sum ./

# Download dependências
RUN go mod download

# Copiar código fonte
COPY . .

# Build da aplicação
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/api

# ===========================================
# RUNTIME STAGE
# ===========================================
FROM alpine:latest

# Instalar curl para health checks
RUN apk --no-cache add ca-certificates curl

# Criar usuário não-root
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Configurar diretório de trabalho
WORKDIR /root/

# Copiar binário compilado
COPY --from=builder /app/main .

# Mudar permissões
RUN chown -R appuser:appgroup /root/

# Mudar para usuário não-root
USER appuser

# Expor porta
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Comando de inicialização
CMD ["./main"]
