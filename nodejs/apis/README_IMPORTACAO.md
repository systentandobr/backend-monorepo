# 📥 Scripts de Importação de Dados - Life Tracker

Este diretório contém scripts para importar dados do arquivo `plano_jogo_rotinas.json` para o banco de dados através das APIs do Life Tracker.

## 📋 Pré-requisitos

### 1. Dependências
```bash
# Instalar axios para requisições HTTP
npm install axios
```

### 2. Serviços em Execução
- ✅ API Life Tracker rodando na porta 9090
- ✅ MongoDB conectado e funcionando
- ✅ Arquivo `plano_jogo_rotinas.json` em `assets/data/`

### 3. Verificar Conectividade
```bash
# Testar se a API está funcionando
curl http://localhost:9090/life-tracker/health
```

### 4. MongoDB Database Tools (para import-to-mongodb.sh)
```bash
# Ubuntu/Debian
sudo apt-get install mongodb-database-tools

# macOS
brew install mongodb/brew/mongodb-database-tools

# Windows
# Baixe de https://www.mongodb.com/try/download/database-tools
```

## 🚀 Scripts Disponíveis

### 1. Script Principal (Recomendado)
```bash
# Executar importação completa
node import-all-data.js

# Ver ajuda
node import-all-data.js --help
```

### 2. Scripts Individuais

#### Importar Dados Básicos
```bash
# Importa hábitos, dados de gamificação, etc.
node import-data.js
```

#### Criar Plano Integrado
```bash
# Cria o plano integrado completo
node create-integrated-plan.js
```

#### Script Simples (Sem dependências)
```bash
# Processa dados sem dependências externas
node simple-import.js
```

#### Importar no MongoDB
```bash
# Importa dados processados no MongoDB (requer MongoDB Database Tools)
./import-to-mongodb.sh
```

## 🗄️ Importação no MongoDB

### Comando mongoimport

Após executar os scripts, você pode importar os dados no MongoDB usando:

```bash
# Para MongoDB local
mongoimport --db life_tracker --collection integrated_routines --file integrated-plan-output.json

# Para MongoDB Atlas (substitua as credenciais)
mongoimport --uri "mongodb+srv://username:password@cluster.mongodb.net/life_tracker" --collection integrated_routines --file integrated-plan-output.json

# Para MongoDB com autenticação
mongoimport --db life_tracker --host localhost:27017 --username user --password pass --collection integrated_routines --file integrated-plan-output.json
```

### Exemplo com MongoDB Atlas

```bash
mongoimport \
  --uri "mongodb+srv://studies-for-devs-team-lead:kDwJ4lMIY32xu3yE@cluster0.heuaa2f.mongodb.net/life_tracker?retryWrites=true&w=majority" \
  --collection integratedroutines \
  --file integrated-plan-output.json \
```

### Verificar Importação

```bash
# Conectar ao MongoDB
mongosh "mongodb+srv://studies-for-devs-team-lead:kDwJ4lMIY32xu3yE@cluster0.heuaa2f.mongodb.net/life_tracker"

# Verificar dados importados
use life_tracker
db.integrated_routines.find().pretty()
db.integrated_routines.countDocuments()
```

## 📊 O que é Importado

### ✅ Dados Processados

#### **Domínios**
- **Healthness**: Hábitos de saúde, exames, dieta, suplementação
- **Finances**: Portfólio, metas financeiras, ativos
- **Business**: Oportunidades, projetos, plano de negócios
- **Productivity**: Metas de produtividade

#### **Componentes**
- **Hábitos**: Por domínio com ícones, cores, descrições
- **Gamificação**: Tabuleiro, milestones, regras de pontuação
- **Planos de Refeições**: Menu semanal completo
- **Metas Integradas**: Objetivos que cruzam domínios
- **Rotinas Diárias**: Cronograma de atividades
- **Perfil do Usuário**: Dados pessoais e observações
- **Configurações de UI**: Cores e ícones por domínio

### 📁 Estrutura de Arquivos

```
├── import-all-data.js          # Script principal
├── import-data.js              # Importação de dados básicos
├── create-integrated-plan.js   # Criação do plano integrado
├── simple-import.js            # Script simples sem dependências
├── import-to-mongodb.sh        # Script para importar no MongoDB
├── README_IMPORTACAO.md        # Este arquivo
├── assets/
│   └── data/
│       └── plano_jogo_rotinas.json  # Dados de origem
└── integrated-plan-output.json # Dados processados (gerado)
```

## 🔧 Configuração

### Variáveis de Configuração

Os scripts usam as seguintes configurações padrão:

