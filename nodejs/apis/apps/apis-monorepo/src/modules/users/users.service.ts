import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EnvironmentConfig } from '../../config/environment.config';
import { CurrentUserShape } from '../../decorators/current-user.decorator';

export interface User {
  id: string;
  username: string;
  email: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    domain?: string;
    [key: string]: any;
  };
  roles?: Array<{
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isSystem: boolean;
    isActive: boolean;
  }>;
  isActive: boolean;
}

export interface UsersListResponse {
  data: User[];
  total: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class UsersService {
  private readonly sysSegurancaUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.sysSegurancaUrl = EnvironmentConfig.sysSeguranca.url;
  }

  /**
   * Lista usuários disponíveis filtrados por domain
   * Usa o endpoint getAllUsersByDomain do SYS-SEGURANÇA com header x-domain
   */
  async findAvailableUsers(
    domain: string,
    token: string,
    search?: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<UsersListResponse> {
    try {
      console.log(`🔍 [UsersService] Buscando usuários disponíveis para domain: ${domain}`);
      console.log(`   Search: ${search || 'não informado'}`);
      console.log(`   Page: ${page}, Limit: ${limit}`);

      const params: any = {
        page,
        limit,
      };

      if (search) {
        params.search = search;
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.sysSegurancaUrl}/api/v1/users`, {
          params,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-api-key': EnvironmentConfig.sysSeguranca.apiKey,
            'x-domain': domain, // Header para filtrar por domain
          },
          timeout: EnvironmentConfig.sysSeguranca.timeout,
        })
      );

      const responseData = response.data;

      // O endpoint pode retornar diferentes formatos
      let users: User[] = [];
      let total = 0;

      if (responseData.success === false) {
        console.error('❌ Resposta do SYS-SEGURANÇA indicou falha:', responseData);
        throw new Error('Erro ao buscar usuários');
      }

      // Se tem success: true e data, usar data
      if (responseData.success === true && responseData.data) {
        users = Array.isArray(responseData.data) 
          ? responseData.data 
          : responseData.data.users || [];
        total = responseData.total || responseData.data.total || users.length;
      }
      // Se é array direto
      else if (Array.isArray(responseData)) {
        users = responseData;
        total = responseData.length;
      }
      // Se tem users no objeto
      else if (responseData.users) {
        users = Array.isArray(responseData.users) ? responseData.users : [];
        total = responseData.total || users.length;
      }
      // Se tem data no objeto
      else if (responseData.data) {
        users = Array.isArray(responseData.data) ? responseData.data : [];
        total = responseData.total || users.length;
      }

      console.log(`✅ [UsersService] ${users.length} usuários encontrados para domain ${domain}`);

      return {
        data: users,
        total,
        page,
        limit,
      };
    } catch (error: any) {
      console.error('❌ [UsersService] Erro ao buscar usuários:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response?.status === 404) {
        // Se o endpoint não existe, retornar lista vazia
        console.warn('⚠️ [UsersService] Endpoint /api/v1/users não encontrado no SYS-SEGURANÇA');
        return {
          data: [],
          total: 0,
          page,
          limit,
        };
      }

      if (error.response?.status === 401) {
        throw new Error('Não autorizado para buscar usuários');
      }

      throw new Error(`Erro ao buscar usuários: ${error.message}`);
    }
  }

  /**
   * Busca todos os usuários por domain usando o endpoint getAllUsersByDomain
   * Este método usa o header x-domain para filtrar no SYS-SEGURANÇA
   */
  async getAllUsersByDomain(
    domain: string,
    token: string,
    search?: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<UsersListResponse> {
    try {
      console.log(`🔍 [UsersService] getAllUsersByDomain para domain: ${domain}`);
      console.log(`   Search: ${search || 'não informado'}`);
      console.log(`   Page: ${page}, Limit: ${limit}`);

      const params: any = {
        page,
        limit,
      };

      if (search) {
        params.search = search;
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.sysSegurancaUrl}/api/v1/users/all/${domain}`, {
          params,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-api-key': EnvironmentConfig.sysSeguranca.apiKey,
            'x-domain': domain,
          },
          timeout: EnvironmentConfig.sysSeguranca.timeout,
        })
      );

