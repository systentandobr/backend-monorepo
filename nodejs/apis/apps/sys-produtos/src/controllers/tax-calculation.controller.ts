import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TaxCalculationService } from '../services/tax-calculation.service';
import { TaxInformationDto } from '../dto/create-produto.dto';

export class CalculateTaxDto {
  taxInformation: TaxInformationDto;
  price: number;
  estado: string;
}

@ApiTags('tax-calculation')
@ApiBearerAuth()
@Controller('tax-calculation')
export class TaxCalculationController {
  constructor(private readonly taxCalculationService: TaxCalculationService) {}

  @UseGuards(JwtAuthGuard)
  @Post('calculate')
  @ApiOperation({ summary: 'Calcular impostos para um produto' })
  @ApiResponse({ status: 200, description: 'Impostos calculados com sucesso' })
  calculate(@Body() dto: CalculateTaxDto) {
    const taxInformation = dto.taxInformation as any;
    const totalTaxes = this.taxCalculationService.calculateTotalTaxes(
      taxInformation,
      dto.price,
      dto.estado,
    );
    const icms = this.taxCalculationService.calculateICMS(
      taxInformation,
      dto.price,
      dto.estado,
    );
    const icmsSt = this.taxCalculationService.calculateICMSST(
      taxInformation,
      dto.price,
      dto.estado,
    );

    return {
      totalTaxes,
      icms,
      icmsSt,
      isExempt: this.taxCalculationService.isExempt(taxInformation),
      hasSubstitutionTax:
        this.taxCalculationService.hasSubstitutionTax(taxInformation),
    };
  }
}
