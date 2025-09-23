# 📋 Plano de Implementação - SYS-SEGURANÇA

## 🎯 Resumo Executivo

Este documento detalha o plano de implementação do módulo de segurança SYS-SEGURANÇA, incluindo cronograma, tarefas específicas e critérios de aceitação para cada fase.

## 📅 Cronograma Geral

| Fase | Duração | Objetivo | Entregáveis |
|------|---------|----------|-------------|
| **Fase 1** | Semana 1-2 | Estrutura Base | Repositório + Arquitetura |
| **Fase 2** | Semana 3-4 | API Core | Endpoints de Autenticação |
| **Fase 3** | Semana 5-6 | Client Libraries | Bibliotecas para Python/Node/Go |
| **Fase 4** | Semana 7-8 | Testes + Deploy | Testes + Deploy em Produção |
| **Fase 5** | Semana 9-10 | Integração | Migração das APIs Existentes |

**Total: 10 semanas (2.5 meses)**

## 🚀 Fase 1: Estrutura Base (Semana 1-2)

### 1.1. Setup do Repositório

#### **Tarefa 1.1.1: Criar Repositório Privado**
- [ ] Criar repositório `sys-seguranca-service` no GitHub/GitLab
- [ ] Configurar branch protection rules
- [ ] Configurar CI/CD básico
- [ ] Adicionar colaboradores da equipe

**Responsável:** DevOps/Lead Developer  
**Estimativa:** 1 dia  
**Critérios de Aceitação:** Repositório criado com permissões corretas

#### **Tarefa 1.1.2: Estrutura de Diretórios**
```bash
# Comandos para criar estrutura
mkdir -p sys-seguranca-service/{src/{modules/{auth,users,roles,tokens},shared/{guards,decorators,interceptors,filters},config},client-libs/{python,nodejs,golang},docker,tests,docs}
```

- [ ] Criar estrutura de diretórios conforme arquitetura
- [ ] Configurar arquivos base (package.json, tsconfig.json, etc.)
- [ ] Configurar ESLint + Prettier
- [ ] Configurar Husky para pre-commit hooks

**Responsável:** Lead Developer  
**Estimativa:** 2 dias  
**Critérios de Aceitação:** Estrutura criada e configurada

#### **Tarefa 1.1.3: Configuração de Dependências**
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/mongoose": "^10.0.0",
    "@nestjs/redis": "^1.0.0",
    "bcrypt": "^5.1.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1"
  }
}
```

- [ ] Instalar dependências principais
- [ ] Configurar scripts de build e dev
- [ ] Configurar ambiente de desenvolvimento

**Responsável:** Developer  
**Estimativa:** 1 dia  
**Critérios de Aceitação:** Dependências instaladas e funcionando

### 1.2. Configuração de Infraestrutura

#### **Tarefa 1.2.1: Docker Setup**
```dockerfile
# docker-compose.yml para desenvolvimento
version: '3.8'
services:
  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
  
  sys-seguranca:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
      - redis
    environment:
      - MONGODB_URI=mongodb://admin:password@mongodb:27017
      - REDIS_URL=redis://redis:6379
```

- [ ] Criar Dockerfile para desenvolvimento
- [ ] Configurar docker-compose com MongoDB e Redis
- [ ] Testar conectividade entre serviços

**Responsável:** DevOps Developer  
**Estimativa:** 2 dias  
**Critérios de Aceitação:** Todos os serviços rodando via Docker

#### **Tarefa 1.2.2: Configuração de Ambiente**
```bash
# .env.example
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://admin:password@localhost:27017/sys-seguranca
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100

# API Keys
API_KEY_HEADER=X-API-Key
API_KEY_SECRET=your-api-key-secret
```

- [ ] Criar arquivos de configuração de ambiente
- [ ] Configurar variáveis para diferentes ambientes
- [ ] Documentar configurações necessárias

**Responsável:** Developer  
**Estimativa:** 1 dia  
**Critérios de Aceitação:** Configurações funcionando em todos os ambientes

### 1.3. Arquitetura Base

#### **Tarefa 1.3.1: Configuração do NestJS**
```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });
  
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

- [ ] Configurar NestJS com validação global
- [ ] Configurar CORS e middlewares de segurança
- [ ] Configurar logging estruturado

