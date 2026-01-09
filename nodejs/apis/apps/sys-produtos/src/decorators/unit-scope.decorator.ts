import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para marcar rotas que requerem validação de unitId
 * A validação é feita manualmente nos métodos do controller
 */
export const UnitScope = () => SetMetadata('unitScope', true);
