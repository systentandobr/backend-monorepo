# 🚀 Swagger/OpenAPI - Guia Rápido

## 📖 URLs da Documentação

| Interface | URL | Descrição |
|-----------|-----|-----------|
| **Swagger UI** | http://localhost:8000/docs | Interface interativa principal |
| **ReDoc** | http://localhost:8000/redoc | Documentação alternativa |
| **OpenAPI JSON** | http://localhost:8000/openapi.json | Especificação JSON |

## 🚀 Como Iniciar

### Opção 1: Script Automatizado
```bash
cd python/life-tracker/agent-onboarding
./start_server.sh
```

### Opção 2: Manual
```bash
cd python/life-tracker/agent-onboarding
python main.py
```

## 📋 Endpoints Principais

### 🏥 Health Check
- `GET /health` - Status da aplicação
- `GET /health/ready` - Prontidão
- `GET /health/live` - Vitalidade

### 👤 Onboarding
- `POST /onboarding/complete` - Processo completo
- `POST /onboarding/analyze-profile` - Análise de perfil
- `POST /onboarding/generate-plan` - Geração de plano
- `GET /onboarding/templates` - Templates disponíveis

### 👤 Usuários
- `GET /onboarding/user/{user_id}/plan` - Plano do usuário
- `GET /onboarding/user/{user_id}/profile` - Perfil do usuário
- `GET /onboarding/user/{user_id}/recommendations` - Recomendações
- `POST /onboarding/user/{user_id}/update-plan` - Atualizar plano

## 🧪 Testar Documentação

```bash
python test_swagger.py
```

## 📚 Documentação Completa

Veja o arquivo `SWAGGER_DOCUMENTATION.md` para informações detalhadas sobre:
- Configuração avançada
- Personalização
- Segurança
- Deploy
- Monitoramento

---

**✨ Dica**: Acesse http://localhost:8000/docs para ver a documentação interativa!