**Responsável:** Lead Developer  
**Estimativa:** 2 dias  
**Critérios de Aceitação:** Aplicação rodando com configurações básicas

## 🔐 Fase 2: API Core (Semana 3-4)

### 2.1. Módulo de Autenticação

#### **Tarefa 2.1.1: Implementar Auth Service**
```typescript
// src/modules/auth/services/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async login(credentials: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userService.validateCredentials(credentials);
    const tokens = await this.generateTokens(user);
    
    await this.redisService.setRefreshToken(user.id, tokens.refreshToken);
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async refreshToken(refreshToken: string): Promise<RefreshResponseDto> {
    const payload = await this.jwtService.verifyAsync(refreshToken);
    const storedToken = await this.redisService.getRefreshToken(payload.sub);
    
    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    
    const user = await this.userService.findById(payload.sub);
    const newTokens = await this.generateTokens(user);
    
    await this.redisService.setRefreshToken(user.id, newTokens.refreshToken);
    
    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  }
}
```

- [ ] Implementar métodos de login/logout
- [ ] Implementar refresh token
- [ ] Implementar validação de tokens
- [ ] Implementar rate limiting

**Responsável:** Developer  
**Estimativa:** 3 dias  
**Critérios de Aceitação:** Todos os endpoints de autenticação funcionando

#### **Tarefa 2.1.2: Implementar Auth Controller**
```typescript
// src/modules/auth/controllers/auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshDto: RefreshDto): Promise<RefreshResponseDto> {
    return this.authService.refreshToken(refreshDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser() user: User): Promise<void> {
    return this.authService.logout(user.id);
  }

  @Post('validate')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async validate(@CurrentUser() user: User): Promise<UserDto> {
    return this.userService.findById(user.id);
  }
}
```

- [ ] Implementar endpoints REST
- [ ] Configurar validação de DTOs
- [ ] Implementar tratamento de erros
- [ ] Adicionar documentação Swagger

**Responsável:** Developer  
**Estimativa:** 2 dias  
**Critérios de Aceitação:** API documentada e testável

### 2.2. Módulo de Usuários

#### **Tarefa 2.2.1: Implementar User Service**
```typescript
// src/modules/users/services/user.service.ts
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private passwordService: PasswordService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.passwordService.hash(createUserDto.password);
    
    const user = new this.userModel({
      ...createUserDto,
      passwordHash: hashedPassword,
      roles: ['user'], // Role padrão
    });
    
    return user.save();
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateDto },
      { new: true, runValidators: true }
    );
  }

  async assignRoles(userId: string, roles: string[]): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $set: { roles } },
      { new: true }
    );
  }
}
```

- [ ] Implementar CRUD de usuários
- [ ] Implementar gestão de perfis
- [ ] Implementar atribuição de roles
- [ ] Implementar soft delete

**Responsável:** Developer  
**Estimativa:** 3 dias  
**Critérios de Aceitação:** CRUD completo de usuários funcionando

### 2.3. Módulo de Roles e Permissões

#### **Tarefa 2.3.1: Implementar Role Service**
```typescript
// src/modules/roles/services/role.service.ts
@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
    private permissionService: PermissionService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = new this.roleModel(createRoleDto);
    return role.save();
  }

  async assignPermissions(roleId: string, permissions: PermissionDto[]): Promise<Role> {
    return this.roleModel.findByIdAndUpdate(
      roleId,
      { $set: { permissions } },
      { new: true }
    );
  }

  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const user = await this.userService.findById(userId);
    const userRoles = await this.findByNames(user.roles);
    
    return userRoles.some(role => 
      role.permissions.some(permission => 
        permission.resource === resource && 
        permission.actions.includes(action)
      )
    );
  }
}
```

- [ ] Implementar CRUD de roles
- [ ] Implementar sistema de permissões
- [ ] Implementar herança de roles
- [ ] Implementar verificação de permissões

**Responsável:** Developer  
**Estimativa:** 3 dias  
**Critérios de Aceitação:** Sistema de RBAC funcionando

## 🔌 Fase 3: Client Libraries (Semana 5-6)

### 3.1. Python Client Library

#### **Tarefa 3.1.1: Estrutura da Biblioteca Python**
```bash
client-libs/python/
├── setup.py
├── requirements.txt
├── sys_seguranca_client/
│   ├── __init__.py
│   ├── client.py
│   ├── models.py
│   ├── exceptions.py
│   └── fastapi/
│       ├── __init__.py
│       ├── auth.py
│       └── dependencies.py
├── tests/
└── README.md
```

