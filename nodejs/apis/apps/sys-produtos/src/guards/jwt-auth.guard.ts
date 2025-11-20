import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtValidatorService } from '../services/jwt-validator.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtValidatorService: JwtValidatorService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token de acesso não fornecido');
    }

    const validationResult = await this.jwtValidatorService.validateTokenWithFallback(token);
    if (!validationResult.isValid) {
      throw new UnauthorizedException('Token inválido');
    }

    const u = validationResult.user || ({} as any);
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

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}


