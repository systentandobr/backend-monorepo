import { Injectable, NotFoundException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { OrderFiltersDto, OrderResponseDto, OrderStatsDto } from './dto/order-response.dto';
import { NotificationsService } from '../../../../notifications/src/notifications.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createOrderDto: CreateOrderDto, unitId: string): Promise<OrderResponseDto> {
    // Gerar número do pedido único
    const orderNumber = await this.generateOrderNumber(unitId);

    const order = new this.orderModel({
      ...createOrderDto,
      unitId,
      orderNumber,
      orderDate: new Date(),
    });

    const saved = await order.save();
    const responseDto = this.toResponseDto(saved);
    
    // Enviar notificação sobre novo pedido
    this.notificationsService.notifyNewOrder({
      id: responseDto.id,
      orderNumber: responseDto.orderNumber,
      customerName: responseDto.customerName,
      total: responseDto.total,
      unitId: responseDto.unitId,
    }).catch(err => {
      this.logger.error(`Erro ao enviar notificação de novo pedido: ${err.message}`);
    });
    
    return responseDto;
  }

  async findAll(filters: OrderFiltersDto, unitId: string): Promise<{
    data: OrderResponseDto[];
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
        { orderNumber: { $regex: filters.search, $options: 'i' } },
        { customerName: { $regex: filters.search, $options: 'i' } },
        { customerEmail: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.orderModel
        .find(query)
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(query).exec(),
    ]);

    return {
      data: data.map(o => this.toResponseDto(o)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, unitId: string): Promise<OrderResponseDto> {
    const order = await this.orderModel.findOne({ _id: id, unitId }).exec();
    
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return this.toResponseDto(order);
  }

  async updateStatus(id: string, updateDto: UpdateOrderStatusDto, unitId: string): Promise<OrderResponseDto> {
    const updateData: any = {
      status: updateDto.status,
      updatedAt: new Date(),
    };

    // Atualizar datas específicas baseado no status
    if (updateDto.status === 'enviado' && !updateData.shippedAt) {
      updateData.shippedAt = new Date();
    }
    if (updateDto.status === 'entregue' && !updateData.deliveredAt) {
      updateData.deliveredAt = new Date();
    }
    if (updateDto.status === 'cancelado' && !updateData.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    if (updateDto.trackingNumber) {
      updateData.trackingNumber = updateDto.trackingNumber;
    }

    const order = await this.orderModel.findOneAndUpdate(
      { _id: id, unitId },
      updateData,
      { new: true },
    ).exec();

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return this.toResponseDto(order);
  }

  async remove(id: string, unitId: string): Promise<void> {
    const result = await this.orderModel.deleteOne({ _id: id, unitId }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException('Pedido não encontrado');
    }
  }

  async getStats(unitId: string): Promise<OrderStatsDto> {
    const orders = await this.orderModel.find({ unitId }).exec();
    
    const total = orders.length;
    const processing = orders.filter(o => o.status === 'processando').length;
    const shipped = orders.filter(o => o.status === 'enviado').length;
    const delivered = orders.filter(o => o.status === 'entregue').length;
    const cancelled = orders.filter(o => o.status === 'cancelado').length;
    
    const totalRevenue = orders
      .filter(o => o.status !== 'cancelado')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      total,
      processing,
      shipped,
      delivered,
      cancelled,
      totalRevenue,
    };
  }

  private async generateOrderNumber(unitId: string): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const unitPrefix = unitId.slice(-4).toUpperCase();
    
    // Contar pedidos do dia
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const count = await this.orderModel.countDocuments({
      unitId,
      orderDate: { $gte: startOfDay, $lte: endOfDay },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `#PED-${unitPrefix}-${dateStr}-${sequence}`;
  }

  private toResponseDto(order: OrderDocument): OrderResponseDto {
    return {
      id: order._id.toString(),
      unitId: order.unitId,
      orderNumber: order.orderNumber,
      customerId: order.customerId.toString(),
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      items: order.items,
      total: order.total,
      status: order.status,
      orderDate: order.orderDate,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      trackingNumber: order.trackingNumber,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt || new Date(),
      updatedAt: order.updatedAt || new Date(),
    };
  }
}

