#!/bin/bash

# Script para importar dados no MongoDB
# Uso: ./import-to-mongodb.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Configurações
DB_NAME="life_tracker"
COLLECTION_NAME="integrated_routines"
FILE_NAME="integrated-plan-output.json"
MONGO_URI="mongodb+srv://username:password@cluster0.heuaa2f.mongodb.net/${DB_NAME}?retryWrites=true&w=majority"

log "🚀 Iniciando importação no MongoDB..."

# Verificar se o arquivo existe
if [ ! -f "$FILE_NAME" ]; then
    error "Arquivo $FILE_NAME não encontrado!"
    log "Execute primeiro: node simple-import.js"
    exit 1
fi

# Verificar se mongoimport está disponível
if ! command -v mongoimport &> /dev/null; then
    error "mongoimport não está instalado!"
    log "Instale o MongoDB Database Tools:"
    log "  Ubuntu/Debian: sudo apt-get install mongodb-database-tools"
    log "  macOS: brew install mongodb/brew/mongodb-database-tools"
    log "  Windows: Baixe de https://www.mongodb.com/try/download/database-tools"
    exit 1
fi

# Backup dos dados existentes (opcional)
log "Fazendo backup dos dados existentes..."
mongosh "$MONGO_URI" --eval "
  use $DB_NAME;
  if (db.$COLLECTION_NAME.countDocuments() > 0) {
    db.$COLLECTION_NAME.find().forEach(function(doc) {
      db.backup_${COLLECTION_NAME}_$(date +%Y%m%d_%H%M%S).insertOne(doc);
    });
    print('Backup criado com sucesso');
  } else {
    print('Nenhum dado existente para backup');
  }
" --quiet

# Limpar dados existentes
log "Limpando dados existentes..."
mongosh "$MONGO_URI" --eval "
  use $DB_NAME;
  db.$COLLECTION_NAME.deleteMany({});
  print('Dados existentes removidos');
" --quiet

# Importar novos dados
log "Importando dados do arquivo $FILE_NAME..."
mongoimport \
  --uri "$MONGO_URI" \
  --collection "$COLLECTION_NAME" \
  --file "$FILE_NAME" \
  --jsonArray \
  --drop

if [ $? -eq 0 ]; then
    success "✅ Importação concluída com sucesso!"
    
    # Verificar dados importados
    log "Verificando dados importados..."
    COUNT=$(mongosh "$MONGO_URI" --eval "use $DB_NAME; db.$COLLECTION_NAME.countDocuments()" --quiet)
    success "📊 $COUNT documentos importados"
    
    # Mostrar resumo
    log "Resumo da importação:"
    mongosh "$MONGO_URI" --eval "
      use $DB_NAME;
      print('=== RESUMO DA IMPORTAÇÃO ===');
      print('Database: ' + db.getName());
      print('Collection: $COLLECTION_NAME');
      print('Total de documentos: ' + db.$COLLECTION_NAME.countDocuments());
      
      // Mostrar primeiros documentos
      print('\\nPrimeiros documentos:');
      db.$COLLECTION_NAME.find().limit(3).forEach(function(doc) {
        print('- ' + (doc.name || doc.schema_version || 'Documento sem nome'));
      });
    " --quiet
    
else
    error "❌ Falha na importação!"
    exit 1
fi

log "🎉 Processo concluído!"
log "Para verificar os dados:"
log "  mongosh \"$MONGO_URI\""
log "  use $DB_NAME"
log "  db.$COLLECTION_NAME.find().pretty()" 