import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EnvironmentConfig } from '../config/environment.config';

export interface JwtValidationResult {
  isValid: boolean;
  user: {
    id: string;
    username: string;
    email: string;
    profile?: {
      unitId?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      [key: string]: any;
    };
    unitId?: string;
    roles: Array<{
      id: string;
      name: string;
      description: string;
      permissions: string[];
      isSystem: boolean;
      isActive: boolean;
    }>;
    permissions: string[];
    isEmailVerified: boolean;
    isActive: boolean;
  };
  payload: any;
  expiresAt: Date;
}

@Injectable()
export class JwtValidatorService {
  private readonly sysSegurancaUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.sysSegurancaUrl = EnvironmentConfig.sysSeguranca.url;
  }

  /**
   * Valida um token JWT consultando o SYS-SEGURANÇA
   */
  async validateToken(token: string): Promise<JwtValidationResult> {
    const url = `${this.sysSegurancaUrl}/api/v1/auth/validate`;
    
    try {
      console.log('🔐 Validando token com SYS-SEGURANÇA');
      console.log(`   URL: ${this.sysSegurancaUrl}`);
      console.log(`   API Key: ${EnvironmentConfig.sysSeguranca.apiKey ? '***' + EnvironmentConfig.sysSeguranca.apiKey.slice(-4) : 'não configurada'}`);
      console.log(`   Timeout: ${EnvironmentConfig.sysSeguranca.timeout}ms`);
      
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          { accessToken: token },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': EnvironmentConfig.sysSeguranca.apiKey,
            },
            timeout: EnvironmentConfig.sysSeguranca.timeout,
          }
        )
      );

      const responseData = response.data as any;
      
      // Log da resposta completa para debug
      console.log('📥 Resposta recebida do SYS-SEGURANÇA:', JSON.stringify(responseData, null, 2));
      
      // O endpoint pode retornar diferentes formatos:
      // 1. { success: true, data: { isValid, user, payload, expiresAt } }
      // 2. { isValid, user, payload, expiresAt } (formato direto)
      // 3. Apenas o objeto user (quando retornado pelo controller)
      
      let validationResult: JwtValidationResult;
      
      if (responseData.success === false) {
        console.error('❌ Resposta do SYS-SEGURANÇA indicou falha:', responseData);
        throw new UnauthorizedException('Token inválido');
      }
      
      // Se tem success: true e data, usar data
      if (responseData.success === true && responseData.data) {
        validationResult = responseData.data as JwtValidationResult;
      }
      // Se tem isValid, é o formato direto
      else if (responseData.isValid !== undefined) {
        validationResult = responseData as JwtValidationResult;
      }
      // Se tem user mas não tem isValid, pode ser apenas o user (formato do controller)
      else if (responseData.user || responseData.id) {
        // Normalizar para o formato esperado
        validationResult = {
          isValid: true,
          user: responseData.user || {
            id: responseData.id,
            username: responseData.username,
            email: responseData.email,
            unitId: responseData.unitId || responseData.profile?.unitId,
            profile: responseData.profile,
            roles: responseData.roles || [],
            permissions: responseData.permissions || [],
            isEmailVerified: responseData.isEmailVerified || false,
            isActive: responseData.isActive !== false,
          },
          payload: responseData.payload || responseData,
          expiresAt: responseData.expiresAt ? new Date(responseData.expiresAt) : new Date(Date.now() + 3600000), // Default 1h se não informado
        };
      }
      // Formato desconhecido
      else {
        console.error('❌ Formato de resposta desconhecido do SYS-SEGURANÇA:', responseData);
        throw new UnauthorizedException('Formato de resposta inválido do serviço de autenticação');
      }
      
      // Garantir que isValid está definido como true se chegou até aqui
      if (validationResult.isValid !== true) {
        validationResult.isValid = true;
      }
      
      // Validar se o resultado tem a estrutura mínima esperada
      if (!validationResult.user || !validationResult.user.id) {
        console.error('❌ Resposta do SYS-SEGURANÇA não contém dados do usuário:', validationResult);
        throw new UnauthorizedException('Resposta inválida do serviço de autenticação');
      }
      
      // Verificar se o usuário está ativo
      if (!validationResult.user.isActive) {
        console.error('❌ Usuário não está ativo:', validationResult.user);
        throw new UnauthorizedException('User is not active');
      }
      
      console.log('✅ Token validado com sucesso pelo SYS-SEGURANÇA');
      console.log(`   Usuário: ${validationResult.user.username || validationResult.user.email || validationResult.user.id}`);
      console.log(`   UnitId: ${validationResult.user.unitId || validationResult.user.profile?.unitId || 'não informado'}`);
      
      return validationResult;
    } catch (error: any) {
      // Log detalhado do erro para debug
      if (error?.response) {
        console.error('❌ Erro na resposta do SYS-SEGURANÇA:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url,
        });
        
        if (error.response.status === 401) {
          throw new UnauthorizedException('Token inválido ou expirado');
        }
      } else if (error?.code) {
        console.error('❌ Erro de conexão com SYS-SEGURANÇA:', {
          code: error.code,
          message: error.message,
          url,
        });
        
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
          throw new UnauthorizedException('Serviço de autenticação indisponível');
        }
      } else if (error instanceof UnauthorizedException) {
        // Se já é UnauthorizedException, apenas relançar
        throw error;
      } else {
        console.error('❌ Erro desconhecido na validação do token:', error.message || error);
      }
      
      throw new UnauthorizedException('Erro na validação do token');
    }
  }

  /**
   * Valida um token JWT localmente (fallback quando SYS-SEGURANÇA não está disponível)
   */
  async validateTokenLocally(token: string): Promise<JwtValidationResult> {
    try {
      // Importar JWT service dinamicamente para evitar dependência circular
      const { JwtService } = await import('@nestjs/jwt');
      const jwtService = new JwtService({
        secret: EnvironmentConfig.jwt.secret,
      });

      const payload = await jwtService.verifyAsync(token);
      
      // Verificar se o token não expirou
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new UnauthorizedException('Token expirado');
      }

      return {
        isValid: true,
        user: {
          id: payload.sub,
          username: payload.username,
          email: payload.email,
          profile: payload.profile,
          unitId: payload.unitId || payload.profile?.unitId,
          roles: payload.roles || [],
          permissions: payload.permissions || [],
          isEmailVerified: payload.isEmailVerified || false,
          isActive: payload.isActive !== false,
        },
        payload,
        expiresAt: new Date(payload.exp * 1000),
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  /**
   * Valida token com fallback para validação local
   */
  async validateTokenWithFallback(token: string): Promise<JwtValidationResult> {
    try {
      // Tentar validar com SYS-SEGURANÇA primeiro
      console.log('🔄 [JwtValidatorService] Tentando validar token com SYS-SEGURANÇA...');
      const result = await this.validateToken(token);
      console.log('✅ [JwtValidatorService] Validação com SYS-SEGURANÇA bem-sucedida');
      return result;
    } catch (error: any) {
      console.warn('⚠️ [JwtValidatorService] SYS-SEGURANÇA indisponível ou falhou, usando validação local:', {
        message: error.message,
        status: error.status,
      });
      
      // Fallback para validação local
      try {
        const localResult = await this.validateTokenLocally(token);
        console.log('✅ [JwtValidatorService] Validação local bem-sucedida');
        return localResult;
      } catch (localError: any) {
        console.error('❌ [JwtValidatorService] Validação local também falhou:', localError.message);
        throw localError;
      }
    }
  }
}