- [ ] Criar estrutura de diretórios
- [ ] Configurar setup.py e dependências
- [ ] Implementar cliente HTTP base
- [ ] Implementar modelos de dados

**Responsável:** Python Developer  
**Estimativa:** 2 dias  
**Critérios de Aceitação:** Estrutura básica criada

#### **Tarefa 3.1.2: Implementar Cliente Python**
```python
# client-libs/python/sys_seguranca_client/client.py
import httpx
from typing import Optional, Dict, Any
from .models import LoginRequest, LoginResponse, User
from .exceptions import AuthenticationError, ValidationError

class AuthClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.client = httpx.AsyncClient(
            headers={'X-API-Key': api_key}
        )
    
    async def login(self, username: str, password: str) -> LoginResponse:
        """Realiza login do usuário"""
        try:
            response = await self.client.post(
                f"{self.base_url}/auth/login",
                json={"username": username, "password": password}
            )
            response.raise_for_status()
            return LoginResponse(**response.json())
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                raise AuthenticationError("Credenciais inválidas")
            raise e
    
    async def validate_token(self, token: str) -> User:
        """Valida um token JWT"""
        try:
            response = await self.client.post(
                f"{self.base_url}/auth/validate",
                headers={'Authorization': f'Bearer {token}'}
            )
            response.raise_for_status()
            return User(**response.json())
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                raise AuthenticationError("Token inválido")
            raise e
    
    async def close(self):
        """Fecha o cliente HTTP"""
        await self.client.aclose()
```

- [ ] Implementar métodos de autenticação
- [ ] Implementar tratamento de erros
- [ ] Implementar validação de dados
- [ ] Implementar testes unitários

**Responsável:** Python Developer  
**Estimativa:** 3 dias  
**Critérios de Aceitação:** Cliente funcionando com testes

#### **Tarefa 3.1.3: Integração com FastAPI**
```python
# client-libs/python/sys_seguranca_client/fastapi/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..client import AuthClient
from ..exceptions import AuthenticationError

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_client: AuthClient = Depends(get_auth_client)
) -> User:
    """Dependency para obter usuário atual"""
    try:
        token = credentials.credentials
        user = await auth_client.validate_token(token)
        return user
    except AuthenticationError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

def require_roles(*roles: str):
    """Decorator para verificar roles"""
    def role_checker(current_user: User = Depends(get_current_user)):
        if not any(role in current_user.roles for role in roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permissão insuficiente"
            )
        return current_user
    return role_checker
```

- [ ] Implementar dependencies do FastAPI
- [ ] Implementar decorators de autorização
- [ ] Implementar middleware de autenticação
- [ ] Documentar uso da biblioteca

**Responsável:** Python Developer  
**Estimativa:** 2 dias  
**Critérios de Aceitação:** Integração com FastAPI funcionando

### 3.2. Node.js Client Library

#### **Tarefa 3.2.1: Estrutura da Biblioteca Node.js**
```bash
client-libs/nodejs/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── client.ts
│   ├── guards/
│   ├── decorators/
│   └── types/
├── dist/
├── tests/
└── README.md
```

- [ ] Criar estrutura de diretórios
- [ ] Configurar package.json e TypeScript
- [ ] Implementar cliente HTTP base
- [ ] Implementar tipos TypeScript

**Responsável:** Node.js Developer  
**Estimativa:** 2 dias  
**Critérios de Aceitação:** Estrutura básica criada

#### **Tarefa 3.2.2: Implementar Cliente Node.js**
```typescript
// client-libs/nodejs/src/client.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LoginRequest, LoginResponse, User, RefreshRequest } from './types';

export class SysSegurancaClient {
  private client: AxiosInstance;
  private baseURL: string;
  private apiKey: string;

  constructor(config: { baseURL: string; apiKey: string }) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await this.client.post(
        '/auth/login',
        credentials
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Credenciais inválidas');
      }
      throw error;
    }
  }

  async validateToken(token: string): Promise<User> {
    try {
      const response: AxiosResponse<User> = await this.client.post(
        '/auth/validate',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Token inválido');
      }
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await this.client.post(
        '/auth/refresh',
        { refreshToken }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Refresh token inválido');
      }
      throw error;
    }
  }
}
```

