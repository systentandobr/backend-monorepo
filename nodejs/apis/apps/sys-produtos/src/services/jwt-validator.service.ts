import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface JwtValidationResult {
  isValid: boolean;
  user: {
    id: string;
    username?: string;
    email?: string;
    unitId?: string;
    roles: any[];
    permissions: string[];
    isEmailVerified?: boolean;
    isActive?: boolean;
  };
  payload: any;
  expiresAt?: Date;
}

@Injectable()
export class JwtValidatorService {
  private readonly sysSegurancaUrl: string;
  private readonly sysSegurancaApiKey?: string;
  private readonly sysSegurancaTimeout: number;
  private readonly jwtSecret: string;

  constructor(private readonly httpService: HttpService) {
    this.sysSegurancaUrl = process.env.SYS_SEGURANCA_URL || '';
    this.sysSegurancaApiKey = process.env.SYS_SEGURANCA_API_KEY;
    this.sysSegurancaTimeout = Number(process.env.SYS_SEGURANCA_TIMEOUT || 8000);
    this.jwtSecret = process.env.JWT_SECRET || 'change-me-in-env';
  }

  async validateToken(token: string): Promise<JwtValidationResult> {
    // Se não há URL configurada, lançar exceção para que o fallback funcione
    if (!this.sysSegurancaUrl) {
      console.warn('⚠️ SYS-SEGURANCA URL não configurada, será necessário usar fallback local');
      throw new UnauthorizedException('Configuração SYS-SEGURANCA ausente');
    }
    
    const url = `${this.sysSegurancaUrl}/api/v1/auth/validate`;
    
    try {
      console.log(`🔐 Validando token com SYS-SEGURANÇA`);
      console.log(`   URL: ${this.sysSegurancaUrl}`);
      console.log(`   API Key: ${this.sysSegurancaApiKey ? '***' + this.sysSegurancaApiKey.slice(-4) : 'não configurada'}`);
      console.log(`   Timeout: ${this.sysSegurancaTimeout}ms`);
      
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          { accessToken: token },
          {
            headers: {
              'Content-Type': 'application/json',
              ...(this.sysSegurancaApiKey ? { 'x-api-key': this.sysSegurancaApiKey } : {}),
            },
            timeout: this.sysSegurancaTimeout,
          },
        ),
      );

      const responseData = response.data as any;
      
      // Log da resposta completa para debug
      console.log('📥 Resposta recebida do SYS-SEGURANÇA:', JSON.stringify(responseData, null, 2));
      
      // O endpoint pode retornar dois formatos:
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
        // Tentar extrair unitId de múltiplas fontes possíveis (prioridade: user.profile.unitId)
        const unitId = responseData.user?.profile?.unitId ||
                       responseData.user?.profile?.unit_id ||
                       responseData.user?.unitId ||
                       responseData.user?.unit_id ||
                       responseData.unitId || 
                       responseData.unit_id ||
                       responseData.profile?.unitId ||
                       responseData.profile?.unit_id ||
                       responseData.payload?.unitId ||
                       responseData.payload?.unit_id;

        if (!unitId) {
          console.warn('⚠️ unitId não encontrado na resposta do SYS-SEGURANÇA');
          console.warn('   Chaves disponíveis:', Object.keys(responseData));
          if (responseData.user) {
            console.warn('   Chaves em user:', Object.keys(responseData.user));
            if (responseData.user.profile) {
              console.warn('   Chaves em user.profile:', Object.keys(responseData.user.profile));
            }
          }
        } else {
          console.log(`✅ unitId encontrado: ${unitId}`);
        }

        // Normalizar para o formato esperado
        const userData = responseData.user || {
          id: responseData.id,
          username: responseData.username,
          email: responseData.email,
          roles: responseData.roles || [],
          permissions: responseData.permissions || [],
          isEmailVerified: responseData.isEmailVerified || false,
          isActive: responseData.isActive !== false,
        };

