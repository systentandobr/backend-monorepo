# 🔧 Solução de Problemas de Conectividade no Docker

Este documento explica como resolver problemas de conectividade durante o build de imagens Docker Python.

## 🚨 Problema Identificado

O erro que você está enfrentando é comum e está relacionado à resolução de DNS dentro do container Docker:

```
ERROR: Could not find a version that satisfies the requirement fastapi==0.104.1
ERROR: No matching distribution found for fastapi==0.104.1
```

## 🔍 Causas Comuns

1. **Problemas de DNS**: O container não consegue resolver nomes de domínio
2. **Problemas de rede**: Firewall ou proxy bloqueando conexões
3. **Configuração do Docker daemon**: DNS mal configurado
4. **Problemas de conectividade**: Internet instável ou restrita

## ✅ Soluções Implementadas

### 1. Dockerfile Otimizado

O Dockerfile foi melhorado com:

- **DNS alternativos**: Configuração de DNS do Google (8.8.8.8, 8.8.4.4)
- **Timeouts e retries**: Configuração de timeout e retry para pip
- **Variáveis de ambiente**: Otimizações para melhor conectividade
- **Upgrade do pip**: Instalação da versão mais recente do pip

### 2. Scripts de Diagnóstico

#### `test-connectivity.sh`
Testa a conectividade antes do build:
```bash
./test-connectivity.sh
```

#### `build-docker.sh`
Script de build com múltiplas estratégias:
```bash
./build-docker.sh
```

## 🛠️ Como Usar

### Opção 1: Script Automático (Recomendado)
```bash
cd python/
./build-docker.sh
```

### Opção 2: Build Manual com DNS
```bash
# Com DNS do Google
docker build --dns=8.8.8.8 --dns=8.8.4.4 -t python-app .

# Com DNS da Cloudflare
docker build --dns=1.1.1.1 --dns=1.0.0.1 -t python-app .

# Com rede do host
docker build --network=host -t python-app .
```

### Opção 3: Build com Proxy (se necessário)
```bash
# Configurar proxy
export HTTP_PROXY=http://proxy:port
export HTTPS_PROXY=http://proxy:port

# Build
docker build -t python-app .
```

## 🔧 Configurações Adicionais

### 1. Configurar DNS no Docker Daemon

Crie ou edite `/etc/docker/daemon.json`:
```json
{
  "dns": ["8.8.8.8", "8.8.4.4"],
  "dns-opts": ["timeout:2", "attempts:3"]
}
```

Reinicie o Docker:
```bash
sudo systemctl restart docker
```

### 2. Configurar DNS no Sistema

Edite `/etc/resolv.conf`:
```
nameserver 8.8.8.8
nameserver 8.8.4.4
nameserver 1.1.1.1
```

### 3. Usar BuildKit

Habilite o BuildKit para builds mais rápidos:
```bash
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

## 🚀 Estratégias de Build

O script `build-docker.sh` tenta automaticamente estas estratégias:

1. **default**: Build padrão
2. **host-network**: Usa rede do host
3. **dns-google**: DNS do Google
4. **dns-cloudflare**: DNS da Cloudflare
5. **no-cache**: Build sem cache

## 🔍 Debug e Diagnóstico

### Verificar conectividade do container
```bash
docker run --rm python-app nslookup pypi.org
docker run --rm python-app curl -I https://pypi.org
```

### Entrar no container para debug
```bash
docker run -it --entrypoint /bin/bash python-app
```

### Verificar logs do build
```bash
docker build --progress=plain -t python-app .
```

## 📋 Checklist de Verificação

- [ ] Internet funcionando
- [ ] DNS configurado corretamente
- [ ] Docker daemon configurado
- [ ] Sem firewall bloqueando
- [ ] Proxy configurado (se necessário)
- [ ] VPN desabilitada (se causar conflito)

## 🆘 Se Nada Funcionar

1. **Use uma imagem base diferente**:
   ```dockerfile
   FROM python:3.11-alpine
   ```

2. **Use um registry local**:
   ```bash
   pip install --index-url http://localhost:8080/simple/ -r requirements.txt
   ```

3. **Build offline**:
   ```bash
   pip download -r requirements.txt -d ./packages
   pip install --no-index --find-links ./packages -r requirements.txt
   ```

4. **Use Docker Buildx**:
   ```bash
   docker buildx build --platform linux/amd64 -t python-app .
   ```

## 📞 Suporte

Se ainda tiver problemas, verifique:
- Logs do Docker: `docker system info`
- Configuração de rede: `docker network ls`
- Status do daemon: `docker info`
