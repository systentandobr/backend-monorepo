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
      console.log(`🔒 [JwtAuthGuard] Validando autenticação para ${request.method} ${request.url}`);
      
      // Validar token usando SYS-SEGURANÇA com fallback local
      const validationResult = await this.jwtValidatorService.validateTokenWithFallback(token);
      
      console.log(`📋 [JwtAuthGuard] Resultado da validação:`, {
        isValid: validationResult.isValid,
        hasUser: !!validationResult.user,
        userId: validationResult.user?.id,
        username: validationResult.user?.username,
        email: validationResult.user?.email,
        profile: validationResult.user?.profile,
      });
      
      if (!validationResult || !validationResult.isValid) {
        console.error('❌ [JwtAuthGuard] Resultado de validação inválido:', validationResult);
        throw new UnauthorizedException('Token inválido');
      }

      const u = validationResult.user || ({} as any);
      
      if (!u.id) {
        console.error('❌ [JwtAuthGuard] Usuário não encontrado no resultado de validação:', validationResult);
        throw new UnauthorizedException('Dados do usuário não encontrados');
      }
      
      // Extrair unitId do payload ou do user profile
      // O unitId pode vir do payload (quando vem do JWT) ou do user.profile (quando vem da API de segurança)
      const unitId = validationResult.payload?.unitId 
        || validationResult.payload?.profile?.unitId 
        || u.profile?.unitId 
        || u.unitId;

      // Extrair domain do profile do usuário (crítico para multi-tenancy)
      const domain = u.profile?.domain 
        || validationResult.payload?.profile?.domain
        || validationResult.payload?.domain;

      // Adicionar informações do usuário à requisição incluindo unitId e domain
      request.user = {
        id: u.id,
        username: u.username,
        email: u.email,
        unitId: unitId, // Crítico para escopo por unidade/franquia
        domain: domain, // Crítico para filtro por domínio (multi-tenancy)
        profile: u.profile || validationResult.payload?.profile,
        roles: u.roles || [],
        permissions: u.permissions || [],
        isEmailVerified: u.isEmailVerified ?? false,
        isActive: u.isActive ?? true,
        payload: validationResult.payload,
      };
      
      console.log(`✅ [JwtAuthGuard] Autenticação bem-sucedida para usuário: ${u.username || u.email || u.id}`);
      console.log(`   UnitId: ${unitId || 'não informado'}`);
      console.log(`   Domain: ${domain || 'não informado'}`);
      console.log(`   Roles: ${(u.roles || []).map((r: any) => r.name || r).join(', ') || 'nenhum'}`);
      
      return true;
    } catch (error: any) {
      console.error(`❌ [JwtAuthGuard] Erro na validação:`, {
        message: error.message,
        status: error.status,
        isUnauthorized: error instanceof UnauthorizedException,
        stack: error.stack,
      });
      
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