```javascript
const API_BASE_URL = 'http://localhost:9090';
const DATA_FILE_PATH = path.join(__dirname, 'assets', 'data', 'plano_jogo_rotinas.json');
```

### Personalizar Configuração

Para alterar a URL da API ou caminho do arquivo, edite as constantes no início de cada script.

## 📈 Fluxo de Execução

### Etapa 1: Importação de Dados Básicos
1. ✅ Verifica conectividade com a API
2. ✅ Lê arquivo JSON de dados
3. ✅ Processa hábitos por domínio
4. ✅ Cria dados de gamificação
5. ✅ Processa planos de refeições
6. ✅ Importa dados específicos por domínio

### Etapa 2: Criação do Plano Integrado
1. ✅ Prepara dados consolidados
2. ✅ Valida estrutura dos dados
3. ✅ Gera arquivo de saída
4. ✅ Simula salvamento no banco

## 🧪 Testando a Importação

### Verificar Dados Importados

```bash
# Verificar plano integrado
curl http://localhost:9090/routines/integrated-plan

# Verificar hábitos por domínio
curl http://localhost:9090/routines/habits/healthness
curl http://localhost:9090/routines/habits/finances
curl http://localhost:9090/routines/habits/business
curl http://localhost:9090/routines/habits/productivity

# Verificar metas integradas
curl http://localhost:9090/routines/integrated-goals
```

### Logs de Execução

Os scripts fornecem logs detalhados com cores:

- 🟢 **Verde**: Sucesso
- 🔴 **Vermelho**: Erro
- 🔵 **Azul**: Informação
- 🟡 **Amarelo**: Aviso
- 🟣 **Magenta**: Título de seção
- 🔵 **Ciano**: Detalhes

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. API não disponível
```
❌ API não está disponível: Erro de conexão
```
**Solução**: Verifique se a aplicação está rodando na porta 9090

#### 2. Arquivo não encontrado
```
❌ Arquivo não encontrado: assets/data/plano_jogo_rotinas.json
```
**Solução**: Verifique se o arquivo existe no caminho correto

#### 3. Erro de CORS
```
❌ Erro CORS: Access-Control-Allow-Origin
```
**Solução**: Verifique se o CORS está configurado corretamente

#### 4. Erro de MongoDB
```
❌ Erro ao salvar no banco: Connection failed
```
**Solução**: Verifique se o MongoDB está rodando e acessível

### Logs Detalhados

Para obter mais informações sobre erros:

```bash
# Executar com logs detalhados
DEBUG=* node import-all-data.js
```

## 🔄 Reimportação

### Limpar Dados Existentes

Para reimportar dados, primeiro limpe os dados existentes:

```bash
# Via MongoDB Compass ou mongosh
mongosh "mongodb+srv://studies-for-devs-team-lead:kDwJ4lMIY32xu3yE@cluster0.heuaa2f.mongodb.net/life_tracker"

# No shell do MongoDB
use life_tracker
db.routines.deleteMany({})
db.integrated_routines.deleteMany({})
db.habits.deleteMany({})
db.categories.deleteMany({})
```

### Executar Reimportação

```bash
# Executar importação completa novamente
node import-all-data.js

# Ou executar scripts individuais
node simple-import.js
node create-integrated-plan.js
```

## 📝 Personalização

### Adicionar Novos Domínios

Para adicionar suporte a novos domínios:

1. Edite o arquivo `plano_jogo_rotinas.json`
2. Adicione o novo domínio na estrutura `domains`
3. Atualize os scripts para processar o novo domínio

### Modificar Estrutura de Dados

Para alterar a estrutura dos dados:

1. Atualize os schemas do MongoDB
2. Modifique os scripts de importação
3. Teste com dados de exemplo

## 🤝 Contribuição

### Melhorias Sugeridas

- [ ] Adicionar validação de dados
- [ ] Implementar rollback em caso de erro
- [ ] Adicionar suporte a múltiplos usuários
- [ ] Criar interface web para importação
- [ ] Adicionar logs estruturados (JSON)

### Reportar Problemas

Para reportar problemas ou sugerir melhorias:

1. Verifique se o problema não está listado em Troubleshooting
2. Colete logs detalhados
3. Descreva os passos para reproduzir o problema

## 📚 Recursos Adicionais

- [Documentação da API Life Tracker](./CORS_CONFIGURATION.md)
- [Estrutura de Dados](./assets/data/plano_jogo_rotinas.json)
- [Schemas MongoDB](../apps/life-tracker/src/modules/routines/schemas/)

---

**Última atualização**: 13/08/2025  
**Versão**: 1.0.0 