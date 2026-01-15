import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SolarProject,
  SolarProjectDocument,
} from './schemas/solar-project.schema';
import {
  SolarProduction,
  SolarProductionDocument,
} from './schemas/solar-production.schema';
import {
  DistributionContract,
  DistributionContractDocument,
} from './schemas/solar-distribution.schema';
import {
  SolarEquipment,
  SolarEquipmentDocument,
} from './schemas/solar-equipment.schema';
import { CreateSolarProjectDto } from './dto/create-solar-project.dto';
import { UpdateSolarProjectDto } from './dto/update-solar-project.dto';
import { SolarProjectResponseDto } from './dto/solar-project-response.dto';
import { CreateProductionDto } from './dto/create-production.dto';
import { CreateDistributionContractDto } from './dto/create-distribution-contract.dto';
import { UpdateProjectPhaseDto } from './dto/update-project-phase.dto';
import { Franchise, FranchiseDocument } from '../franchises/schemas/franchise.schema';

@Injectable()
export class SolarService {
  private readonly logger = new Logger(SolarService.name);

  // Tarifas da concessionária por estado (R$/KWH) - valores aproximados 2024
  private readonly UTILITY_RATES: Record<string, number> = {
    CE: 0.65, // Ceará
    SP: 0.70,
    RJ: 0.75,
    MG: 0.68,
    RS: 0.72,
    PR: 0.69,
    SC: 0.71,
    BA: 0.66,
    GO: 0.67,
    PE: 0.64,
  };

  constructor(
    @InjectModel(SolarProject.name)
    private solarProjectModel: Model<SolarProjectDocument>,
    @InjectModel(SolarProduction.name)
    private solarProductionModel: Model<SolarProductionDocument>,
    @InjectModel(DistributionContract.name)
    private distributionContractModel: Model<DistributionContractDocument>,
    @InjectModel(SolarEquipment.name)
    private solarEquipmentModel: Model<SolarEquipmentDocument>,
    @InjectModel(Franchise.name)
    private franchiseModel: Model<FranchiseDocument>,
  ) {}

  /**
   * Valida se a franquia tem segmento solar_plant
   */
  private async validateSolarSegment(unitId: string): Promise<void> {
    const franchise = await this.franchiseModel.findOne({ unitId });
    if (!franchise) {
      throw new NotFoundException(`Franquia com unitId ${unitId} não encontrada`);
    }
    if (!franchise.marketSegments?.includes('solar_plant')) {
      throw new NotFoundException(
        `Franquia ${unitId} não possui segmento solar_plant`,
      );
    }
  }

