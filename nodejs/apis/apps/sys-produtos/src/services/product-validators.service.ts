import { Injectable } from '@nestjs/common';
import { Product, ProductVariant } from '../schemas/product.schema';

@Injectable()
export class ProductValidators {
  constructor(private product: Product) {}

  /**
   * Valida se o produto está completo e válido
   */
  validate(): boolean {
    // Validar nome
    if (
      !this.product.name ||
      this.product.name.length < 3 ||
      this.product.name.length > 100
    ) {
      return false;
    }

    // Validar que tem pelo menos uma variante
    if (!this.product.variants || this.product.variants.length === 0) {
      return false;
    }

    // Validar preço da primeira variante (ou todas)
    const hasValidPrice = this.product.variants.some(
      (v) => v.price > 0 || (v.costPrice !== undefined && v.costPrice > 0),
    );
    if (!hasValidPrice) {
      return false;
    }

    // Validar que tem pelo menos uma categoria
    if (!this.product.categories || this.product.categories.length === 0) {
      return false;
    }

    // Validar rating se existir
    if (
      this.product.rating !== undefined &&
      (this.product.rating < 0 || this.product.rating > 5)
    ) {
      return false;
    }

    // Validar NCM se existir (deve ter 8 dígitos)
    if (
      this.product.ncm &&
      !/^\d{8}$/.test(this.product.ncm.replace(/\./g, ''))
    ) {
      return false;
    }

    // Validar EAN13 se existir (deve ter 13 dígitos)
    if (this.product.ean13 && !/^\d{13}$/.test(this.product.ean13)) {
      return false;
    }

    return true;
  }

  /**
   * Verifica se o produto está disponível (ativo e com estoque)
   */
  isAvailable(unitId?: string): boolean {
    if (!this.product.active) {
      return false;
    }

    // Verificar se alguma variante tem estoque
    if (unitId) {
      return this.product.variants.some((v) => {
        const stock = v.stockByUnit.get(unitId);
        return stock && stock.quantity > 0;
      });
    }

    // Se não especificar unitId, verificar se tem alguma variante ativa
    return this.product.variants.some((v) => v.active);
  }

  /**
   * Calcula o preço final considerando desconto promocional
   */
  getFinalPrice(variantIndex: number = 0): number {
    const variant = this.product.variants[variantIndex];
    if (!variant) {
      return 0;
    }

    // Se tem preço promocional, usar ele
    if (
      variant.promotionalPrice !== undefined &&
      variant.promotionalPrice > 0
    ) {
      return variant.promotionalPrice;
    }

    return variant.price;
  }

  /**
   * Verifica se o produto tem desconto promocional
   */
  hasDiscount(variantIndex: number = 0): boolean {
    const variant = this.product.variants[variantIndex];
    if (!variant) {
      return false;
    }

    return (
      variant.promotionalPrice !== undefined &&
      variant.promotionalPrice > 0 &&
      variant.promotionalPrice < variant.price
    );
  }

  /**
   * Calcula o percentual de desconto
   */
  getDiscountPercentage(variantIndex: number = 0): number {
    const variant = this.product.variants[variantIndex];
    if (!variant || !this.hasDiscount(variantIndex)) {
      return 0;
    }

    const discount = variant.price - variant.promotionalPrice!;
    return (discount / variant.price) * 100;
  }

  /**
   * Atualiza o estoque de uma variante para uma unidade específica
   */
  updateStock(variantIndex: number, unitId: string, quantity: number): void {
    const variant = this.product.variants[variantIndex];
    if (!variant) {
      return;
    }

    const currentStock = variant.stockByUnit.get(unitId) || {
      quantity: 0,
      reserved: 0,
    };
    const newQuantity = Math.max(0, currentStock.quantity + quantity);

    variant.stockByUnit.set(unitId, {
      quantity: newQuantity,
      reserved: currentStock.reserved,
    });
  }

  /**
   * Reserva estoque de uma variante
   */
  reserveStock(
    variantIndex: number,
    unitId: string,
    quantity: number,
  ): boolean {
    const variant = this.product.variants[variantIndex];
    if (!variant) {
      return false;
    }

    const currentStock = variant.stockByUnit.get(unitId) || {
      quantity: 0,
      reserved: 0,
    };
    const available = currentStock.quantity - currentStock.reserved;

    if (available < quantity) {
      return false;
    }

    variant.stockByUnit.set(unitId, {
      quantity: currentStock.quantity,
      reserved: currentStock.reserved + quantity,
    });

    return true;
  }

  /**
   * Libera estoque reservado
   */
  releaseStock(variantIndex: number, unitId: string, quantity: number): void {
    const variant = this.product.variants[variantIndex];
    if (!variant) {
      return;
    }

    const currentStock = variant.stockByUnit.get(unitId) || {
      quantity: 0,
      reserved: 0,
    };
    const newReserved = Math.max(0, currentStock.reserved - quantity);

    variant.stockByUnit.set(unitId, {
      quantity: currentStock.quantity,
      reserved: newReserved,
    });
  }

  /**
   * Obtém o estoque disponível (quantity - reserved) de uma variante
   */
  getAvailableStock(variantIndex: number, unitId: string): number {
    const variant = this.product.variants[variantIndex];
    if (!variant) {
      return 0;
    }

    const stock = variant.stockByUnit.get(unitId);
    if (!stock) {
      return 0;
    }

    return Math.max(0, stock.quantity - stock.reserved);
  }

  /**
   * Adiciona uma nova variante ao produto
   */
  addVariant(variant: ProductVariant): void {
    if (!this.product.variants) {
      this.product.variants = [];
    }
    this.product.variants.push(variant);
  }

  /**
   * Busca uma variante por SKU
   */
  getVariantBySku(sku: string): ProductVariant | undefined {
    return this.product.variants?.find((v) => v.sku === sku);
  }

  /**
   * Valida informações fiscais básicas
   */
  validateTaxInformation(): boolean {
    if (!this.product.taxInformation) {
      return true; // Tax information é opcional
    }

    const taxInfo = this.product.taxInformation;

    // Validar que se tem ICMS-ST, deve ter base de cálculo e MVA
    if (taxInfo.icmsSt) {
      if (
        taxInfo.icmsSt.baseCalculation <= 0 ||
        taxInfo.icmsSt.taxRate < 0 ||
        taxInfo.icmsSt.mva < 0
      ) {
        return false;
      }
    }

    // Validar alíquotas de ICMS por estado (devem estar entre 0 e 100)
    for (const state in taxInfo.icmsByState) {
      const icmsInfo = taxInfo.icmsByState[state];
      if (icmsInfo.taxRate < 0 || icmsInfo.taxRate > 100) {
        return false;
      }
    }

    return true;
  }
}
