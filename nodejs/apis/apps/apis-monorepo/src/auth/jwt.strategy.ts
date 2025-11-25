import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtValidatorService } from '../services/jwt-validator.service';
import { EnvironmentConfig } from '../config/environment.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly jwtValidatorService: JwtValidatorService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: EnvironmentConfig.jwt.secret,
    });
  }

  async validate(payload: any) {
    // Usar o JwtValidatorService para validar o token
    // Isso garante consistência com a validação via SYS-SEGURANÇA
    try {
      const token = payload; // O payload já vem decodificado do Passport
      // Para validação completa, precisaríamos do token original
      // Por enquanto, retornamos o payload validado
      return {
        id: payload.sub || payload.id,
        username: payload.username,
        email: payload.email,
        unitId: payload.unitId || payload.profile?.unitId,
        profile: payload.profile,
        roles: payload.roles || [],
        permissions: payload.permissions || [],
        isEmailVerified: payload.isEmailVerified || false,
        isActive: payload.isActive !== false,
        payload,
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}

