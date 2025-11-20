# Life Tracker n8n Workflows - Guia Windows

Este guia explica como usar os workflows n8n no Windows com Docker Desktop.

## 📋 Pré-requisitos

### 1. **Docker Desktop**
- Instale o [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop/)
- Certifique-se de que está rodando (ícone na bandeja do sistema)

### 2. **Git Bash ou PowerShell**
- Use Git Bash (recomendado) ou PowerShell
- Certifique-se de que `curl` está disponível

## 🚀 Instalação Rápida

### **Opção 1: Menu Interativo (Recomendado)**
```cmd
menu-windows.bat
```

### **Opção 2: Deploy Direto**
```cmd
deploy-windows.bat
```

## 📁 Arquivos de Script

| Arquivo | Descrição |
|---------|-----------|
| `menu-windows.bat` | Menu interativo principal |
| `deploy-windows.bat` | Deploy completo dos serviços |
| `stop-windows.bat` | Parar todos os serviços |
| `test-windows.bat` | Testar workflows |

## 🔧 Como Usar

### **1. Primeira Execução**

1. **Abra o Git Bash** ou PowerShell como administrador
2. **Navegue até a pasta** dos workflows:
   ```cmd
   cd python/life-tracker/agent-onboarding/n8n-workflows
   ```
3. **Execute o menu principal**:
   ```cmd
   menu-windows.bat
   ```
4. **Escolha a opção 1** para deploy completo

### **2. Acessar o n8n**

Após o deploy, acesse:
- **URL**: http://localhost:5678
- **Usuário**: admin
- **Senha**: Admin123! (ou a senha gerada no .env)

### **3. Importar Workflows**

1. **Faça login** no n8n
2. **Clique em "Import"** no menu superior
3. **Importe os arquivos**:
   - `onboarding-workflow.json`
   - `error-handling-workflow.json`

### **4. Configurar Conexões**

1. **MongoDB Connection**:
   - Host: `host.docker.internal`
   - Port: `27017`
   - Database: `life_tracker`
   - Username: `life_tracker_user`
   - Password: `MongoApp123!` (ou a senha do .env)

2. **Teste a conexão** e salve

### **5. Testar Workflows**

Execute o script de teste:
```cmd
test-windows.bat
```

## 📊 Serviços Incluídos

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| **n8n** | 5678 | Interface principal |
| **MongoDB** | 27017 | Banco de dados principal |
| **PostgreSQL** | 5432 | Banco do n8n |
| **Redis** | 6379 | Cache e filas |

## 🔗 Endpoints Disponíveis

Após importar os workflows, estes endpoints estarão disponíveis:

- `POST /webhook/onboarding-complete` - Onboarding completo
- `POST /webhook/onboarding-analyze` - Análise de perfil
- `POST /webhook/onboarding-generate` - Geração de plano
- `GET /webhook/onboarding-templates` - Listar templates
- `GET /webhook/onboarding-user-plan/:user_id` - Plano do usuário
- `GET /webhook/onboarding-user-profile/:user_id` - Perfil do usuário
- `GET /webhook/onboarding-status` - Status do serviço

## 🧪 Exemplo de Teste

```bash
# Teste de onboarding completo
curl -X POST http://localhost:5678/webhook/onboarding-complete \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "session_id": "test_session_456",
    "questions_and_answers": [
      {
        "question_id": "concentration",
        "question_text": "Você acha difícil se concentrar?",
        "question_type": "text",
        "question_category": "general",
        "answer": "medium-focus",
        "answered_at": "2024-01-15T10:30:00Z",
        "context": {"step": 15, "required": true}
      }
    ],
    "user_metadata": {
      "source": "test",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  }'
```

## 🔍 Troubleshooting

### **Problema: Docker não está rodando**
```
Solução: Inicie o Docker Desktop e aguarde até aparecer "Docker Desktop is running"
```

### **Problema: Porta já está em uso**
```
Solução: Pare outros serviços que usam as portas 5678, 27017, 5432, 6379
```

### **Problema: n8n não carrega**
```
Solução: 
1. Verifique se o container está rodando: docker ps
2. Verifique os logs: docker logs life-tracker-n8n
3. Aguarde mais tempo (pode demorar até 2 minutos)
```

### **Problema: MongoDB não conecta**
```
Solução:
1. Verifique se o container está rodando: docker ps
2. Verifique os logs: docker logs life-tracker-mongo
3. Aguarde a inicialização completa (pode demorar 1-2 minutos)
```

### **Problema: Workflows não funcionam**
```
Solução:
1. Verifique se os workflows foram importados corretamente
2. Verifique se as conexões MongoDB estão configuradas
3. Execute o script de teste para diagnosticar
```

## 📝 Logs e Debugging

### **Ver logs de um serviço específico:**
```cmd
# n8n
docker logs -f life-tracker-n8n

# MongoDB
docker logs -f life-tracker-mongo

# PostgreSQL
docker logs -f life-tracker-postgres

# Redis
docker logs -f life-tracker-redis
```

### **Ver status de todos os containers:**
```cmd
docker ps --filter "name=life-tracker"
```

### **Verificar conectividade:**
```cmd
# n8n
curl http://localhost:5678/healthz

# MongoDB
docker exec life-tracker-mongo mongosh --eval "db.adminCommand('ping')"

# PostgreSQL
docker exec life-tracker-postgres pg_isready -U n8n

# Redis
docker exec life-tracker-redis redis-cli ping
```

## 🗂️ Estrutura de Dados

### **Diretórios criados:**
```
n8n-workflows/
├── n8n_data/          # Dados do n8n
├── mongo_data/        # Dados do MongoDB
├── postgres_data/     # Dados do PostgreSQL
├── logs/              # Logs dos serviços
└── .env               # Variáveis de ambiente
```

### **Collections MongoDB:**
- `profile_analyses` - Análises de perfil
- `user_plans` - Planos dos usuários
- `user_sessions` - Sessões dos usuários
- `templates` - Templates disponíveis
- `workflow_logs` - Logs dos workflows

## 🔄 Comandos Úteis

### **Parar todos os serviços:**
```cmd
stop-windows.bat
```

### **Reiniciar um serviço específico:**
```cmd
# Parar
docker stop life-tracker-n8n

# Iniciar
docker start life-tracker-n8n
```

### **Limpar tudo e começar do zero:**
```cmd
# Use o menu interativo (opção 9)
menu-windows.bat
```

### **Backup dos dados:**
```cmd
# Backup do MongoDB
docker exec life-tracker-mongo mongodump --db life_tracker --out /tmp/backup
docker cp life-tracker-mongo:/tmp/backup ./backup_mongodb

# Backup do n8n
xcopy n8n_data backup_n8n /E /I
```

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** usando o menu interativo
2. **Execute o script de teste** para diagnosticar
3. **Consulte a documentação** do n8n: https://docs.n8n.io/
4. **Verifique se o Docker Desktop** está funcionando corretamente

## 🎉 Próximos Passos

Após o deploy bem-sucedido:

1. **Importe os workflows** no n8n
2. **Configure as conexões** MongoDB
3. **Execute os testes** para validar
4. **Integre com sua aplicação** usando os webhooks
5. **Monitore os logs** para debugging

---

**Desenvolvido com ❤️ para Windows + Docker Desktop**
