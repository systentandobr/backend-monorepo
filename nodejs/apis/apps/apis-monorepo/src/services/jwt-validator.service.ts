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
    try {
      console.log('Validando token com SYS-SEGURANÇA' + this.sysSegurancaUrl);
      console.log('Token' + token);
      console.log('Sys Seguranca Api Key' + EnvironmentConfig.sysSeguranca.apiKey);
      console.log('Sys Seguranca Timeout' + EnvironmentConfig.sysSeguranca.timeout);
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.sysSegurancaUrl}/api/v1/auth/validate`,
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
      if (!responseData.success) {
        throw new UnauthorizedException('Token inválido');
      }

      return responseData.data;
    } catch (error) {
      console.error('Erro ao validar token com SYS-SEGURANÇA:', error);
      
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Token inválido ou expirado');
      }
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new UnauthorizedException('Serviço de autenticação indisponível');
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
      console.log('Fallback SYS-SEGURANÇA validando token' + token);
      return await this.validateToken(token);
    } catch (error) {
      console.warn('SYS-SEGURANÇA indisponível, usando validação local:', error.message);
      
      // Fallback para validação local
      return await this.validateTokenLocally(token);
    }
  }
}
