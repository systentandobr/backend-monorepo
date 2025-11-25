import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Franchise, FranchiseDocument } from './schemas/franchise.schema';
import { CreateFranchiseDto } from './dto/create-franchise.dto';
import { UpdateFranchiseDto } from './dto/update-franchise.dto';
import { FranchiseFiltersDto, FranchiseResponseDto, FranchiseMetricsDto, RegionalTrendDto } from './dto/franchise-response.dto';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';

@Injectable()
export class FranchisesService {
  private readonly logger = new Logger(FranchisesService.name);

  constructor(
    @InjectModel(Franchise.name) private franchiseModel: Model<FranchiseDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async create(createFranchiseDto: CreateFranchiseDto): Promise<FranchiseResponseDto> {
    // Verificar se unitId já existe
    const existing = await this.franchiseModel.findOne({
      unitId: createFranchiseDto.unitId,
    });

    if (existing) {
      throw new ConflictException('Franquia com este unitId já existe');
    }

    const franchise = new this.franchiseModel(createFranchiseDto);
    const saved = await franchise.save();
    return this.toResponseDto(saved);
  }

  async findAll(filters: FranchiseFiltersDto, userUnitId?: string, isAdmin: boolean = false): Promise<{
    data: FranchiseResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query: any = {};

    // Se não for admin, filtrar apenas pela própria franquia
    if (!isAdmin && userUnitId) {
      query.unitId = userUnitId;
    }

    // Aplicar filtros
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.state && filters.state.length > 0) {
      query['location.state'] = { $in: filters.state };
    }

    if (filters.city && filters.city.length > 0) {
      query['location.city'] = { $in: filters.city };
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { unitId: { $regex: filters.search, $options: 'i' } },
        { ownerName: { $regex: filters.search, $options: 'i' } },
        { ownerEmail: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.franchiseModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.franchiseModel.countDocuments(query).exec(),
    ]);

    // Buscar métricas para cada franquia
    const franchisesWithMetrics = await Promise.all(
      data.map(async (franchise) => {
        const metrics = await this.getFranchiseMetrics(franchise.unitId);
        return { ...this.toResponseDto(franchise), metrics };
      })
    );

    return {
      data: franchisesWithMetrics,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, userUnitId?: string, isAdmin: boolean = false): Promise<FranchiseResponseDto> {
    const query: any = { _id: id };
    
    // Se não for admin, garantir que só vê a própria franquia
    if (!isAdmin && userUnitId) {
      query.unitId = userUnitId;
    }

    const franchise = await this.franchiseModel.findOne(query).exec();
    
    if (!franchise) {
      throw new NotFoundException('Franquia não encontrada');
    }

    const metrics = await this.getFranchiseMetrics(franchise.unitId);
    return { ...this.toResponseDto(franchise), metrics };
  }

  async findByUnitId(unitId: string): Promise<FranchiseResponseDto | null> {
    const franchise = await this.franchiseModel.findOne({ unitId }).exec();
    if (!franchise) return null;
    
    const metrics = await this.getFranchiseMetrics(unitId);
    return { ...this.toResponseDto(franchise), metrics };
  }

  async update(id: string, updateFranchiseDto: UpdateFranchiseDto, userUnitId?: string, isAdmin: boolean = false): Promise<FranchiseResponseDto> {
    const query: any = { _id: id };
    
    if (!isAdmin && userUnitId) {
      query.unitId = userUnitId;
    }

    const franchise = await this.franchiseModel.findOneAndUpdate(
      query,
      { ...updateFranchiseDto, updatedAt: new Date() },
      { new: true },
    ).exec();

    if (!franchise) {
      throw new NotFoundException('Franquia não encontrada');
    }

    const metrics = await this.getFranchiseMetrics(franchise.unitId);
    return { ...this.toResponseDto(franchise), metrics };
  }

  async remove(id: string, userUnitId?: string, isAdmin: boolean = false): Promise<void> {
    const query: any = { _id: id };
    
    if (!isAdmin && userUnitId) {
      query.unitId = userUnitId;
    }

    const result = await this.franchiseModel.deleteOne(query).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException('Franquia não encontrada');
    }
  }

