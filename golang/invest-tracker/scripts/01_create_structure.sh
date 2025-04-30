#!/bin/bash
# 01_create_structure.sh - Cria a estrutura básica de diretórios do projeto

# Cores para formatação do output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Verifica se o diretório base foi fornecido
if [ $# -lt 1 ]; then
  echo "Uso: $0 <base_dir>"
  exit 1
fi

BASE_DIR=$1

echo "Criando estrutura de diretórios em: $BASE_DIR"

# Função para criar um diretório se não existir
create_dir() {
  if [ ! -d "$1" ]; then
    mkdir -p "$1"
    echo -e "${GREEN}Diretório criado:${NC} $1"
  else
    echo -e "${YELLOW}Diretório já existe:${NC} $1"
  fi
}

# Entrar no diretório base
cd "$BASE_DIR" || exit 1

# Criar estrutura principal
create_dir "cmd/api"
create_dir "cmd/jobs"
create_dir "cmd/templates"

# Criar estrutura de pacotes comuns
create_dir "pkg/common/errors"
create_dir "pkg/common/logger"
create_dir "pkg/common/utils"

# Criar estrutura de infraestrutura
create_dir "pkg/infrastructure/database/mongodb"
create_dir "pkg/infrastructure/database/redis"
create_dir "pkg/infrastructure/http"
create_dir "pkg/infrastructure/messaging/kafka"
create_dir "pkg/infrastructure/messaging/rabbitmq"
create_dir "pkg/infrastructure/services/b3"
create_dir "pkg/infrastructure/services/binance"
create_dir "pkg/infrastructure/services/notifications"

# Criar estrutura da camada de domínio
create_dir "internal/domain/asset/entity"
create_dir "internal/domain/asset/repository"
create_dir "internal/domain/asset/service"
create_dir "internal/domain/asset/valueobject"

create_dir "internal/domain/analysis/entity"
create_dir "internal/domain/analysis/repository"
create_dir "internal/domain/analysis/service"
create_dir "internal/domain/analysis/strategy"

create_dir "internal/domain/simulation/entity"
create_dir "internal/domain/simulation/repository"
create_dir "internal/domain/simulation/service"

create_dir "internal/domain/notification/entity"
create_dir "internal/domain/notification/repository"
create_dir "internal/domain/notification/service"

create_dir "internal/domain/user/entity"
create_dir "internal/domain/user/repository"
create_dir "internal/domain/user/service"

# Criar estrutura da camada de aplicação
create_dir "internal/application/asset"
create_dir "internal/application/analysis"
create_dir "internal/application/simulation"
create_dir "internal/application/notification"
create_dir "internal/application/user"

# Criar estrutura de portas
create_dir "internal/ports/input"
create_dir "internal/ports/output"

# Criar estrutura de adaptadores
create_dir "internal/adapter/controller"
create_dir "internal/adapter/presenter"
create_dir "internal/adapter/persistence"
create_dir "internal/adapter/external"

# Criar estrutura para frontend
create_dir "web/src/components"
create_dir "web/src/pages"
create_dir "web/src/hooks"
create_dir "web/src/store"
create_dir "web/public"

# Criar estrutura para deploy
create_dir "deploy/docker/api"
create_dir "deploy/docker/job-collector"
create_dir "deploy/docker/job-analyzer"
create_dir "deploy/kubernetes"

# Criar diretórios para testes e documentação
create_dir "test"
create_dir "docs"

echo "Estrutura de diretórios criada com sucesso!"