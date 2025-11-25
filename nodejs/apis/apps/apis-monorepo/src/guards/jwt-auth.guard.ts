import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtValidatorService } from '../services/jwt-validator.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtValidatorService: JwtValidatorService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Permitir requisições OPTIONS (preflight CORS) sem autenticação
    if (request.method === 'OPTIONS') {
      return true;
    }
    
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      console.error('[JwtAuthGuard] Token não encontrado. Headers recebidos:', {
        authorization: request.headers?.authorization ? 'Presente' : 'Ausente',
        method: request.method,
        url: request.url,
        allHeaders: Object.keys(request.headers || {})
      });
      throw new UnauthorizedException('Token de acesso não fornecido');
    }

    try {
      // Validar token usando SYS-SEGURANÇA com fallback local
      const validationResult = await this.jwtValidatorService.validateTokenWithFallback(token);
      
      if (!validationResult.isValid) {
        throw new UnauthorizedException('Token inválido');
      }

      const u = validationResult.user || ({} as any);
      
      // Extrair unitId do payload ou do user profile
      // O unitId pode vir do payload (quando vem do JWT) ou do user.profile (quando vem da API de segurança)
      const unitId = validationResult.payload?.unitId 
        || validationResult.payload?.profile?.unitId 
        || u.profile?.unitId 
        || u.unitId;

      // Adicionar informações do usuário à requisição incluindo unitId
      request.user = {
        id: u.id,
        username: u.username,
        email: u.email,
        unitId: unitId, // Crítico para escopo por unidade/franquia
        profile: u.profile || validationResult.payload?.profile,
        roles: u.roles || [],
        permissions: u.permissions || [],
        isEmailVerified: u.isEmailVerified ?? false,
        isActive: u.isActive ?? true,
        payload: validationResult.payload,
      };
      
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Erro na validação do token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