- [ ] Implementar métodos de autenticação
- [ ] Implementar tratamento de erros
- [ ] Implementar validação de dados
- [ ] Implementar testes unitários

**Responsável:** Node.js Developer  
**Estimativa:** 3 dias  
**Critérios de Aceitação:** Cliente funcionando com testes

#### **Tarefa 3.2.3: Integração com NestJS**
```typescript
// client-libs/nodejs/src/guards/sys-seguranca.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SysSegurancaClient } from '../client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class SysSegurancaGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private sysSegurancaClient: SysSegurancaClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }

    try {
      const user = await this.sysSegurancaClient.validateToken(token);
      request.user = user;

      if (requiredRoles && requiredRoles.length > 0) {
        const hasRole = requiredRoles.some(role => user.roles.includes(role));
        if (!hasRole) {
          throw new UnauthorizedException('Permissão insuficiente');
        }
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

- [ ] Implementar guard do NestJS
- [ ] Implementar decorators de autorização
- [ ] Implementar interceptors
- [ ] Documentar uso da biblioteca

**Responsável:** Node.js Developer  
**Estimativa:** 2 dias  
**Critérios de Aceitação:** Integração com NestJS funcionando

### 3.3. Golang Client Library

#### **Tarefa 3.3.1: Estrutura da Biblioteca Golang**
```bash
client-libs/golang/
├── go.mod
├── go.sum
├── pkg/
│   ├── client/
│   ├── middleware/
│   ├── models/
│   └── errors/
├── examples/
├── tests/
└── README.md
```

- [ ] Criar estrutura de diretórios
- [ ] Configurar go.mod e dependências
- [ ] Implementar cliente HTTP base
- [ ] Implementar estruturas de dados

**Responsável:** Golang Developer  
**Estimativa:** 2 dias  
**Critérios de Aceitação:** Estrutura básica criada

#### **Tarefa 3.3.2: Implementar Cliente Golang**
```go
// client-libs/golang/pkg/client/client.go
package client

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type SysSegurancaClient struct {
    baseURL string
    apiKey  string
    client  *http.Client
}

type Config struct {
    BaseURL string
    APIKey  string
    Timeout time.Duration
}

func NewClient(config Config) *SysSegurancaClient {
    if config.Timeout == 0 {
        config.Timeout = 30 * time.Second
    }

    return &SysSegurancaClient{
        baseURL: config.BaseURL,
        apiKey:  config.APIKey,
        client: &http.Client{
            Timeout: config.Timeout,
        },
    }
}

func (c *SysSegurancaClient) Login(credentials LoginRequest) (*LoginResponse, error) {
    jsonData, err := json.Marshal(credentials)
    if err != nil {
        return nil, fmt.Errorf("erro ao serializar credenciais: %w", err)
    }

    req, err := http.NewRequest("POST", c.baseURL+"/auth/login", bytes.NewBuffer(jsonData))
    if err != nil {
        return nil, fmt.Errorf("erro ao criar requisição: %w", err)
    }

    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("X-API-Key", c.apiKey)

    resp, err := c.client.Do(req)
    if err != nil {
        return nil, fmt.Errorf("erro na requisição: %w", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode == http.StatusUnauthorized {
        return nil, &AuthenticationError{Message: "Credenciais inválidas"}
    }

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("erro do servidor: %d", resp.StatusCode)
    }

    var loginResp LoginResponse
    if err := json.NewDecoder(resp.Body).Decode(&loginResp); err != nil {
        return nil, fmt.Errorf("erro ao decodificar resposta: %w", err)
    }

    return &loginResp, nil
}

func (c *SysSegurancaClient) ValidateToken(token string) (*User, error) {
    req, err := http.NewRequest("POST", c.baseURL+"/auth/validate", nil)
    if err != nil {
        return nil, fmt.Errorf("erro ao criar requisição: %w", err)
    }

    req.Header.Set("Authorization", "Bearer "+token)
    req.Header.Set("X-API-Key", c.apiKey)

    resp, err := c.client.Do(req)
    if err != nil {
        return nil, fmt.Errorf("erro na requisição: %w", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode == http.StatusUnauthorized {
        return nil, &AuthenticationError{Message: "Token inválido"}
    }

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("erro do servidor: %d", resp.StatusCode)
    }

    var user User
    if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
        return nil, fmt.Errorf("erro ao decodificar resposta: %w", err)
    }

    return &user, nil
}
```

- [ ] Implementar métodos de autenticação
- [ ] Implementar tratamento de erros
- [ ] Implementar validação de dados
- [ ] Implementar testes unitários

**Responsável:** Golang Developer  
**Estimativa:** 3 dias  
**Critérios de Aceitação:** Cliente funcionando com testes

#### **Tarefa 3.3.3: Integração com Gin**
```go
// client-libs/golang/pkg/middleware/auth.go
package middleware

import (
    "net/http"
    "strings"

    "github.com/gin-gonic/gin"
    "github.com/systentando/sys-seguranca-client/pkg/client"
)

type AuthMiddleware struct {
    client *client.SysSegurancaClient
}

func NewAuthMiddleware(sysSegurancaClient *client.SysSegurancaClient) *AuthMiddleware {
    return &AuthMiddleware{
        client: sysSegurancaClient,
    }
}

func (am *AuthMiddleware) Authenticate() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Token não fornecido"})
            c.Abort()
            return
        }

        tokenParts := strings.Split(authHeader, " ")
        if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Formato de token inválido"})
            c.Abort()
            return
        }

        token := tokenParts[1]
        user, err := am.client.ValidateToken(token)
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
            c.Abort()
            return
        }

        c.Set("user", user)
        c.Next()
    }
}

