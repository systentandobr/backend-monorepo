import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class UnitScopeGuard implements CanActivate {
  private readonly paramKey: string = 'unitId';

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req?.user;
    
    console.log(`🔍 [UnitScopeGuard] Validando escopo para ${req.method} ${req.url}`);
    console.log(`   User: ${user?.id || 'não encontrado'}`);
    console.log(`   UnitId: ${user?.unitId || user?.profile?.unitId || 'não informado'}`);
    
    // Extrair unitId do usuário (pode vir de user.unitId ou user.profile?.unitId)
    const userUnitId: string | undefined = user?.unitId || user?.profile?.unitId;

    // Verificar se é admin (admins podem não ter unitId em algumas rotas administrativas)
    const isAdmin = user?.roles?.some((r: any) => 
      ['admin', 'sistema', 'system', 'support'].includes(r.name || r)
    ) || false;

    // Se não há unitId do usuário e não é admin, bloquear
    if (!userUnitId && !isAdmin) {
      console.error(`❌ [UnitScopeGuard] unitId ausente e usuário não é admin`);
      throw new ForbiddenException('unitId ausente no contexto do usuário');
    }

    // Checa params/body/query por unitId quando presente
    const targetUnitId = req.params?.[this.paramKey] || req.body?.[this.paramKey] || req.query?.[this.paramKey];
    if (targetUnitId && targetUnitId !== userUnitId && !isAdmin) {
      console.error(`❌ [UnitScopeGuard] Tentativa de acesso a unitId diferente: ${targetUnitId} vs ${userUnitId}`);
      throw new ForbiddenException('Acesso negado ao escopo de unidade');
    }

    console.log(`✅ [UnitScopeGuard] Escopo validado com sucesso`);
    return true;
  }
}


