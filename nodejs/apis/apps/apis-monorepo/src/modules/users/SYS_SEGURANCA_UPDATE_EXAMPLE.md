# Exemplo de Atualização do SYS-SEGURANÇA para Suportar Filtro por Domain

## Problema Atual

O endpoint `GET /api/v1/users` do SYS-SEGURANÇA não aceita o parâmetro `domain` como query parameter, retornando erro 400:
```json
{
  "message": ["property domain should not exist"],
  "error": "Bad Request",
  "statusCode": 400
}
```

## Solução Temporária

Atualmente, o `UsersService` busca todos os usuários e filtra localmente por domain. Isso funciona, mas não é ideal para performance quando há muitos usuários.

## Atualização Necessária no SYS-SEGURANÇA

### 1. Atualizar o DTO de Query Parameters

No arquivo `src/modules/users/dto/user-query.dto.ts` (ou similar):

```typescript
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UserQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  domain?: string; // ✅ Adicionar este campo

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
```

### 2. Atualizar o Controller

No arquivo `src/modules/users/users.controller.ts`:

```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserQueryDto } from './dto/user-query.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista usuários com filtros opcionais' })
  @ApiQuery({ name: 'search', required: false, description: 'Busca por nome, email ou username' })
  @ApiQuery({ name: 'domain', required: false, description: 'Filtrar por domain' }) // ✅ Adicionar
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }
}
```

### 3. Atualizar o Service

No arquivo `src/modules/users/users.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAll(query: UserQueryDto) {
    const { search, domain, page = 1, limit = 50 } = query;
    
    // Construir filtro
    const filter: any = {};
    
    // Filtro por domain no profile
    if (domain) {
      filter['profile.domain'] = domain; // ✅ Adicionar filtro por domain
    }
    
    // Filtro de busca
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
      ];
    }
    
    // Aplicar paginação
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .select('-passwordHash') // Não retornar senha
        .exec(),
      this.userModel.countDocuments(filter),
    ]);
    
    return {
      success: true,
      data: users,
      total,
      page,
      limit,
    };
  }
}
```

### 4. Atualizar o Schema (se necessário)

Certifique-se de que o schema do User tem o campo `profile.domain` indexado:

```typescript
// src/modules/users/schemas/user.schema.ts
@Schema({ timestamps: true })
export class User {
  // ... outros campos
  
  @Prop({
    type: {
      firstName: String,
      lastName: String,
      domain: String, // ✅ Garantir que existe
      // ... outros campos do profile
    },
  })
  profile?: {
    firstName?: string;
    lastName?: string;
    domain?: string; // ✅ Campo domain
    [key: string]: any;
  };
}

// Criar índice para melhor performance
UserSchema.index({ 'profile.domain': 1 });
UserSchema.index({ username: 1, 'profile.domain': 1 });
```

## Após a Atualização

Depois que o SYS-SEGURANÇA for atualizado, você pode simplificar o `UsersService` no `apis-monorepo`:

```typescript
// Remover o filtro local e usar o parâmetro domain diretamente
const params: any = {
  domain, // ✅ Agora funciona!
  page,
  limit,
};
```

## Benefícios

1. **Performance**: Filtro no banco de dados é muito mais rápido
2. **Escalabilidade**: Funciona bem mesmo com milhares de usuários
3. **Consistência**: API do SYS-SEGURANÇA suporta multi-tenancy nativamente
4. **Menos código**: Não precisa filtrar localmente

