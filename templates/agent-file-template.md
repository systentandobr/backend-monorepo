# Systentando Backend Monorepo - Development Guidelines

Auto-generated from all feature plans. Last updated: [DATE]

## Active Technologies

**Backend Monorepo Multi-Linguagem**:
- **Node.js**: NestJS 10 + TypeScript 5 + MongoDB + JWT + Swagger
- **Python**: FastAPI + PostgreSQL + Agno Framework + OpenAI
- **Golang**: Gin + MongoDB + Clean Architecture + SOLID
- **Frontend**: Next.js 15.2.2 + React 19 + TypeScript + HeroUI
- **Autenticação**: SYS-SEGURANÇA API centralizada (auth.systentando.com)
- **Testes**: Jest + React Testing Library + MSW + pytest + go test

## Project Structure

```
backend-monorepo/
├── nodejs/apis/                    # Node.js APIs (NestJS + MongoDB)
│   ├── apps/
│   │   ├── apis-monorepo/          # API Gateway principal
│   │   ├── life-tracker/           # Life Tracker API
│   │   ├── sys-assistente-estudos/ # Assistente de estudos
│   │   ├── sys-pagamentos/         # Sistema de pagamentos
│   │   └── sys-produtos/           # Catálogo de produtos
│   └── libs/                       # Bibliotecas compartilhadas
├── python/                         # Python Services (FastAPI + PostgreSQL)
│   ├── life-tracker/agent-onboarding/ # Agente IA com Agno
│   └── meu-nutri/                  # Sistema de nutrição
├── golang/                         # Golang Services (Gin + MongoDB)
│   ├── invest-tracker/             # Rastreador de investimentos
│   └── zen-launcher/               # Launcher de bem-estar
└── docs/                           # Documentação do ecossistema
```

## Commands

**Node.js (NestJS)**:
```bash
# Desenvolvimento
npm run start:dev
npm run build
npm run test

# Life Tracker API
cd nodejs/apis/apps/life-tracker
npm run start:dev
```

**Python (FastAPI)**:
```bash
# Agente de Onboarding
cd python/life-tracker/agent-onboarding
python run_script.py main
python run_script.py test_paths
```

**Golang (Gin)**:
```bash
# Invest Tracker
cd golang/invest-tracker
make build
make run
make test
```

## Code Style

**Node.js/TypeScript**:
- ESLint + Prettier configurado
- NestJS decorators e dependency injection
- MongoDB schemas com validação
- JWT authentication

**Python**:
- PEP 8 + Black + isort
- FastAPI com Pydantic
- Agno Framework para IA
- PostgreSQL com SQLAlchemy

**Golang**:
- Clean Architecture
- SOLID principles
- Gin framework
- MongoDB driver

## Recent Changes

[LAST 3 FEATURES AND WHAT THEY ADDED]

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
