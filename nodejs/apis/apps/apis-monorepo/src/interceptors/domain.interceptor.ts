import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Interceptor que extrai o domain do usuário autenticado e adiciona ao request
 * O domain é usado para filtrar recursos por domínio específico (multi-tenancy)
 */
@Injectable()
export class DomainInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Extrair domain do profile do usuário
    const domain = user?.profile?.domain || user?.domain;

    if (domain) {
      // Adicionar domain ao request para uso nos controllers/services
      request.domain = domain;
      
      // Também adicionar ao user para facilitar acesso
      if (request.user) {
        request.user.domain = domain;
      }

      console.log(`🌐 [DomainInterceptor] Domain extraído: ${domain}`);
    } else {
      console.warn(`⚠️ [DomainInterceptor] Domain não encontrado no usuário`);
    }

    return next.handle();
  }
}

