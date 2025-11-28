import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser, CurrentUserShape } from '../../decorators/current-user.decorator';
import { UpdateUserUnitDto } from './dto/update-user-unit.dto';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cria um novo usuário',
    description: 'Cria um novo usuário no sistema SYS-SEGURANÇA com o mesmo domain do usuário autenticado'
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Dados do usuário a ser criado',
    examples: {
      example1: {
        value: {
          email: 'joao.silva@example.com',
          username: 'joao.silva',
          password: 'SenhaSegura123!',
          firstName: 'João',
          lastName: 'Silva',
          country: 'BR',
          state: 'RN',
          zipCode: '59000-000',
          localNumber: '123',
          unitName: 'Franquia Centro',
          address: 'Rua das Flores',
          complement: 'N/A',
          neighborhood: 'Centro',
          city: 'Natal',
          latitude: -5.7793,
          longitude: -35.2009,
        },
        summary: 'Exemplo de criação de usuário franqueado',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string' },
        profile: { type: 'object' },
        roles: { type: 'array' },
        isActive: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 409, description: 'Email ou username já está em uso' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: CurrentUserShape,
    @Req() request: any,
  ) {
    const domain = user.domain || user.profile?.domain;

    if (!domain) {
      throw new HttpException(
        { message: 'Domain não encontrado no contexto do usuário. Usuários devem ter um domain configurado.', error: 'Bad Request' },
        HttpStatus.BAD_REQUEST
      );
    }

    // Extrair token do header Authorization
    const authHeader = request.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new HttpException(
        { message: 'Token de autenticação não encontrado', error: 'Unauthorized' },
        HttpStatus.UNAUTHORIZED
      );
    }

    // Verificar se o token extraído corresponde ao usuário autenticado
    // O token já foi validado pelo JwtAuthGuard, então request.user deve ter os dados corretos
    console.log(`🔑 [UsersController] Token extraído do header:`, {
      tokenLength: token.length,
      tokenPreview: token.length > 20 ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` : '***',
      userFromGuard: {
        id: user.id,
        username: user.username,
        roles: user.roles,
      },
    });

    console.log(`➕ [UsersController] Criando novo usuário`);
    console.log(`   Email: ${createUserDto.email}`);
    console.log(`   Domain: ${domain}`);
    console.log(`   Usuário autenticado (do JwtAuthGuard):`, {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles?.map((r: any) => r.name || r) || [],
      rolesRaw: user.roles,
      domain: user.domain || user.profile?.domain,
      payload: user.payload ? {
        ...user.payload,
        sub: user.payload.user?.sub,
        username: user.payload.user?.username,
        roles: user.payload.user?.roles,
      } : undefined,
    });

    try {
      const createdUser = await this.usersService.createUser(
        createUserDto,
        token,
        domain,
        user,
      );

      return createdUser;
    } catch (error) {
      // Re-throw HttpException para manter o status code e mensagem
      if (error instanceof HttpException) {
        throw error;
      }
      // Se não for HttpException, converter para 500
      throw new HttpException(
        { message: error.message || 'Erro ao criar usuário', error: 'Internal Server Error' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('available')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Lista usuários disponíveis filtrados por domain',
    description: 'Retorna lista de usuários do mesmo domain do usuário autenticado. Filtra automaticamente pelo domain do usuário logado.'
  })
  @ApiQuery({ 
    name: 'search', 
    required: false, 
    description: 'Termo de busca para filtrar usuários por nome, email ou username' 
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number,
    description: 'Número da página (padrão: 1)' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number,
    description: 'Limite de resultados por página (padrão: 50)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuários disponíveis',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              email: { type: 'string' },
              profile: { type: 'object' },
              roles: { type: 'array' },
              isActive: { type: 'boolean' },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async getAvailableUsers(
    @CurrentUser() user: CurrentUserShape,
    @Req() request: any,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // Extrair domain do usuário autenticado
    const domain = user.domain || user.profile?.domain;

    if (!domain) {
      throw new Error('Domain não encontrado no contexto do usuário. Usuários devem ter um domain configurado.');
    }

    // Extrair token do header Authorization
    const authHeader = request.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    console.log(`📋 [UsersController] Buscando usuários disponíveis para domain: ${domain}`);
    console.log(`   Usuário autenticado: ${user.username || user.email || user.id}`);
    console.log(`   Search: ${search || 'não informado'}`);

    const pageNumber = page ? parseInt(String(page), 10) : 1;
    const limitNumber = limit ? parseInt(String(limit), 10) : 50;

    // Usar getAllUsersByDomain que é o endpoint específico para buscar por domain
    return await this.usersService.getAllUsersByDomain(
      domain,
      token,
      search,
      pageNumber,
      limitNumber,
    );
  }

  @Get('by-unit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Lista usuários filtrados por unitId',
    description: 'Retorna lista de usuários associados a uma unidade/franquia específica do mesmo domain'
  })
  @ApiQuery({ 
    name: 'unitId', 
    required: true, 
    description: 'ID da unidade/franquia para filtrar usuários',
    type: String
  })
  @ApiQuery({ 
    name: 'search', 
    required: false, 
    description: 'Termo de busca para filtrar usuários por nome, email ou username' 
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number,
    description: 'Número da página (padrão: 1)' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number,
    description: 'Limite de resultados por página (padrão: 50)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuários encontrados',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              email: { type: 'string' },
              unitId: { type: 'string' },
              profile: { type: 'object' },
              roles: { type: 'array' },
              isActive: { type: 'boolean' },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'unitId não fornecido ou inválido' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async getUsersByUnitId(
    @CurrentUser() user: CurrentUserShape,
    @Req() request: any,
    @Query('unitId') unitId: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (!unitId) {
      throw new Error('unitId é obrigatório');
    }

    const domain = user.domain || user.profile?.domain;
    
    // Extrair token do header Authorization
    const authHeader = request.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    console.log(`📋 [UsersController] Buscando usuários por unitId: ${unitId}`);
    console.log(`   Domain: ${domain || 'não informado'}`);
    console.log(`   Search: ${search || 'não informado'}`);

    const pageNumber = page ? parseInt(String(page), 10) : 1;
    const limitNumber = limit ? parseInt(String(limit), 10) : 50;

    return await this.usersService.findUsersByUnitId(
      unitId,
      token,
      domain,
      search,
      pageNumber,
      limitNumber,
    );
  }

  @Patch(':id/unit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Atualiza o unitId de um usuário',
    description: 'Atualiza a unidade/franquia associada a um usuário específico do mesmo domain'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do usuário a ser atualizado',
    type: String 
  })
  @ApiBody({ 
    type: UpdateUserUnitDto,
    description: 'Dados para atualização do unitId',
    examples: {
      example1: {
        value: { unitId: 'FR-001' },
        summary: 'Exemplo de atualização de unitId',
      },
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'unitId atualizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string' },
        unitId: { type: 'string' },
        profile: { type: 'object' },
        roles: { type: 'array' },
        isActive: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async updateUserUnit(
    @Param('id') id: string,
    @Body() updateUserUnitDto: UpdateUserUnitDto,
    @CurrentUser() user: CurrentUserShape,
    @Req() request: any,
  ) {
    const domain = user.domain || user.profile?.domain;
    
    // Extrair token do header Authorization
    const authHeader = request.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    console.log(`📋 [UsersController] Atualizando unitId do usuário ${id}`);
    console.log(`   Novo unitId: ${updateUserUnitDto.unitId}`);
    console.log(`   Domain: ${domain || 'não informado'}`);

    const updatedUser = await this.usersService.updateUserUnit(
      id,
      updateUserUnitDto.unitId,
      token,
      domain,
    );

    return updatedUser;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Busca um usuário por ID',
    description: 'Retorna informações de um usuário específico do mesmo domain'
  })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getUserById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
    @Req() request: any,
  ) {
    const domain = user.domain || user.profile?.domain;
    
    // Extrair token do header Authorization
    const authHeader = request.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }
    
    const foundUser = await this.usersService.findUserById(id, token, domain);
    
    if (!foundUser) {
      throw new Error('Usuário não encontrado');
    }

    return foundUser;
  }
}

