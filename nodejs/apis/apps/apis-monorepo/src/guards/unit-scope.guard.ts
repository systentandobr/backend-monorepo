import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class UnitScopeGuard implements CanActivate {
  private readonly paramKey: string = 'unitId';

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req?.user;
    
    // Extrair unitId do usuário (pode vir de user.unitId ou user.profile?.unitId)
    const userUnitId: string | undefined = user?.unitId || user?.profile?.unitId;

    // Se não há unitId do usuário, bloquear
    if (!userUnitId) {
      throw new ForbiddenException('unitId ausente no contexto do usuário');
    }

    // Checa params/body/query por unitId quando presente
    const targetUnitId = req.params?.[this.paramKey] || req.body?.[this.paramKey] || req.query?.[this.paramKey];
    if (targetUnitId && targetUnitId !== userUnitId) {
      throw new ForbiddenException('Acesso negado ao escopo de unidade');
    }

    return true;
  }
}


