import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PRODUCT_COLLECTION, Product } from '../schemas/product.schema';
import { ReplenishPlanResponseDto, ReplenishSuggestionDto } from '../dto/replenish-plan.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(PRODUCT_COLLECTION) private readonly productModel: Model<Product>,
  ) {}

  /**
   * Gera um plano de reposição baseado no estoque atual da unidade
   * 
   * Regras de negócio:
   * - below_safety: Estoque abaixo do estoque mínimo (assumindo 10% do estoque médio ou mínimo de 5 unidades)
   * - stockout_risk: Estoque muito baixo (menor que 3 unidades ou menos de 5% do estoque médio)
   * - projected_demand: Estoque adequado mas com demanda projetada (para produtos com alta rotatividade)
   */
  async generateReplenishPlan(unitId: string): Promise<ReplenishPlanResponseDto> {
    if (!unitId) {
      throw new Error('unitId é obrigatório');
    }

    // Buscar todos os produtos ativos com variantes
    const products = await this.productModel
      .find({ active: true })
      .lean()
      .exec();

    const suggestions: ReplenishSuggestionDto[] = [];

    for (const product of products) {
      if (!product.variants || product.variants.length === 0) {
        continue;
      }

      for (const variant of product.variants) {
        if (!variant.active) {
          continue;
        }

        // Obter estoque da unidade
        // stockByUnit pode ser um Map ou um objeto simples (quando vem do MongoDB)
        let unitStock = { quantity: 0, reserved: 0 };
        
        if (variant.stockByUnit) {
          if (variant.stockByUnit instanceof Map) {
            unitStock = variant.stockByUnit.get(unitId) || { quantity: 0, reserved: 0 };
          } else {
            // Quando vem do MongoDB, é um objeto simples
            const stockByUnitObj = variant.stockByUnit as any;
            unitStock = stockByUnitObj[unitId] || { quantity: 0, reserved: 0 };
          }
        }
        
        const availableStock = (unitStock.quantity || 0) - (unitStock.reserved || 0);

        // Calcular estoque mínimo sugerido
        // Estoque mínimo: 5 unidades ou 10% do estoque atual (o que for maior)
        // Mas se o estoque atual for muito baixo, usar um mínimo fixo de 10 unidades
        const baseSafetyStock = Math.max(10, Math.ceil(availableStock * 0.1));
        const safetyStock = availableStock > 0 ? Math.max(5, baseSafetyStock) : 10;
        const criticalStock = 3; // Estoque crítico
        const reorderPoint = Math.max(safetyStock * 2, 20); // Ponto de reposição (mínimo 20 unidades)

        let reason: 'below_safety' | 'projected_demand' | 'stockout_risk' | null = null;
        let suggestedQty = 0;

        // Verificar risco de falta (estoque muito baixo ou zerado)
        if (availableStock <= criticalStock) {
          reason = 'stockout_risk';
          suggestedQty = Math.max(reorderPoint - availableStock, 10); // Mínimo 10 unidades
        }
        // Verificar estoque abaixo do mínimo
        else if (availableStock < safetyStock) {
          reason = 'below_safety';
          suggestedQty = Math.max(reorderPoint - availableStock, 5); // Mínimo 5 unidades
        }
        // Verificar demanda projetada (para produtos com estoque entre mínimo e ponto de reposição)
        else if (availableStock < reorderPoint && availableStock >= safetyStock) {
          reason = 'projected_demand';
          suggestedQty = Math.max(Math.ceil((reorderPoint - availableStock) * 0.5), 3); // Mínimo 3 unidades
        }

        // Adicionar sugestão se houver motivo
        if (reason && suggestedQty > 0) {
          suggestions.push({
            productId: product._id.toString(),
            sku: variant.sku,
            suggestedQty,
            reason,
          });
        }
      }
    }

    return {
      unitId,
      suggestions,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Obtém a disponibilidade de estoque para produtos específicos
   */
  async getAvailability(
    unitId: string,
    productIds: string[],
  ): Promise<
    Array<{
      productId: string;
      onHand: number;
      reserved: number;
      incomingConfirmed: number;
      virtualAvailable: number;
      safetyStock?: number;
    }>
  > {
    if (!unitId) {
      throw new Error('unitId é obrigatório');
    }

    const products = await this.productModel
      .find({
        _id: { $in: productIds },
        active: true,
      })
      .lean()
      .exec();

    const availability = [];

    for (const product of products) {
      if (!product.variants || product.variants.length === 0) {
        continue;
      }

      // Somar estoque de todas as variantes ativas
      let totalOnHand = 0;
      let totalReserved = 0;

      for (const variant of product.variants) {
        if (!variant.active) {
          continue;
        }

        // Obter estoque da unidade
        let unitStock = { quantity: 0, reserved: 0 };
        
        if (variant.stockByUnit) {
          if (variant.stockByUnit instanceof Map) {
            unitStock = variant.stockByUnit.get(unitId) || { quantity: 0, reserved: 0 };
          } else {
            // Quando vem do MongoDB, é um objeto simples
            const stockByUnitObj = variant.stockByUnit as any;
            unitStock = stockByUnitObj[unitId] || { quantity: 0, reserved: 0 };
          }
        }
        
        totalOnHand += unitStock.quantity || 0;
        totalReserved += unitStock.reserved || 0;
      }

      const safetyStock = Math.max(5, Math.ceil(totalOnHand * 0.1));
      const virtualAvailable = totalOnHand - totalReserved;

      availability.push({
        productId: product._id.toString(),
        onHand: totalOnHand,
        reserved: totalReserved,
        incomingConfirmed: 0, // TODO: Implementar rastreamento de pedidos em trânsito
        virtualAvailable,
        safetyStock,
      });
    }

    return availability;
  }
}