        validationResult = {
          isValid: true,
          user: {
            ...userData,
            unitId: unitId,
          },
          payload: responseData.payload || responseData,
          expiresAt: responseData.expiresAt ? new Date(responseData.expiresAt) : undefined,
        };
      }
      // Formato desconhecido
      else {
        console.error('❌ Formato de resposta desconhecido do SYS-SEGURANÇA:', responseData);
        throw new UnauthorizedException('Formato de resposta inválido do serviço de autenticação');
      }
      
      // Validar se o resultado tem a estrutura mínima esperada
      if (!validationResult.user || !validationResult.user.id) {
        console.error('❌ Resposta do SYS-SEGURANÇA não contém dados do usuário:', validationResult);
        throw new UnauthorizedException('Resposta inválida do serviço de autenticação');
      }
      
      console.log('✅ Token validado com sucesso pelo SYS-SEGURANÇA');
      console.log(`   Usuário: ${validationResult.user.username || validationResult.user.email || validationResult.user.id}`);
      return validationResult;
    } catch (error: any) {
      // Log detalhado do erro para debug
      if (error?.response) {
        console.error('❌JWT ValidateToken Erro na resposta do SYS-SEGURANÇA:', {
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
      } else {
        console.error('❌ Erro desconhecido na validação do token:', error.message || error);
      }
      
      throw new UnauthorizedException('Erro na validação do token');
    }
  }

  async validateTokenLocally(token: string): Promise<JwtValidationResult> {
    try {
      const { JwtService } = await import('@nestjs/jwt');
      const jwtService = new JwtService({ secret: this.jwtSecret });
      const payload: any = await jwtService.verifyAsync(token);

      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new UnauthorizedException('Token expirado');
      }

      // Tentar extrair unitId de múltiplas fontes possíveis no payload (prioridade: user.profile.unitId)
      const unitId = payload.user?.profile?.unitId ||
                     payload.user?.profile?.unit_id ||
                     payload.user?.unitId ||
                     payload.user?.unit_id ||
                     payload.profile?.unitId ||
                     payload.profile?.unit_id ||
                     payload.unitId || 
                     payload.unit_id;

      if (!unitId) {
        console.warn('⚠️ unitId não encontrado no payload do token JWT');
        console.warn('   Chaves disponíveis no payload:', Object.keys(payload));
        if (payload.user) {
          console.warn('   Chaves em payload.user:', Object.keys(payload.user));
          if (payload.user.profile) {
            console.warn('   Chaves em payload.user.profile:', Object.keys(payload.user.profile));
          }
        }
        console.warn('   Payload completo:', JSON.stringify(payload, null, 2));
      } else {
        console.log(`✅ unitId encontrado no payload: ${unitId}`);
      }

      return {
        isValid: true,
        user: {
          id: payload.sub || payload.userId || payload.id,
          username: payload.username,
          email: payload.email,
          unitId: unitId,
          roles: payload.roles || [],
          permissions: payload.permissions || [],
          isEmailVerified: payload.isEmailVerified || false,
          isActive: payload.isActive !== false,
        },
        payload,
        expiresAt: payload.exp ? new Date(payload.exp * 1000) : undefined,
      };
    } catch (error: any) {
      console.error('❌ Erro na validação local do token:', error.message);
      throw new UnauthorizedException('Token inválido');
    }
  }

  async validateTokenWithFallback(token: string): Promise<JwtValidationResult> {
    // Primeiro tentar validar com SYS-SEGURANÇA
    try {
      return await this.validateToken(token);
    } catch (error: any) {
      // Verificar tipo de erro
      const isConfigError = error.message?.includes('Configuração SYS-SEGURANCA ausente');
      const isConnectionError = error.code === 'ECONNREFUSED' || 
                                error.code === 'ETIMEDOUT' ||
                                error.code === 'ENOTFOUND' ||
                                error.message?.includes('indisponível') ||
                                error.message?.includes('timeout');
      const isTokenRejected = error.response?.status === 401 ||
                             error.message?.includes('Token inválido ou expirado');
      
      // Se o token foi explicitamente rejeitado pelo SYS-SEGURANÇA (401), não fazer fallback
      if (isTokenRejected && !isConfigError && !isConnectionError) {
        console.error('❌ Token rejeitado pelo SYS-SEGURANÇA (401):', error.message);
        throw error;
      }
      
      // Para erros de conexão ou configuração, fazer fallback local
      if (isConnectionError || isConfigError) {
        console.warn('⚠️ SYS-SEGURANÇA indisponível ou erro de conexão, usando validação local');
        console.warn(`   Erro: ${error.message || 'Erro desconhecido'}`);
        console.warn(`   Código: ${error.code || 'N/A'}`);
        console.warn(`   Status: ${error.response?.status || 'N/A'}`);
        
        try {
          const result = await this.validateTokenLocally(token);
          console.log('✅ Token validado localmente com sucesso');
          return result;
        } catch (localError: any) {
          console.error('❌ Falha na validação local do token:', localError.message);
          // Se o erro local também falhar, lançar o erro local (mais específico)
          throw localError;
        }
      }
      
      // Para outros erros não tratados, tentar fallback local também
      console.warn('⚠️ Erro não esperado do SYS-SEGURANÇA, tentando validação local como fallback');
      console.warn(`   Erro: ${error.message || 'Erro desconhecido'}`);
      
      try {
        const result = await this.validateTokenLocally(token);
        console.log('✅ Token validado localmente com sucesso (fallback)');
        return result;
      } catch (localError: any) {
        console.error('❌ Falha na validação local do token:', localError.message);
        // Se ambos falharem, lançar o erro original do SYS-SEGURANÇA
        throw error;
      }
    }
  }
}