func RequireRoles(roles ...string) gin.HandlerFunc {
    return func(c *gin.Context) {
        userInterface, exists := c.Get("user")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
            c.Abort()
            return
        }

        user, ok := userInterface.(*client.User)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
            c.Abort()
            return
        }

        hasRole := false
        for _, requiredRole := range roles {
            for _, userRole := range user.Roles {
                if requiredRole == userRole {
                    hasRole = true
                    break
                }
            }
            if hasRole {
                break
            }
        }

        if !hasRole {
            c.JSON(http.StatusForbidden, gin.H{"error": "Permissão insuficiente"})
            c.Abort()
            return
        }

        c.Next()
    }
}
```

- [ ] Implementar middleware do Gin
- [ ] Implementar verificações de role
- [ ] Implementar tratamento de erros
- [ ] Documentar uso da biblioteca

**Responsável:** Golang Developer  
**Estimativa:** 2 dias  
**Critérios de Aceitação:** Integração com Gin funcionando

## 🧪 Fase 4: Testes + Deploy (Semana 7-8)

### 4.1. Testes

#### **Tarefa 4.1.1: Testes Unitários**
- [ ] Testes para todos os serviços
- [ ] Testes para todos os controllers
- [ ] Testes para todas as validações
- [ ] Cobertura mínima de 80%

**Responsável:** Todos os Developers  
**Estimativa:** 3 dias  
**Critérios de Aceitação:** Cobertura de testes atingida

#### **Tarefa 4.1.2: Testes de Integração**
- [ ] Testes de API endpoints
- [ ] Testes de integração com banco
- [ ] Testes de integração com Redis
- [ ] Testes de fluxos completos

**Responsável:** QA Engineer  
**Estimativa:** 2 dias  
**Critérios de Aceitação:** Todos os fluxos testados

#### **Tarefa 4.1.3: Testes de Performance**
- [ ] Testes de carga
- [ ] Testes de stress
- [ ] Testes de concorrência
- [ ] Análise de bottlenecks

**Responsável:** DevOps Engineer  
**Estimativa:** 2 dias  
**Critérios de Aceitação:** Performance dentro dos SLAs

### 4.2. Deploy

#### **Tarefa 4.2.1: Configuração de Produção**
- [ ] Configurar variáveis de produção
- [ ] Configurar logs estruturados
- [ ] Configurar monitoramento
- [ ] Configurar alertas

**Responsável:** DevOps Engineer  
**Estimativa:** 2 dias  
**Critérios de Aceitação:** Ambiente de produção configurado

#### **Tarefa 4.2.2: Deploy Automatizado**
- [ ] Configurar CI/CD pipeline
- [ ] Configurar deploy automático
- [ ] Configurar rollback automático
- [ ] Configurar health checks

**Responsável:** DevOps Engineer  
**Estimativa:** 2 dias  
**Critérios de Aceitação:** Deploy automatizado funcionando

## 🔗 Fase 5: Integração (Semana 9-10)

### 5.1. Migração das APIs Existentes

#### **Tarefa 5.1.1: Migração da API Python**
- [ ] Instalar biblioteca cliente
- [ ] Configurar autenticação
- [ ] Testar integração
- [ ] Deploy em produção

**Responsável:** Python Developer  
**Estimativa:** 2 dias  
**Critérios de Aceitação:** API Python usando novo sistema

#### **Tarefa 5.1.2: Migração da API Node.js**
- [ ] Instalar biblioteca cliente
- [ ] Configurar autenticação
- [ ] Testar integração
- [ ] Deploy em produção

**Responsável:** Node.js Developer  
**Estimativa:** 2 dias  
**Critérios de Aceitação:** API Node.js usando novo sistema

### 5.2. Documentação e Treinamento

#### **Tarefa 5.2.1: Documentação Final**
- [ ] Documentação de uso
- [ ] Documentação de API
- [ ] Guias de integração
- [ ] Troubleshooting

**Responsável:** Technical Writer  
**Estimativa:** 2 dias  
**Critérios de Aceitação:** Documentação completa

#### **Tarefa 5.2.2: Treinamento da Equipe**
- [ ] Sessão de treinamento
- [ ] Demonstração prática
- [ ] Perguntas e respostas
- [ ] Material de referência

**Responsável:** Lead Developer  
**Estimativa:** 1 dia  
**Critérios de Aceitação:** Equipe treinada

## 📊 Métricas de Sucesso

### 6.1. Métricas Técnicas
- ✅ **Performance**: Latência < 100ms para validação de tokens
- ✅ **Disponibilidade**: 99.9% uptime
- ✅ **Segurança**: 0 vulnerabilidades críticas
- ✅ **Cobertura**: > 80% de testes

### 6.2. Métricas de Negócio
- ✅ **Adoção**: 100% das APIs migradas
- ✅ **Produtividade**: Redução de 50% no tempo de desenvolvimento de autenticação
- ✅ **Manutenção**: Redução de 70% nos bugs relacionados à autenticação
- ✅ **Escalabilidade**: Suporte a 10x mais usuários

## 🚨 Riscos e Mitigações

### 6.3. Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Complexidade técnica** | Média | Alto | Desenvolvimento incremental |
| **Dependências externas** | Baixa | Médio | Fallbacks e circuit breakers |
| **Performance** | Baixa | Alto | Testes de carga antecipados |
| **Segurança** | Média | Crítico | Auditoria de segurança |

### 6.4. Planos de Contingência

- **Rollback**: Sistema de rollback automático para versões anteriores
- **Fallback**: Autenticação local como backup
- **Monitoramento**: Alertas em tempo real para problemas
- **Suporte**: Equipe de suporte 24/7 durante a migração

## 📚 Recursos Necessários

### 6.5. Equipe
- **1 Lead Developer** (Node.js)
- **1 Python Developer**
- **1 Golang Developer**
- **1 DevOps Engineer**
- **1 QA Engineer**
- **1 Technical Writer**

### 6.6. Infraestrutura
- **Servidor de desenvolvimento** (Docker)
- **Servidor de staging** (Kubernetes)
- **Servidor de produção** (Kubernetes)
- **MongoDB cluster**
- **Redis cluster**
- **Monitoramento** (Prometheus + Grafana)

### 6.7. Ferramentas
- **Git** para versionamento
- **Docker** para containerização
- **Kubernetes** para orquestração
- **Jenkins/GitHub Actions** para CI/CD
- **Jest** para testes Node.js
- **Pytest** para testes Python
- **Go testing** para testes Golang

## 🎯 Conclusão

Este plano de implementação fornece uma rota clara e estruturada para o desenvolvimento do módulo de segurança SYS-SEGURANÇA. Com uma abordagem incremental e foco na qualidade, conseguiremos entregar um sistema robusto e escalável em 10 semanas.

**Próximos passos imediatos:**
1. ✅ Revisar e aprovar este plano
2. 🔄 Criar repositório privado
3. 🔄 Configurar ambiente de desenvolvimento
4. 🔄 Iniciar implementação da Fase 1

**Dúvidas ou ajustes necessários?** Entre em contato com a equipe técnica.
