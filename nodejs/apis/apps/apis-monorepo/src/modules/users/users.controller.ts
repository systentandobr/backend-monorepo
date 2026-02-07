import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserShape,
} from '../../decorators/current-user.decorator';
import { UpdateUserUnitDto } from './dto/update-user-unit.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cria um novo usuário',
    description:
      'Cria um novo usuário no sistema SYS-SEGURANÇA com o mesmo domain do usuário autenticado',
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
        {
          message:
            'Domain não encontrado no contexto do usuário. Usuários devem ter um domain configurado.',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Extrair token do header Authorization
    const authHeader = request.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new HttpException(
        {
          message: 'Token de autenticação não encontrado',
          error: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Verificar se o token extraído corresponde ao usuário autenticado
    // O token já foi validado pelo JwtAuthGuard, então request.user deve ter os dados corretos
    console.log(`🔑 [UsersController] Token extraído do header:`, {
      tokenLength: token.length,
      tokenPreview:
        token.length > 20
          ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}`
          : '***',
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
      payload: user.payload
        ? {
          ...user.payload,
          sub: user.payload.user?.sub,
          username: user.payload.user?.username,
          roles: user.payload.user?.roles,
        }
        : undefined,
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
        {
          message: error.message || 'Erro ao criar usuário',
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('available')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lista usuários disponíveis filtrados por domain e unitId',
    description:
      'Retorna lista de usuários do mesmo domain do usuário autenticado. Se o usuário tiver unitId, filtra também por unitId (retorna apenas usuários com mesmo unitId ou sem unitId).',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description:
      'Termo de busca para filtrar usuários por nome, email ou username',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limite de resultados por página (padrão: 50)',
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
      throw new Error(
        'Domain não encontrado no contexto do usuário. Usuários devem ter um domain configurado.',
      );
    }

    // Extrair unitId do usuário autenticado
    const userUnitId = user.unitId || user.profile?.unitId;

    // Extrair token do header Authorization
    const authHeader = request.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    console.log(
      `📋 [UsersController] Buscando usuários disponíveis para domain: ${domain}`,
    );
    console.log(
      `   Usuário autenticado: ${user.username || user.email || user.id}`,
    );
    console.log(`   UnitId do usuário: ${userUnitId || 'não informado'}`);
    console.log(`   Search: ${search || 'não informado'}`);

    const pageNumber = page ? parseInt(String(page), 10) : 1;
    const limitNumber = limit ? parseInt(String(limit), 10) : 50;

    // Buscar usuários por domain
    const response = await this.usersService.getAllUsersByDomain(
      domain,
      token,
      search,
      pageNumber,
      limitNumber,
    );

    // Se o usuário tem unitId, filtrar resultados para incluir apenas:
    // - Usuários com o mesmo unitId
    // - Usuários sem unitId (disponíveis para alocação)
    if (userUnitId) {
      const filteredUsers = response.data.filter((u: any) => {
        const userUnitIdValue = u.unitId || u.profile?.unitId;
        // Incluir se não tem unitId (disponível para alocação) ou tem o mesmo unitId
        return !userUnitIdValue || userUnitIdValue === userUnitId;
      });

      console.log(
        `   Filtrado por unitId: ${filteredUsers.length} de ${response.data.length} usuários`,
      );

      return {
        data: filteredUsers,
        total: filteredUsers.length,
        page: response.page,
        limit: response.limit,
      };
    }

    // Se não tem unitId, retornar todos os usuários do domain
    return response;
  }

  @Get('by-unit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lista usuários filtrados por unitId',
    description:
      'Retorna lista de usuários associados a uma unidade/franquia específica do mesmo domain',
  })
  @ApiQuery({
    name: 'unitId',
    required: true,
    description: 'ID da unidade/franquia para filtrar usuários',
    type: String,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description:
      'Termo de busca para filtrar usuários por nome, email ou username',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limite de resultados por página (padrão: 50)',
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

    // Verificar se o usuário tem permissão para consultar este unitId
    // Roles permitidas: admin, moderator, system podem consultar qualquer unitId
    // Roles franqueado e gerente só podem consultar sua própria unitId
    const userRoles = user.roles || [];
    const roleNames = userRoles
      .map((r: any) => {
        // Se role é um objeto com propriedade name, usar name; caso contrário, usar o valor direto
        if (typeof r === 'object' && r !== null && 'name' in r) {
          return r.name;
        }
        return r;
      })
      .filter(Boolean);

    const adminRoles = ['admin', 'moderator', 'system', 'sistema'];
    const franchiseRoles = [
      'franqueado',
      'franchisee',
      'franquia',
      'gerente',
      'manager',
      'parceiro',
      'partner',
    ];

    const isAdmin = adminRoles.some((role) => roleNames.includes(role));
    const isFranchiseeOrManager = franchiseRoles.some((role) =>
      roleNames.includes(role),
    );

    // Se é franqueado ou gerente, verificar se está consultando sua própria unitId
    if (isFranchiseeOrManager && !isAdmin) {
      const userUnitId = user.unitId || user.profile?.unitId;

      if (!userUnitId) {
        throw new HttpException(
          {
            message:
              'Usuário não possui unitId associado. Apenas usuários com unitId podem consultar usuários da franquia.',
            error: 'Forbidden',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      // Decodificar ambos os unitIds para comparação
      const decodedRequestUnitId = decodeURIComponent(unitId);
      const decodedUserUnitId = decodeURIComponent(userUnitId);

      if (decodedRequestUnitId !== decodedUserUnitId) {
        throw new HttpException(
          {
            message: `Acesso negado. Você só pode consultar usuários da sua própria franquia (unitId: ${decodedUserUnitId}).`,
            error: 'Forbidden',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }

    console.log(`📋 [UsersController] Buscando usuários por unitId: ${unitId}`);
    console.log(`   Domain: ${domain || 'não informado'}`);
    console.log(`   User Roles: ${roleNames.join(', ') || 'não informado'}`);
    console.log(`   Is Admin: ${isAdmin}`);
    console.log(`   Is Franchisee/Manager: ${isFranchiseeOrManager}`);
    console.log(
      `   User UnitId: ${user.unitId || user.profile?.unitId || 'não informado'}`,
    );
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
      user, // Passar usuário para possível uso futuro no service
    );
  }

  @Patch(':id/unit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualiza o unitId de um usuário',
    description:
      'Atualiza a unidade/franquia associada a um usuário específico do mesmo domain',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário a ser atualizado',
    type: String,
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
      updateUserUnitDto.unitId ?? null,
      token,
      domain,
    );

    return updatedUser;
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retorna os dados do perfil do usuário autenticado',
    description: 'Retorna informações completas do perfil do usuário que está autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário retornado com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            unitId: { type: 'string', nullable: true },
            avatar: { type: 'string', nullable: true },
            phone: { type: 'string', nullable: true },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'],
            },
            emailVerified: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
        error: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getProfile(
    @CurrentUser() user: CurrentUserShape,
    @Req() request: any,
  ): Promise<{
    success: boolean;
    data: {
      id: string;
      name: string;
      email: string;
      role: string;
      unitId: string | null;
      avatar: string | null;
      phone: string | null;
      status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
      emailVerified: boolean;
      createdAt: string;
      updatedAt: string;
    };
    error: null;
  }> {
    // Extrair token do header Authorization
    const authHeader = request.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new HttpException(
        {
          success: false,
          data: null,
          error: 'Token de autenticação não encontrado',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Buscar dados completos do usuário
    const foundUser = await this.usersService.findUserById(user.id, token);

    if (!foundUser) {
      throw new HttpException(
        {
          success: false,
          data: null,
          error: 'Usuário não encontrado',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Formatar resposta conforme especificação
    // A interface User tem: id, username, email, profile?, roles?, isActive
    const statusValue: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' =
      foundUser.isActive ? 'ACTIVE' : 'INACTIVE';

    const profile = {
      id: foundUser.id || user.id,
      name:
        `${foundUser.profile?.firstName || ''} ${foundUser.profile?.lastName || ''}`.trim() ||
        foundUser.username ||
        user.username,
      email: foundUser.email || user.email,
      role: foundUser.roles?.[0]?.name || (Array.isArray(foundUser.roles) && foundUser.roles[0] ? String(foundUser.roles[0]) : 'STUDENT'),
      unitId: (foundUser.profile?.unitId || user.unitId || null) as string | null,
      avatar: (foundUser.profile?.avatar || null) as string | null,
      phone: (foundUser.profile?.phone || null) as string | null,
      status: statusValue,
      emailVerified: foundUser.profile?.emailVerified || false,
      createdAt: foundUser.profile?.createdAt || new Date().toISOString(),
      updatedAt: foundUser.profile?.updatedAt || new Date().toISOString(),
    };

    return {
      success: true,
      data: profile,
      error: null,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Busca um usuário por ID',
    description: 'Retorna informações de um usuário específico do mesmo domain',
  })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getUserById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
    @Req() request: any,
  ) {
    // Extrair token do header Authorization
    const authHeader = request.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const foundUser = await this.usersService.findUserById(id, token);

    if (!foundUser) {
      throw new Error('Usuário não encontrado');
    }

    return foundUser;
  }

  @Get(':id/roles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Busca roles e permissões de um usuário',
    description: 'Retorna os roles e permissões atuais de um usuário específico do mesmo domain',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Roles e permissões retornados com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserRoles(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
    @Req() request: any,
  ) {
    const domain = user.domain || user.profile?.domain;

    const authHeader = request.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    return await this.usersService.getUserRoles(id, token, domain);
  }

  @Put(':id/roles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Substitui roles e permissões de um usuário',
    description: 'Substitui completamente os roles e permissões de um usuário específico do mesmo domain.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário a ser atualizado',
    type: String,
  })
  @ApiBody({ type: UpdateUserRolesDto })
  @ApiResponse({ status: 200, description: 'Roles e permissões atualizados com sucesso' })
  async putUserRoles(
    @Param('id') id: string,
    @Body() updateUserRolesDto: UpdateUserRolesDto,
    @CurrentUser() user: CurrentUserShape,
    @Req() request: any,
  ) {
    // Reutiliza a lógica de atualização, mas exposta via PUT conforme solicitado pelo frontend
    return this.updateUserRoles(id, updateUserRolesDto, user, request);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualiza dados básicos de um usuário (ex: status)',
    description: 'Atualiza informações gerais de um usuário, como o status de ativação.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário a ser atualizado',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: any,
    @CurrentUser() user: CurrentUserShape,
    @Req() request: any,
  ) {
    const domain = user.domain || user.profile?.domain;

    const authHeader = request.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    console.log(`📋 [UsersController] Atualizando dados do usuário ${id}:`, updateData);

    // Se no updateData vier 'status', podemos mapear para o que o SYS-SEGURANÇA espera
    // No SYS-SEGURANÇA, a ativação costuma ser via um endpoint específico ou campo isActive
    // Vamos implementar um método genérico no service se não existir
    return await this.usersService.updateUser(id, updateData, token, domain);
  }

  @Patch(':id/roles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualiza roles e permissões de um usuário',
    description:
      'Atualiza os roles e permissões de um usuário específico do mesmo domain. Apenas admins podem executar esta ação.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário a ser atualizado',
    type: String,
  })
  @ApiBody({
    type: UpdateUserRolesDto,
    description: 'Dados para atualização de roles e permissões',
    examples: {
      example1: {
        value: {
          roles: ['franqueado', 'gerente'],
          permissions: ['users:read', 'users:create'],
        },
        summary: 'Exemplo de atualização de roles e permissões',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Roles e permissões atualizados com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string' },
        roles: { type: 'array' },
        permissions: { type: 'array' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async updateUserRoles(
    @Param('id') id: string,
    @Body() updateUserRolesDto: UpdateUserRolesDto,
    @CurrentUser() user: CurrentUserShape,
    @Req() request: any,
  ) {
    const domain = user.domain || user.profile?.domain;

    // Verificar se o usuário tem permissão para atualizar roles
    const userRoles = user.roles || [];
    const roleNames = userRoles
      .map((r: any) => {
        if (typeof r === 'object' && r !== null && 'name' in r) {
          return r.name;
        }
        return r;
      })
      .filter(Boolean);

    const systemRoles = ['system', 'sistema'];
    const isSystem = systemRoles.some((role) => roleNames.includes(role));

    if (!isSystem) {
      throw new HttpException(
        { message: 'Apenas usuários do sistema podem alterar roles e permissões' },
        HttpStatus.FORBIDDEN,
      );
    }

    // Extrair token do header Authorization
    const authHeader = request.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    console.log(
      `📋 [UsersController] Atualizando roles e permissões do usuário ${id}`,
    );
    console.log(
      `   Roles: ${updateUserRolesDto.roles?.join(', ') || 'não informado'}`,
    );
    console.log(
      `   Permissions: ${updateUserRolesDto.permissions?.join(', ') || 'não informado'}`,
    );
    console.log(`   Domain: ${domain || 'não informado'}`);

    const updatedUser = await this.usersService.updateUserRoles(
      id,
      token,
      updateUserRolesDto.roles,
      updateUserRolesDto.permissions,
      domain,
    );

    return updatedUser;
  }
}
