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
  private readonly jwtSecret: string;

  constructor(private readonly httpService: HttpService) {
    this.sysSegurancaUrl = process.env.SYS_SEGURANCA_URL || '';
    this.sysSegurancaApiKey = process.env.SYS_SEGURANCA_API_KEY;
    this.jwtSecret = process.env.JWT_SECRET || 'change-me-in-env';
  }

  async validateToken(token: string): Promise<JwtValidationResult> {
    if (!this.sysSegurancaUrl) {
      throw new UnauthorizedException('Configuração SYS-SEGURANCA ausente');
    }
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.sysSegurancaUrl}/api/v1/auth/validate`,
          { accessToken: token },
          {
            headers: {
              'Content-Type': 'application/json',
              ...(this.sysSegurancaApiKey ? { 'x-api-key': this.sysSegurancaApiKey } : {}),
            },
            timeout: Number(process.env.SYS_SEGURANCA_TIMEOUT || 8000),
          },
        ),
      );

      const responseData = response.data as any;
      if (!responseData?.success) {
        throw new UnauthorizedException('Token inválido');
      }

      return responseData.data as JwtValidationResult;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        throw new UnauthorizedException('Token inválido ou expirado');
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

      return {
        isValid: true,
        user: {
          id: payload.sub,
          username: payload.username,
          email: payload.email,
          unitId: payload.unitId,
          roles: payload.roles || [],
          permissions: payload.permissions || [],
          isEmailVerified: payload.isEmailVerified || false,
          isActive: payload.isActive !== false,
        },
        payload,
        expiresAt: payload.exp ? new Date(payload.exp * 1000) : undefined,
      };
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async validateTokenWithFallback(token: string): Promise<JwtValidationResult> {
    try {
      return await this.validateToken(token);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('SYS-SEGURANÇA indisponível, usando validação local');
      return await this.validateTokenLocally(token);
    }
  }
}


