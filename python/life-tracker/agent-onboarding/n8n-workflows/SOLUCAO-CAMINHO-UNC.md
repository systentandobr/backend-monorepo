# 🔧 Solução para Problema de Caminho UNC

## ❌ **Problema Identificado**

Você está tentando executar o script `.bat` a partir de um caminho UNC (`\\wsl$\Ubuntu\...`) que não é suportado pelo CMD do Windows.

## ✅ **Soluções Disponíveis**

### **Opção 1: PowerShell (Recomendado)**

1. **Abra o PowerShell como Administrador**
2. **Navegue até a pasta dos workflows:**
   ```powershell
   cd "\\wsl$\Ubuntu\home\marcelio\developing\systentando\backend-monorepo\python\life-tracker\agent-onboarding\n8n-workflows"
   ```
3. **Execute o script PowerShell:**
   ```powershell
   .\deploy-windows.ps1
   ```

### **Opção 2: Script WSL + Windows**

1. **Abra o CMD como Administrador**
2. **Execute o script corrigido:**
   ```cmd
   .\deploy-wsl-windows.bat
   ```

### **Opção 3: Copiar para Windows**

1. **Copie a pasta para o Windows:**
   ```cmd
   xcopy "\\wsl$\Ubuntu\home\marcelio\developing\systentando\backend-monorepo\python\life-tracker\agent-onboarding\n8n-workflows" "C:\life-tracker-n8n" /E /I /Y
   ```
2. **Navegue para a pasta copiada:**
   ```cmd
   cd C:\life-tracker-n8n
   ```
3. **Execute o script original:**
   ```cmd
   .\deploy-windows.bat
   ```

## 🚀 **Recomendação: Use o PowerShell**

O script `deploy-windows.ps1` foi criado especificamente para resolver este problema:

### **Vantagens:**
- ✅ Funciona com caminhos UNC
- ✅ Interface colorida e amigável
- ✅ Tratamento de erros robusto
- ✅ Cria diretório de trabalho no Windows automaticamente
- ✅ Inicialização completa do MongoDB

### **Como usar:**

1. **Abra o PowerShell como Administrador**
2. **Execute:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. **Navegue até a pasta:**
   ```powershell
   cd "\\wsl$\Ubuntu\home\marcelio\developing\systentando\backend-monorepo\python\life-tracker\agent-onboarding\n8n-workflows"
   ```
4. **Execute o deploy:**
   ```powershell
   .\deploy-windows.ps1
   ```

## 📁 **O que o Script Faz**

### **1. Cria Diretório de Trabalho**
- Cria `%USERPROFILE%\life-tracker-n8n` no Windows
- Copia todos os arquivos necessários
- Evita problemas de permissão

### **2. Inicializa MongoDB**
- Cria usuário `life_tracker_user`
- Cria collections necessárias
- Insere templates padrão
- Configura índices

### **3. Inicia Todos os Serviços**
- MongoDB (porta 27017)
- PostgreSQL (porta 5432)
- Redis (porta 6379)
- n8n (porta 5678)

### **4. Configura Conexões**
- Configura n8n para usar PostgreSQL
- Configura Redis para filas
- Configura webhooks

## 🔍 **Verificação**

Após executar o script, verifique:

1. **n8n está funcionando:**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:5678/healthz"
   ```

2. **MongoDB está funcionando:**
   ```cmd
   docker exec life-tracker-mongo mongosh --eval "db.adminCommand('ping')"
   ```

3. **PostgreSQL está funcionando:**
   ```cmd
   docker exec life-tracker-postgres pg_isready -U n8n
   ```

4. **Redis está funcionando:**
   ```cmd
   docker exec life-tracker-redis redis-cli ping
   ```

## 🎯 **Próximos Passos**

1. **Acesse o n8n:**
   - URL: http://localhost:5678
   - Usuário: admin
   - Senha: Admin123!

2. **Importe os workflows:**
   - `onboarding-workflow.json`
   - `error-handling-workflow.json`

3. **Configure as conexões MongoDB:**
   - Host: `host.docker.internal`
   - Port: `27017`
   - Database: `life_tracker`
   - Username: `life_tracker_user`
   - Password: `MongoApp123!`

4. **Teste os webhooks:**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:5678/webhook/onboarding-status" -Method GET
   ```

## 🆘 **Se Ainda Houver Problemas**

### **Problema: PowerShell não executa scripts**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **Problema: Docker não está rodando**
- Inicie o Docker Desktop
- Aguarde até aparecer "Docker Desktop is running"

### **Problema: Portas em uso**
```cmd
netstat -ano | findstr :5678
netstat -ano | findstr :27017
netstat -ano | findstr :5432
netstat -ano | findstr :6379
```

### **Problema: Permissões**
- Execute como Administrador
- Verifique se o Docker Desktop está rodando

## 📞 **Suporte**

Se ainda houver problemas:

1. **Verifique os logs:**
   ```cmd
   docker logs life-tracker-n8n
   docker logs life-tracker-mongo
   docker logs life-tracker-postgres
   docker logs life-tracker-redis
   ```

2. **Verifique o status dos containers:**
   ```cmd
   docker ps --filter "name=life-tracker"
   ```

3. **Reinicie os serviços:**
   ```cmd
   docker restart life-tracker-n8n life-tracker-mongo life-tracker-postgres life-tracker-redis
   ```

---

**Use o PowerShell para resolver o problema de caminho UNC!** 🚀
