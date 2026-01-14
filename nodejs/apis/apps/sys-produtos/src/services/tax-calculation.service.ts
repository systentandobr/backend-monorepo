import { Injectable } from '@nestjs/common';
import { TaxInformation } from '../schemas/product.schema';

export interface TributoStrategy {
  calculateTributo(
    taxInformation: TaxInformation,
    price: number,
    estado: string,
  ): number;
}

@Injectable()
export class TributacaoICMS implements TributoStrategy {
  calculateTributo(
    taxInformation: TaxInformation,
    price: number,
    estado: string,
  ): number {
    if (!taxInformation || taxInformation.exempt) {
      return 0;
    }

    const icmsInfo = taxInformation.icmsByState[estado];
    if (!icmsInfo) {
      return 0;
    }

    // Cálculo do ICMS: preço * alíquota
    const icms = (price * icmsInfo.taxRate) / 100;
    return icms;
  }
}

@Injectable()
export class TributacaoICMSCSt implements TributoStrategy {
  calculateTributo(
    taxInformation: TaxInformation,
    price: number,
    estado: string,
  ): number {
    if (!taxInformation || !taxInformation.icmsSt) {
      return 0;
    }

    const { baseCalculation, taxRate, mva } = taxInformation.icmsSt;

    // Cálculo do ICMS-ST:
    // 1. Base de cálculo com MVA: baseCalculation * (1 + MVA/100)
    // 2. ICMS-ST = (base com MVA * alíquota ICMS-ST) - ICMS já pago
    const baseComMva = baseCalculation * (1 + mva / 100);
    const icmsSt = (baseComMva * taxRate) / 100;

    // Subtrair o ICMS já pago (se houver)
    const icmsInfo = taxInformation.icmsByState[estado];
    const icmsPago = icmsInfo ? (price * icmsInfo.taxRate) / 100 : 0;

    return Math.max(0, icmsSt - icmsPago);
  }
}

@Injectable()
export class TaxCalculationService {
  constructor(
    private readonly tributacaoICMS: TributacaoICMS,
    private readonly tributacaoICMSCSt: TributacaoICMSCSt,
  ) {}

  /**
   * Calcula o valor total de impostos para um produto
   * @param taxInformation Informações fiscais do produto
   * @param price Preço do produto
   * @param estado Estado de destino para cálculo
   * @returns Valor total de impostos
   */
  calculateTotalTaxes(
    taxInformation: TaxInformation | undefined,
    price: number,
    estado: string,
  ): number {
    if (!taxInformation) {
      return 0;
    }

    if (taxInformation.exempt) {
      return 0;
    }

    let totalTaxes = 0;

    // Calcular ICMS
    const icms = this.tributacaoICMS.calculateTributo(
      taxInformation,
      price,
      estado,
    );
    totalTaxes += icms;

    // Calcular ICMS-ST se aplicável
    if (taxInformation.icmsSt) {
      const icmsSt = this.tributacaoICMSCSt.calculateTributo(
        taxInformation,
        price,
        estado,
      );
      totalTaxes += icmsSt;
    }

    return totalTaxes;
  }

  /**
   * Calcula apenas o ICMS
   */
  calculateICMS(
    taxInformation: TaxInformation | undefined,
    price: number,
    estado: string,
  ): number {
    if (!taxInformation) {
      return 0;
    }
    return this.tributacaoICMS.calculateTributo(taxInformation, price, estado);
  }

  /**
   * Calcula apenas o ICMS-ST
   */
  calculateICMSST(
    taxInformation: TaxInformation | undefined,
    price: number,
    estado: string,
  ): number {
    if (!taxInformation) {
      return 0;
    }
    return this.tributacaoICMSCSt.calculateTributo(
      taxInformation,
      price,
      estado,
    );
  }

  /**
   * Verifica se o produto está isento de impostos
   */
  isExempt(taxInformation: TaxInformation | undefined): boolean {
    return taxInformation?.exempt ?? false;
  }

  /**
   * Verifica se o produto tem substituição tributária
   */
  hasSubstitutionTax(taxInformation: TaxInformation | undefined): boolean {
    return !!taxInformation?.icmsSt;
  }
}
