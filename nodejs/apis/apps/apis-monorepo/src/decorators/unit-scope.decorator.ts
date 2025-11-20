import { applyDecorators, UseGuards, UseInterceptors } from '@nestjs/common';
import { UnitScopeGuard } from '../guards/unit-scope.guard';
import { UnitIdInterceptor } from '../interceptors/unit-id.interceptor';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

/**
 * Decorator que aplica automaticamente:
 * - JwtAuthGuard: Valida autenticação
 * - UnitIdInterceptor: Injeta unitId nas queries
 * - UnitScopeGuard: Valida escopo de unidade
 * 
 * Uso:
 * @UnitScope()
 * @Get()
 * async list(@Query() filters: FiltersDto) { ... }
 */
export function UnitScope() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, UnitScopeGuard),
    UseInterceptors(UnitIdInterceptor),
  );
}

