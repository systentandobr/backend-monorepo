import { Injectable, NotFoundException, ConflictException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerFiltersDto } from './dto/customer-filters.dto';
import { CustomerResponseDto, CustomerStatsDto } from './dto/customer-response.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, unitId: string): Promise<CustomerResponseDto> {
    // Verificar se já existe cliente com mesmo email na mesma unidade
    const existing = await this.customerModel.findOne({
      unitId,
      email: createCustomerDto.email,
    });

    if (existing) {
      throw new ConflictException('Cliente com este email já existe nesta unidade');
    }

    const customer = new this.customerModel({
      ...createCustomerDto,
      unitId,
      firstPurchaseAt: createCustomerDto.totalPurchases > 0 ? new Date() : undefined,
      lastPurchaseAt: createCustomerDto.totalPurchases > 0 ? new Date() : undefined,
    });

    const saved = await customer.save();
    const responseDto = this.toResponseDto(saved);
    
    // Enviar notificação sobre novo cliente
    this.notificationsService.notifyNewCustomer({
      id: responseDto.id,
      name: responseDto.name,
      email: responseDto.email,
      phone: responseDto.phone,
      unitId: responseDto.unitId,
    }).catch(err => {
      this.logger.error(`Erro ao enviar notificação de novo cliente: ${err.message}`);
    });
    
    return responseDto;
  }

  async findAll(filters: CustomerFiltersDto, unitId: string): Promise<{
    data: CustomerResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query: any = { unitId };

    // Aplicar filtros
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.customerModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.customerModel.countDocuments(query).exec(),
    ]);

    return {
      data: data.map(c => this.toResponseDto(c)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, unitId: string): Promise<CustomerResponseDto> {
    const customer = await this.customerModel.findOne({ _id: id, unitId }).exec();
    
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return this.toResponseDto(customer);
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, unitId: string): Promise<CustomerResponseDto> {
    const customer = await this.customerModel.findOneAndUpdate(
      { _id: id, unitId },
      { ...updateCustomerDto, updatedAt: new Date() },
      { new: true },
    ).exec();

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return this.toResponseDto(customer);
  }

  async remove(id: string, unitId: string): Promise<void> {
    const result = await this.customerModel.deleteOne({ _id: id, unitId }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException('Cliente não encontrado');
    }
  }

  async getStats(unitId: string): Promise<CustomerStatsDto> {
    const customers = await this.customerModel.find({ unitId, isActive: true }).exec();
    
    const total = customers.length;
    const active = customers.filter(c => c.status === 'ativo').length;
    const vip = customers.filter(c => c.status === 'vip').length;
    const newCustomers = customers.filter(c => c.status === 'novo').length;
    
    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const averageTicket = total > 0 ? totalSpent / total : 0;

    return {
      total,
      active,
      vip,
      new: newCustomers,
      averageTicket,
    };
  }

  private toResponseDto(customer: CustomerDocument): CustomerResponseDto {
    return {
      id: customer._id.toString(),
      unitId: customer.unitId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      totalPurchases: customer.totalPurchases,
      totalSpent: customer.totalSpent,
      status: customer.status,
      firstPurchaseAt: customer.firstPurchaseAt,
      lastPurchaseAt: customer.lastPurchaseAt,
      isActive: customer.isActive,
      createdAt: customer.createdAt || new Date(),
      updatedAt: customer.updatedAt || new Date(),
    };
  }
}