      const responseData = response.data;

      // O endpoint pode retornar diferentes formatos
      let users: User[] = [];
      let total = 0;

      if (responseData.success === false) {
        console.error('❌ Resposta do SYS-SEGURANÇA indicou falha:', responseData);
        throw new Error('Erro ao buscar usuários por domain');
      }

      // Se tem success: true e data, usar data
      if (responseData.success === true && responseData.data) {
        users = Array.isArray(responseData.data) 
          ? responseData.data 
          : responseData.data.users || [];
        total = responseData.total || responseData.data.total || users.length;
      }
      // Se é array direto
      else if (Array.isArray(responseData)) {
        users = responseData;
        total = responseData.length;
      }
      // Se tem users no objeto
      else if (responseData.users) {
        users = Array.isArray(responseData.users) ? responseData.users : [];
        total = responseData.total || users.length;
      }
      // Se tem data no objeto
      else if (responseData.data) {
        users = Array.isArray(responseData.data) ? responseData.data : [];
        total = responseData.total || users.length;
      }

      console.log(`✅ [UsersService] getAllUsersByDomain: ${users.length} usuários encontrados para domain ${domain}`);

      return {
        data: users,
        total,
        page,
        limit,
      };
    } catch (error: any) {
      console.error('❌ [UsersService] Erro ao buscar usuários por domain:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response?.status === 404) {
        // Se o endpoint não existe, tentar fallback para o método findAvailableUsers
        console.warn('⚠️ [UsersService] Endpoint /api/v1/users/by-domain não encontrado, usando fallback');
        return this.findAvailableUsers(domain, token, search, page, limit);
      }

      if (error.response?.status === 401) {
        throw new Error('Não autorizado para buscar usuários');
      }

      throw new Error(`Erro ao buscar usuários por domain: ${error.message}`);
    }
  }

  /**
   * Busca um usuário por ID
   */
  async findUserById(userId: string, token: string, domain?: string): Promise<User | null> {
    try {
        const response = await firstValueFrom(
        this.httpService.get(`${this.sysSegurancaUrl}/api/v1/users/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-api-key': EnvironmentConfig.sysSeguranca.apiKey,
            'x-domain': domain,
          },
          timeout: EnvironmentConfig.sysSeguranca.timeout,
        })
      );

      const responseData = response.data;

      if (responseData.success === false) {
        return null;
      }

      return responseData.data || responseData;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Erro ao buscar usuário:', error);
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }
  }

  /**
   * Atualiza o unitId de um usuário
   */
  async updateUserUnit(
    userId: string,
    unitId: string | null | undefined,
    token: string,
    domain?: string,
  ): Promise<User> {
    try {
      const unitIdValue = unitId === null || unitId === undefined ? '' : unitId;
      console.log(`🔄 [UsersService] Atualizando unitId do usuário ${userId} para ${unitIdValue || '(removendo)'}`);

      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.sysSegurancaUrl}/api/v1/users/${userId}/unit`,
          { unitId: unitIdValue },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'x-api-key': EnvironmentConfig.sysSeguranca.apiKey,
              ...(domain ? { 'x-domain': domain } : {}),
            },
            timeout: EnvironmentConfig.sysSeguranca.timeout,
          }
        )
      );

      const responseData = response.data;

      if (responseData.success === false) {
        console.error('❌ Resposta do SYS-SEGURANÇA indicou falha:', responseData);
        throw new Error(responseData.message || 'Erro ao atualizar unitId do usuário');
      }

      // Retornar o usuário atualizado
      const updatedUser = responseData.data || responseData;
      
      console.log(`✅ [UsersService] unitId atualizado com sucesso para usuário ${userId}`);

      return updatedUser;
    } catch (error: any) {
      console.error('❌ [UsersService] Erro ao atualizar unitId do usuário:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response?.status === 404) {
        throw new Error('Usuário não encontrado');
      }

      if (error.response?.status === 401) {
        throw new Error('Não autorizado para atualizar usuário');
      }

      if (error.response?.status === 403) {
        throw new Error('Acesso negado para atualizar usuário');
      }

      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Erro ao atualizar unitId do usuário: ${errorMessage}`);
    }
  }

  /**
   * Busca usuários por unitId
   */
  async findUsersByUnitId(
    unitId: string,
    token: string,
    domain?: string,
    search?: string,
    page: number = 1,
    limit: number = 50,
    currentUser?: any, // Usuário atual para verificação de permissões (opcional)
  ): Promise<UsersListResponse> {
    // Decodificar unitId se vier URL encoded (ex: %23BR%23RN...)
    const decodedUnitId = decodeURIComponent(unitId);
    
    try {
      console.log(`🔍 [UsersService] Buscando usuários por unitId: ${decodedUnitId}`);
      console.log(`   UnitId original (URL encoded): ${unitId}`);
      console.log(`   Domain: ${domain || 'não informado'}`);
      console.log(`   Search: ${search || 'não informado'}`);
      console.log(`   Page: ${page}, Limit: ${limit}`);

      const params: any = {
        unitId: decodedUnitId, // Usar unitId decodificado
        page,
        limit,
      };

      if (search) {
        params.search = search;
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.sysSegurancaUrl}/api/v1/users/by-unit`, {
          params,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-api-key': EnvironmentConfig.sysSeguranca.apiKey,
            ...(domain ? { 'x-domain': domain } : {}),
          },
          timeout: EnvironmentConfig.sysSeguranca.timeout,
        })
      );

      const responseData = response.data;

      // O endpoint pode retornar diferentes formatos
      let users: User[] = [];
      let total = 0;

      if (responseData.success === false) {
        console.error('❌ Resposta do SYS-SEGURANÇA indicou falha:', responseData);
        throw new Error(responseData.message || 'Erro ao buscar usuários por unitId');
      }

      // Se tem success: true e data, usar data
      if (responseData.success === true && responseData.data) {
        users = Array.isArray(responseData.data) 
          ? responseData.data 
          : responseData.data.users || [];
        total = responseData.total || responseData.data.total || users.length;
      }
      // Se é array direto
      else if (Array.isArray(responseData)) {
        users = responseData;
        total = responseData.length;
      }
      // Se tem users no objeto
      else if (responseData.users) {
        users = Array.isArray(responseData.users) ? responseData.users : [];
        total = responseData.total || users.length;
      }
      // Se tem data no objeto
      else if (responseData.data) {
        users = Array.isArray(responseData.data) ? responseData.data : [];
        total = responseData.total || users.length;
      }

      console.log(`✅ [UsersService] ${users.length} usuários encontrados para unitId ${decodedUnitId}`);

      return {
        data: users,
        total,
        page,
        limit,
      };
    } catch (error: any) {
      console.error('❌ [UsersService] Erro ao buscar usuários por unitId:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response?.status === 404) {
        console.warn('⚠️ [UsersService] Endpoint /api/v1/users/by-unit não encontrado no SYS-SEGURANÇA');
        return {
          data: [],
          total: 0,
          page,
          limit,
        };
      }

      if (error.response?.status === 401) {
        throw new Error('Não autorizado para buscar usuários');
      }

      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Parâmetros inválidos';
        console.error('❌ [UsersService] Erro 400 - Detalhes:', {
          message: errorMessage,
          unitId: decodedUnitId,
          responseData: error.response?.data,
        });
        throw new Error(`Erro na requisição: ${errorMessage}. Verifique se o unitId "${decodedUnitId}" é válido.`);
      }

      throw new Error(`Erro ao buscar usuários por unitId: ${error.message}`);
    }
  }

  /**
   * Cria um novo usuário no SYS-SEGURANÇA
   */
  async createUser(
    createUserDto: {
      email: string;
      username: string;
      password: string;
      firstName: string;
      lastName: string;
      country: string;
      state: string;
      zipCode: string;
      localNumber: string;
      unitName: string;
      address: string;
      complement: string;
      neighborhood: string;
      city: string;
      latitude: number;
      longitude: number;
      unitId?: string;
    },
    token: string,
    domain: string,
    user: CurrentUserShape,
  ): Promise<User> {
    try {
      console.log(`➕ [UsersService] Criando novo usuário: ${createUserDto.email}`);
      console.log(`   Domain: ${domain}`);

      // Preparar payload para o SYS-SEGURANÇA
      // O SYS-SEGURANÇA espera firstName, lastName e campos de endereço separados
      // NÃO incluir roles, permissions, isEmailVerified, isActive, unitId - esses campos não são permitidos no CreateUserDto
      // O unitId será atualizado após a criação do usuário através do endpoint PATCH /users/:id/unit
      const payload = {
        email: createUserDto.email,
        username: createUserDto.username,
        password: createUserDto.password,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        country: createUserDto.country,
        state: createUserDto.state,
        zipCode: createUserDto.zipCode,
        localNumber: createUserDto.localNumber,
        unitName: createUserDto.unitName,
        address: createUserDto.address,
        complement: createUserDto.complement,
        neighborhood: createUserDto.neighborhood,
        city: createUserDto.city,
        latitude: createUserDto.latitude,
        longitude: createUserDto.longitude,
        domain: domain,
      };

      // Log do token sendo enviado (apenas primeiros e últimos caracteres para segurança)
      const tokenPreview = token.length > 20 
        ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}`
        : '***';
      
      console.log(`📤 [UsersService] Enviando requisição para SYS-SEGURANÇA:`, {
        url: `${this.sysSegurancaUrl}/api/v1/auth/register`,
        tokenPreview,
        domain,
        payloadKeys: Object.keys(payload),
      });

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.sysSegurancaUrl}/api/v1/auth/register`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'x-api-key': EnvironmentConfig.sysSeguranca.apiKey,
              'x-domain': domain,
            },
            timeout: EnvironmentConfig.sysSeguranca.timeout,
          }
        )
      );

      const responseData = response.data;

      if (responseData.success === false) {
        console.error('❌ Resposta do SYS-SEGURANÇA indicou falha:', responseData);
        throw new Error(responseData.message || 'Erro ao criar usuário');
      }

      // O SYS-SEGURANÇA retorna o usuário criado
      const createdUser = responseData.user || responseData.data || responseData;

      // Se o usuário foi criado com sucesso e tem unitId, atualizar o unitId
      if (createUserDto.unitId && createdUser.id) {
        try {
          await this.updateUserUnit(
            createdUser.id,
            createUserDto.unitId,
            token,
            domain,
          );
        } catch (unitError) {
          console.warn('⚠️ [UsersService] Erro ao atualizar unitId após criação:', unitError);
          // Não falhar a criação se o unitId não puder ser atualizado
        }
      }

      console.log(`✅ [UsersService] Usuário criado com sucesso: ${createdUser.id}`);

      return createdUser;
    } catch (error: any) {
      console.error('❌ [UsersService] Erro ao criar usuário:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Tratar erros HTTP específicos e propagar com status code correto
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Dados inválidos';
        // Se a mensagem é um array, juntar as mensagens
        const message = Array.isArray(errorMessage) 
          ? errorMessage.join(', ') 
          : errorMessage;
        throw new HttpException(
          { message: `Erro na criação do usuário: ${message}`, error: 'Bad Request' },
          HttpStatus.BAD_REQUEST
        );
      }

      if (error.response?.status === 409) {
        // Extrair mensagem do SYS-SEGURANÇA - pode vir em diferentes formatos
        const responseData = error.response?.data;
        let errorMessage = 'Username ou email já existem';
        
        if (responseData) {
          if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else if (responseData.message) {
            // Se message é array, juntar; se string, usar diretamente
            errorMessage = Array.isArray(responseData.message) 
              ? responseData.message.join(', ')
              : responseData.message;
          } else if (responseData.error) {
            errorMessage = responseData.error;
          }
        }
        
        throw new HttpException(
          { message: errorMessage, error: 'Conflict' },
          HttpStatus.CONFLICT
        );
      }

      if (error.response?.status === 401) {
        throw new HttpException(
          { message: 'Não autorizado para criar usuário', error: 'Unauthorized' },
          HttpStatus.UNAUTHORIZED
        );
      }

      if (error.response?.status === 403) {
        throw new HttpException(
          { message: 'Acesso negado para criar usuário', error: 'Forbidden' },
          HttpStatus.FORBIDDEN
        );
      }

      // Para outros erros, usar status 500 mas manter a mensagem original
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao criar usuário';
      throw new HttpException(
        { message: errorMessage, error: 'Internal Server Error' },
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Atualiza roles e permissões de um usuário
   */
  async updateUserRoles(
    userId: string,
    token: string,
    roles?: string[],
    permissions?: string[],
    domain?: string,
  ): Promise<User> {
    try {
      console.log(`🔄 [UsersService] Atualizando roles e permissões do usuário ${userId}`);
      console.log(`   Roles: ${roles?.join(', ') || 'não informado'}`);
      console.log(`   Permissions: ${permissions?.join(', ') || 'não informado'}`);

      const payload: any = {};
      if (roles !== undefined) {
        payload.roles = roles;
      }
      if (permissions !== undefined) {
        payload.permissions = permissions;
      }

      // Usar o endpoint específico para atualização de roles e permissões
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.sysSegurancaUrl}/api/v1/users/${userId}/roles`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'x-api-key': EnvironmentConfig.sysSeguranca.apiKey,
              ...(domain ? { 'x-domain': domain } : {}),
            },
            timeout: EnvironmentConfig.sysSeguranca.timeout,
          }
        )
      );

      const responseData = response.data;

      if (responseData.success === false) {
        console.error('❌ Resposta do SYS-SEGURANÇA indicou falha:', responseData);
        throw new Error(responseData.message || 'Erro ao atualizar roles e permissões do usuário');
      }

      // Retornar o usuário atualizado
      const updatedUser = responseData.data || responseData.user || responseData;
      
      console.log(`✅ [UsersService] Roles e permissões atualizados com sucesso para usuário ${userId}`);

      return updatedUser;
    } catch (error: any) {
      console.error('❌ [UsersService] Erro ao atualizar roles e permissões do usuário:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });

      // Verificar se é erro 404 - pode ser rota não encontrada ou usuário não encontrado
      if (error.response?.status === 404) {
        const errorMessage = error.response?.data?.message || '';
        
        // Se a mensagem indica que a rota não foi encontrada (Cannot PATCH), 
        // isso significa que o endpoint não existe na API de segurança
        if (errorMessage.includes('Cannot PATCH') || errorMessage.includes('Not Found')) {
          throw new HttpException(
            {
              message: 'Endpoint de atualização de roles não está disponível na API de segurança. Verifique se a API de segurança está atualizada.',
              error: 'Endpoint Not Found',
            },
            HttpStatus.NOT_FOUND
          );
        }
        
        // Caso contrário, é usuário não encontrado
        throw new HttpException(
          {
            message: 'Usuário não encontrado ou não pertence ao domain',
            error: 'Not Found',
          },
          HttpStatus.NOT_FOUND
        );
      }

      if (error.response?.status === 401) {
        throw new HttpException(
          {
            message: 'Não autorizado para atualizar usuário',
            error: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED
        );
      }

      if (error.response?.status === 403) {
        throw new HttpException(
          {
            message: 'Acesso negado para atualizar usuário',
            error: 'Forbidden',
          },
          HttpStatus.FORBIDDEN
        );
      }

      if (error.response?.status === 400) {
        throw new HttpException(
          {
            message: error.response?.data?.message || 'Dados inválidos',
            error: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const errorMessage = error.response?.data?.message || error.message;
      throw new HttpException(
        {
          message: `Erro ao atualizar roles e permissões do usuário: ${errorMessage}`,
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

