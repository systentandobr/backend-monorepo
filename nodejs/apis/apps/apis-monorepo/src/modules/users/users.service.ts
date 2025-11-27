import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EnvironmentConfig } from '../../config/environment.config';

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
    unitId: string,
    token: string,
    domain?: string,
  ): Promise<User> {
    try {
      console.log(`🔄 [UsersService] Atualizando unitId do usuário ${userId} para ${unitId}`);

      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.sysSegurancaUrl}/api/v1/users/${userId}/unit`,
          { unitId },
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
}