  async getFranchiseMetrics(unitId: string): Promise<FranchiseMetricsDto> {
    try {
      // Buscar métricas diretamente dos modelos para evitar dependência circular
      const [orders, customers] = await Promise.all([
        this.orderModel.find({ unitId }).exec(),
        this.customerModel.find({ unitId, isActive: true }).exec(),
      ]);

      // Calcular métricas agregadas
      const totalOrders = orders.length;
      const totalSales = orders
        .filter(o => o.status !== 'cancelado')
        .reduce((sum, o) => sum + o.total, 0);
      const totalLeads = 0; // TODO: Integrar com módulo de leads
      const customerCount = customers.length;
      const conversionRate = totalLeads > 0 ? (totalOrders / totalLeads) * 100 : 0;
      const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Calcular métricas do último mês
      const now = new Date();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      
      const lastMonthOrdersArray = orders.filter(o => 
        o.orderDate >= lastMonthStart && o.orderDate <= lastMonthEnd
      );
      const lastMonthOrders = lastMonthOrdersArray.length;
      const lastMonthSales = lastMonthOrdersArray
        .filter(o => o.status !== 'cancelado')
        .reduce((sum, o) => sum + o.total, 0);
      const lastMonthLeads = Math.floor(totalLeads * 0.1); // TODO: Buscar do módulo de leads
      
      // Calcular crescimento (comparar último mês com mês anterior)
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59);
      
      const previousMonthOrders = orders.filter(o => 
        o.orderDate >= previousMonthStart && o.orderDate <= previousMonthEnd
      );
      const previousMonthSales = previousMonthOrders
        .filter(o => o.status !== 'cancelado')
        .reduce((sum, o) => sum + o.total, 0);
      
      const growthRate = previousMonthSales > 0 
        ? ((lastMonthSales - previousMonthSales) / previousMonthSales) * 100 
        : 0;

      return {
        totalOrders,
        totalSales,
        totalLeads,
        conversionRate,
        averageTicket,
        customerCount,
        growthRate,
        lastMonthSales,
        lastMonthOrders,
        lastMonthLeads,
      };
    } catch (error) {
      this.logger.error(`Erro ao calcular métricas para unitId ${unitId}:`, error);
      // Retornar métricas zeradas em caso de erro
      return {
        totalOrders: 0,
        totalSales: 0,
        totalLeads: 0,
        conversionRate: 0,
        averageTicket: 0,
        customerCount: 0,
        growthRate: 0,
        lastMonthSales: 0,
        lastMonthOrders: 0,
        lastMonthLeads: 0,
      };
    }
  }

  async getRegionalTrends(): Promise<RegionalTrendDto[]> {
    const franchises = await this.franchiseModel.find({ status: 'active' }).exec();
    
    // Agrupar por estado
    const stateMap = new Map<string, {
      franchises: FranchiseDocument[];
      region: string;
    }>();

    franchises.forEach(franchise => {
      const state = franchise.location.state;
      if (!stateMap.has(state)) {
        stateMap.set(state, {
          franchises: [],
          region: 'Nordeste', // TODO: Mapear região baseado no estado
        });
      }
      stateMap.get(state)!.franchises.push(franchise);
    });

    // Calcular tendências por estado
    const trends: RegionalTrendDto[] = [];

    for (const [state, data] of stateMap.entries()) {
      const franchisesInState = data.franchises;
      const franchisesCount = franchisesInState.length;

      // Calcular métricas agregadas do estado
      let totalSales = 0;
      let totalOrders = 0;
      let totalLeads = 0;
      let totalCustomers = 0;

      for (const franchise of franchisesInState) {
        const metrics = await this.getFranchiseMetrics(franchise.unitId);
        totalSales += metrics.totalSales;
        totalOrders += metrics.totalOrders;
        totalLeads += metrics.totalLeads;
        totalCustomers += metrics.customerCount;
      }

      const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
      const conversionRate = totalLeads > 0 ? (totalOrders / totalLeads) * 100 : 0;

      // Calcular crescimento (simplificado - em produção usar dados históricos)
      const growthRate = Math.random() * 30 - 10; // Mock entre -10% e +20%
      const trend: 'up' | 'down' | 'stable' = growthRate > 5 ? 'up' : growthRate < -5 ? 'down' : 'stable';

      trends.push({
        region: data.region,
        state,
        franchisesCount,
        totalSales,
        growthRate: Number(growthRate.toFixed(1)),
        averageTicket: Number(averageTicket.toFixed(2)),
        leadsCount: totalLeads,
        conversionRate: Number(conversionRate.toFixed(1)),
        trend,
      });
    }

    return trends.sort((a, b) => b.totalSales - a.totalSales);
  }

  private toResponseDto(franchise: FranchiseDocument): FranchiseResponseDto {
    return {
      id: franchise._id.toString(),
      unitId: franchise.unitId,
      name: franchise.name,
      owner: {
        id: franchise.ownerId.toString(),
        name: franchise.ownerName,
        email: franchise.ownerEmail,
        phone: franchise.ownerPhone,
      },
      location: franchise.location,
      status: franchise.status,
      type: franchise.type,
      territory: franchise.territory,
      createdAt: franchise.createdAt || new Date(),
      updatedAt: franchise.updatedAt || new Date(),
    };
  }
}