  /**
   * Converte documento para DTO de resposta
   */
  private toProjectResponseDto(
    doc: SolarProjectDocument,
  ): SolarProjectResponseDto {
    return {
      id: doc._id.toString(),
      unitId: doc.unitId,
      name: doc.name,
      totalCapacityKW: doc.totalCapacityKW,
      terrainArea: doc.terrainArea,
      installationDate: doc.installationDate,
      projectPhase: doc.projectPhase,
      projectPhases: doc.projectPhases.map((p) => ({
        phase: p.phase,
        startDate: p.startDate,
        endDate: p.endDate,
        status: p.status,
        notes: p.notes,
      })),
      totalInvestment: doc.totalInvestment,
      currentCostPerKWH: doc.currentCostPerKWH,
      utilityCostPerKWH: doc.utilityCostPerKWH,
      location: doc.location,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Busca informações do projeto
   */
  async getProject(unitId: string): Promise<SolarProjectResponseDto> {
    await this.validateSolarSegment(unitId);

    const project = await this.solarProjectModel.findOne({ unitId });
    if (!project) {
      throw new NotFoundException(
        `Projeto solar para unitId ${unitId} não encontrado`,
      );
    }

    return this.toProjectResponseDto(project);
  }

  /**
   * Cria novo projeto
   */
  async createProject(
    unitId: string,
    createDto: CreateSolarProjectDto,
  ): Promise<SolarProjectResponseDto> {
    await this.validateSolarSegment(unitId);

    const existing = await this.solarProjectModel.findOne({ unitId });
    if (existing) {
      throw new NotFoundException(
        `Projeto solar para unitId ${unitId} já existe`,
      );
    }

    const project = new this.solarProjectModel({
      ...createDto,
      unitId,
    });

    // Inicializar fase de planejamento se não especificada
    if (!project.projectPhases || project.projectPhases.length === 0) {
      project.projectPhases = [
        {
          phase: project.projectPhase || 'planning',
          startDate: new Date(),
          status: 'in_progress',
        },
      ];
    }

    const saved = await project.save();

    // Criar registro de equipamentos inicial
    await this.solarEquipmentModel.create({
      unitId,
      totalPanels: 0,
      activePanels: 0,
      panelsStatus: 'operational',
      invertersStatus: 'operational',
      monitoringStatus: 'operational',
    });

    return this.toProjectResponseDto(saved);
  }

  /**
   * Atualiza projeto
   */
  async updateProject(
    unitId: string,
    updateDto: UpdateSolarProjectDto,
  ): Promise<SolarProjectResponseDto> {
    await this.validateSolarSegment(unitId);

    const project = await this.solarProjectModel.findOne({ unitId });
    if (!project) {
      throw new NotFoundException(
        `Projeto solar para unitId ${unitId} não encontrado`,
      );
    }

    Object.assign(project, updateDto);
    const saved = await project.save();

    return this.toProjectResponseDto(saved);
  }

  /**
   * Deleta projeto solar e dados relacionados
   */
  async deleteProject(unitId: string): Promise<void> {
    await this.validateSolarSegment(unitId);

    const project = await this.solarProjectModel.findOne({ unitId });
    if (!project) {
      throw new NotFoundException(
        `Projeto solar para unitId ${unitId} não encontrado`,
      );
    }

    // Deletar projeto e dados relacionados
    await Promise.all([
      this.solarProjectModel.deleteOne({ unitId }),
      this.solarProductionModel.deleteMany({ unitId }),
      this.distributionContractModel.deleteMany({ unitId }),
      this.solarEquipmentModel.deleteOne({ unitId }),
    ]);
  }

  /**
   * Atualiza fase do projeto
   */
  async updateProjectPhase(
    unitId: string,
    updateDto: UpdateProjectPhaseDto,
  ): Promise<SolarProjectResponseDto> {
    await this.validateSolarSegment(unitId);

    const project = await this.solarProjectModel.findOne({ unitId });
    if (!project) {
      throw new NotFoundException(
        `Projeto solar para unitId ${unitId} não encontrado`,
      );
    }

    // Finalizar fase atual se estiver em progresso
    const currentPhaseIndex = project.projectPhases.findIndex(
      (p) => p.phase === project.projectPhase && p.status === 'in_progress',
    );
    if (currentPhaseIndex >= 0) {
      project.projectPhases[currentPhaseIndex].status = 'completed';
      project.projectPhases[currentPhaseIndex].endDate = new Date();
    }

    // Adicionar nova fase ou atualizar existente
    const existingPhaseIndex = project.projectPhases.findIndex(
      (p) => p.phase === updateDto.projectPhase,
    );

    if (existingPhaseIndex >= 0) {
      project.projectPhases[existingPhaseIndex].status = 'in_progress';
      if (updateDto.notes) {
        project.projectPhases[existingPhaseIndex].notes = updateDto.notes;
      }
    } else {
      project.projectPhases.push({
        phase: updateDto.projectPhase,
        startDate: new Date(),
        status: 'in_progress',
        notes: updateDto.notes,
      });
    }

    project.projectPhase = updateDto.projectPhase;
    const saved = await project.save();

    return this.toProjectResponseDto(saved);
  }

  /**
   * Busca dados de produção
   */
  async getProductionData(
    unitId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]> {
    await this.validateSolarSegment(unitId);

    const query: any = { unitId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }

    const productions = await this.solarProductionModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(1000)
      .exec();

    return productions.map((p) => ({
      id: p._id.toString(),
      timestamp: p.timestamp,
      productionKW: p.productionKW,
      productionKWH: p.productionKWH,
      efficiency: p.efficiency,
      weatherConditions: p.weatherConditions,
    }));
  }

  /**
   * Registra nova produção
   */
  async recordProduction(
    unitId: string,
    createDto: CreateProductionDto,
  ): Promise<any> {
    await this.validateSolarSegment(unitId);

    const production = new this.solarProductionModel({
      ...createDto,
      unitId,
      timestamp: createDto.timestamp ? new Date(createDto.timestamp) : new Date(),
    });

    const saved = await production.save();
    return {
      id: saved._id.toString(),
      timestamp: saved.timestamp,
      productionKW: saved.productionKW,
      productionKWH: saved.productionKWH,
      efficiency: saved.efficiency,
      weatherConditions: saved.weatherConditions,
    };
  }

  /**
   * Busca métricas consolidadas
   */
  async getProductionMetrics(unitId: string): Promise<any> {
    await this.validateSolarSegment(unitId);

    const [project, equipment, today, thisMonth, thisYear, contracts] =
      await Promise.all([
        this.solarProjectModel.findOne({ unitId }),
        this.solarEquipmentModel.findOne({ unitId }),
        this.getDailyProduction(unitId),
        this.getMonthlyProduction(unitId),
        this.getYearlyProduction(unitId),
        this.distributionContractModel.find({
          unitId,
          status: 'active',
        }),
      ]);

    if (!project) {
      throw new NotFoundException(
        `Projeto solar para unitId ${unitId} não encontrado`,
      );
    }

    const totalCapacityKW = project.totalCapacityKW || 0;
    const currentProductionKW = today.currentProductionKW || 0;
    const dailyProductionKWH = today.dailyProductionKWH || 0;
    const monthlyProductionKWH = thisMonth.monthlyProductionKWH || 0;
    const yearlyProductionKWH = thisYear.yearlyProductionKWH || 0;

    const efficiencyPercentage =
      totalCapacityKW > 0 && currentProductionKW > 0
        ? (currentProductionKW / totalCapacityKW) * 100
        : 0;

    const distributionToAssociations = contracts.reduce(
      (sum, c) => sum + c.monthlyKWH,
      0,
    );

    const costPerKWH = project.currentCostPerKWH || 0;
    const utilityCostPerKWH =
      project.utilityCostPerKWH ||
      this.UTILITY_RATES[project.location.state] ||
      this.UTILITY_RATES.CE;

    const savingsVsUtility =
      (utilityCostPerKWH - costPerKWH) * monthlyProductionKWH;

    const roiPercentage = this.calculateROI(
      project.totalInvestment,
      savingsVsUtility,
      distributionToAssociations * costPerKWH,
    );

    return {
      totalCapacityKW,
      currentProductionKW,
      dailyProductionKWH,
      monthlyProductionKWH,
      yearlyProductionKWH,
      efficiencyPercentage: Math.min(100, Math.max(0, efficiencyPercentage)),
      activePanels: equipment?.activePanels || 0,
      totalPanels: equipment?.totalPanels || 0,
      distributionToAssociations,
      costPerKWH,
      savingsVsUtility,
      roiPercentage,
      projectPhase: project.projectPhase,
      projectPhases: project.projectPhases,
      equipmentStatus: {
        panels: equipment?.panelsStatus || 'operational',
        inverters: equipment?.invertersStatus || 'operational',
        monitoring: equipment?.monitoringStatus || 'operational',
      },
      supplierCount: 0, // TODO: buscar de fornecedores
      terrainArea: project.terrainArea,
      installationDate: project.installationDate,
    };
  }

  /**
   * Busca produção diária
   */
  private async getDailyProduction(unitId: string): Promise<{
    currentProductionKW: number;
    dailyProductionKWH: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const productions = await this.solarProductionModel
      .find({
        unitId,
        timestamp: { $gte: today, $lt: tomorrow },
      })
      .sort({ timestamp: -1 })
      .limit(1)
      .exec();

    const dailyProductions = await this.solarProductionModel
      .aggregate([
        {
          $match: {
            unitId,
            timestamp: { $gte: today, $lt: tomorrow },
          },
        },
        {
          $group: {
            _id: null,
            totalKWH: { $sum: '$productionKWH' },
          },
        },
      ])
      .exec();

    return {
      currentProductionKW: productions[0]?.productionKW || 0,
      dailyProductionKWH: dailyProductions[0]?.totalKWH || 0,
    };
  }

  /**
   * Busca produção mensal
   */
  private async getMonthlyProduction(unitId: string): Promise<{
    monthlyProductionKWH: number;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await this.solarProductionModel
      .aggregate([
        {
          $match: {
            unitId,
            timestamp: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalKWH: { $sum: '$productionKWH' },
          },
        },
      ])
      .exec();

    return {
      monthlyProductionKWH: result[0]?.totalKWH || 0,
    };
  }

  /**
   * Busca produção anual
   */
  private async getYearlyProduction(unitId: string): Promise<{
    yearlyProductionKWH: number;
  }> {
    const startOfYear = new Date();
    startOfYear.setMonth(0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    const result = await this.solarProductionModel
      .aggregate([
        {
          $match: {
            unitId,
            timestamp: { $gte: startOfYear },
          },
        },
        {
          $group: {
            _id: null,
            totalKWH: { $sum: '$productionKWH' },
          },
        },
      ])
      .exec();

    return {
      yearlyProductionKWH: result[0]?.totalKWH || 0,
    };
  }

  /**
   * Calcula ROI
   */
  private calculateROI(
    totalInvestment: number,
    monthlySavings: number,
    monthlyRevenue: number = 0,
  ): number {
    if (totalInvestment <= 0) return 0;
    const monthlyReturn = monthlySavings + monthlyRevenue;
    const yearlyReturn = monthlyReturn * 12;
    return (yearlyReturn / totalInvestment) * 100;
  }

  /**
   * Busca métricas de BI
   */
  async getBIMetrics(
    unitId: string,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month',
  ): Promise<any> {
    await this.validateSolarSegment(unitId);

    const project = await this.solarProjectModel.findOne({ unitId });
    if (!project) {
      throw new NotFoundException(
        `Projeto solar para unitId ${unitId} não encontrado`,
      );
    }

    const metrics = await this.getProductionMetrics(unitId);
    const contracts = await this.distributionContractModel.find({
      unitId,
      status: 'active',
    });

    const startDate = this.getPeriodStartDate(period);
    const productionData = await this.getProductionData(unitId, startDate);

    const averageDailyProduction =
      productionData.length > 0
        ? productionData.reduce((sum, p) => sum + p.productionKWH, 0) /
          productionData.length
        : 0;

    const averageMonthlyProduction = metrics.monthlyProductionKWH;
    const averageEfficiency =
      productionData.length > 0
        ? productionData.reduce((sum, p) => sum + p.efficiency, 0) /
          productionData.length
        : 0;

    const totalDistributedKWH = contracts.reduce(
      (sum, c) => sum + c.monthlyKWH,
      0,
    );
    const distributionRevenue = contracts.reduce(
      (sum, c) => sum + c.monthlyKWH * c.pricePerKWH,
      0,
    );

    const utilityCostPerKWH =
      project.utilityCostPerKWH ||
      this.UTILITY_RATES[project.location.state] ||
      this.UTILITY_RATES.CE;
    const solarCostPerKWH = project.currentCostPerKWH || 0;
    const monthlySavings =
      (utilityCostPerKWH - solarCostPerKWH) * averageMonthlyProduction;
    const yearlySavings = monthlySavings * 12;
    const savingsPercentage =
      utilityCostPerKWH > 0
        ? ((utilityCostPerKWH - solarCostPerKWH) / utilityCostPerKWH) * 100
        : 0;

    const paybackPeriodMonths =
      monthlySavings + distributionRevenue > 0
        ? project.totalInvestment /
          (monthlySavings + distributionRevenue)
        : Infinity;

    return {
      roiPercentage: metrics.roiPercentage,
      paybackPeriodMonths,
      totalInvestment: project.totalInvestment,
      totalRevenue: distributionRevenue * 12,
      totalSavings: yearlySavings,
      costPerKWH: solarCostPerKWH,
      utilityCostPerKWH,
      savingsPercentage,
      averageDailyProduction,
      averageMonthlyProduction,
      productionTrend: this.calculateProductionTrend(productionData),
      averageEfficiency,
      efficiencyTrend: this.calculateEfficiencyTrend(productionData),
      totalDistributedKWH,
      distributionRevenue,
      activeContracts: contracts.length,
      projectedMonthlySavings: monthlySavings,
      projectedYearlySavings: yearlySavings,
      projectedROI: metrics.roiPercentage,
      utilityComparison: {
        utilityCostPerKWH,
        solarCostPerKWH,
        monthlySavings,
        yearlySavings,
        savingsPercentage,
      },
    };
  }

  /**
   * Calcula tendência de produção
   */
  private calculateProductionTrend(productionData: any[]): string {
    if (productionData.length < 2) return 'stable';

    const firstHalf = productionData.slice(0, Math.floor(productionData.length / 2));
    const secondHalf = productionData.slice(Math.floor(productionData.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, p) => sum + p.productionKWH, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, p) => sum + p.productionKWH, 0) / secondHalf.length;

    if (secondAvg > firstAvg * 1.05) return 'increasing';
    if (secondAvg < firstAvg * 0.95) return 'decreasing';
    return 'stable';
  }

  /**
   * Calcula tendência de eficiência
   */
  private calculateEfficiencyTrend(productionData: any[]): string {
    if (productionData.length < 2) return 'stable';

    const firstHalf = productionData.slice(0, Math.floor(productionData.length / 2));
    const secondHalf = productionData.slice(Math.floor(productionData.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, p) => sum + p.efficiency, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, p) => sum + p.efficiency, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 2) return 'improving';
    if (secondAvg < firstAvg - 2) return 'declining';
    return 'stable';
  }

  /**
   * Obtém data de início do período
   */
  private getPeriodStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return weekAgo;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return monthAgo;
      case 'quarter':
        const quarterAgo = new Date(now);
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        return quarterAgo;
      case 'year':
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return yearAgo;
      default:
        return new Date(0);
    }
  }

  /**
   * Busca contratos de distribuição
   */
  async getDistributionContracts(unitId: string): Promise<any[]> {
    await this.validateSolarSegment(unitId);

    const contracts = await this.distributionContractModel
      .find({ unitId })
      .sort({ contractStartDate: -1 })
      .exec();

    return contracts.map((c) => ({
      id: c._id.toString(),
      associationName: c.associationName,
      associationId: c.associationId,
      contractStartDate: c.contractStartDate,
      contractEndDate: c.contractEndDate,
      monthlyKWH: c.monthlyKWH,
      pricePerKWH: c.pricePerKWH,
      status: c.status,
    }));
  }

  /**
   * Cria contrato de distribuição
   */
  async createDistributionContract(
    unitId: string,
    createDto: CreateDistributionContractDto,
  ): Promise<any> {
    await this.validateSolarSegment(unitId);

    const contract = new this.distributionContractModel({
      ...createDto,
      unitId,
      contractStartDate: new Date(createDto.contractStartDate),
      contractEndDate: createDto.contractEndDate
        ? new Date(createDto.contractEndDate)
        : undefined,
      status: createDto.status || 'pending',
    });

    const saved = await contract.save();
    return {
      id: saved._id.toString(),
      associationName: saved.associationName,
      associationId: saved.associationId,
      contractStartDate: saved.contractStartDate,
      contractEndDate: saved.contractEndDate,
      monthlyKWH: saved.monthlyKWH,
      pricePerKWH: saved.pricePerKWH,
      status: saved.status,
    };
  }

  /**
   * Busca comparação com concessionária
   */
  async getUtilityComparison(
    unitId: string,
    state: string = 'CE',
  ): Promise<any> {
    await this.validateSolarSegment(unitId);

    const project = await this.solarProjectModel.findOne({ unitId });
    if (!project) {
      throw new NotFoundException(
        `Projeto solar para unitId ${unitId} não encontrado`,
      );
    }

    const metrics = await this.getProductionMetrics(unitId);
    const utilityCostPerKWH =
      this.UTILITY_RATES[state] || this.UTILITY_RATES.CE;
    const solarCostPerKWH = metrics.costPerKWH || 0;
    const monthlyKWH = metrics.monthlyProductionKWH || 0;

    const monthlySavings = (utilityCostPerKWH - solarCostPerKWH) * monthlyKWH;
    const yearlySavings = monthlySavings * 12;
    const savingsPercentage =
      utilityCostPerKWH > 0
        ? ((utilityCostPerKWH - solarCostPerKWH) / utilityCostPerKWH) * 100
        : 0;

    return {
      utilityCostPerKWH,
      solarCostPerKWH,
      monthlySavings,
      yearlySavings,
      savingsPercentage,
      state,
    };
  }
}
