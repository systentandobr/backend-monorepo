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
      console.warn('⚠️ Requisição sem token de autenticação:', {
        method: request.method,
        path: request.url,
        headers: Object.keys(request.headers),
      });
      throw new UnauthorizedException('Token de acesso não fornecido');
    }

    try {
      console.log(`🔒 Validando autenticação para ${request.method} ${request.url}`);
      
      const validationResult = await this.jwtValidatorService.validateTokenWithFallback(token);
      
      if (!validationResult || !validationResult.isValid) {
        console.error('❌ Resultado de validação inválido:', validationResult);
        throw new UnauthorizedException('Token inválido');
      }

      const u = validationResult.user || ({} as any);
      
      if (!u.id) {
        console.error('❌ Usuário não encontrado no resultado de validação:', validationResult);
        throw new UnauthorizedException('Dados do usuário não encontrados');
      }

      request.user = {
        id: u.id,
        username: u.username,
        email: u.email,
        unitId: u.unitId,
        roles: u.roles || [],
        permissions: u.permissions || [],
        isEmailVerified: u.isEmailVerified ?? false,
        isActive: u.isActive ?? true,
        payload: validationResult.payload,
      };

      console.log(`✅ Autenticação bem-sucedida para usuário: ${u.username || u.email || u.id}`);
      return true;
    } catch (error: any) {
      // Se já é UnauthorizedException, apenas relançar
      if (error instanceof UnauthorizedException) {
        console.error(`❌ Falha na autenticação: ${error.message}`);
        throw error;
      }
      
      // Para outros erros, converter para UnauthorizedException
      console.error('❌ Erro inesperado na autenticação:', error.message || error);
      throw new UnauthorizedException('Erro na validação do token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}


