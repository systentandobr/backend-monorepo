import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Interceptor que automaticamente adiciona unitId do usuário autenticado
 * nas queries GET para filtrar dados por unidade/franquia
 */
@Injectable()
export class UnitIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Extrair unitId do usuário autenticado
    // Pode vir de user.unitId ou user.profile?.unitId dependendo da estrutura
    const unitId = user?.unitId || user?.profile?.unitId;

    // Para requisições GET, adicionar unitId como query parameter
    if (unitId && request.method === 'GET') {
      request.query = request.query || {};
      // Não sobrescrever se já foi especificado explicitamente
      if (!request.query.unitId) {
        request.query.unitId = unitId;
      }
    }

    // Para requisições POST/PUT/PATCH, adicionar unitId no body se não existir
    if (unitId && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      request.body = request.body || {};
      if (!request.body.unitId) {
        request.body.unitId = unitId;
      }
    }

    return next.handle();
  }
}

