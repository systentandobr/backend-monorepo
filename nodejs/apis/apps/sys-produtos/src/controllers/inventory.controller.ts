import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, CurrentUserShape } from '../decorators/current-user.decorator';
import { InventoryService } from '../services/inventory.service';
import { ReplenishPlanRequestDto, ReplenishPlanResponseDto } from '../dto/replenish-plan.dto';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post('replenish/plan')
  @ApiOperation({ summary: 'Gerar plano de reposição de estoque' })
  @ApiResponse({ 
    status: 200, 
    description: 'Plano de reposição gerado com sucesso',
    type: ReplenishPlanResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async generateReplenishPlan(
    @Body() dto: ReplenishPlanRequestDto,
    @CurrentUser() user: CurrentUserShape,
  ): Promise<ReplenishPlanResponseDto> {
    // Se unitId não vier no body, usar o do usuário
    const unitId = dto.unitId || (user.unitId as string);
    
    if (!unitId) {
      throw new Error('unitId é obrigatório');
    }

    return this.inventoryService.generateReplenishPlan(unitId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('availability')
  @ApiOperation({ summary: 'Obter disponibilidade de estoque para produtos' })
  @ApiResponse({ status: 200, description: 'Disponibilidade obtida com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getAvailability(
    @Query('productIds') productIds: string,
    @Query('unitId') unitId?: string,
    @CurrentUser() user?: CurrentUserShape,
  ) {
    // Se unitId não vier na query, usar o do usuário
    const finalUnitId = unitId || (user?.unitId as string);
    
    if (!finalUnitId) {
      throw new Error('unitId é obrigatório');
    }

    if (!productIds) {
      throw new Error('productIds é obrigatório');
    }

    const productIdsArray = productIds.split(',').filter((id) => id.trim());
    
    if (productIdsArray.length === 0) {
      throw new Error('Pelo menos um productId deve ser fornecido');
    }

    return this.inventoryService.getAvailability(finalUnitId, productIdsArray);
  }
}

