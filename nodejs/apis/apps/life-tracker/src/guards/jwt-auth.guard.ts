import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtValidatorService } from '../services/jwt-validator.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtValidatorService: JwtValidatorService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de acesso não fornecido');
    }

    try {
      // Validar token usando SYS-SEGURANÇA com fallback local
      const validationResult = await this.jwtValidatorService.validateTokenWithFallback(token);
      
      if (!validationResult.isValid) {
        throw new UnauthorizedException('Token inválido');
      }

      // Adicionar informações do usuário à requisição
      request.user = {
        id: validationResult.user.id,
        username: validationResult.user.username,
        email: validationResult.user.email,
        roles: validationResult.user.roles,
        permissions: validationResult.user.permissions,
        isEmailVerified: validationResult.user.isEmailVerified,
        isActive: validationResult.user.isActive,
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
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
