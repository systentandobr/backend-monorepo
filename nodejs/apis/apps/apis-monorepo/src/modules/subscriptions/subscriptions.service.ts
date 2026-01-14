import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SubscriptionPlan,
  SubscriptionPlanDocument,
} from './schemas/subscription-plan.schema';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SubscriptionPlanResponseDto } from './dto/subscription-plan-response.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectModel(SubscriptionPlan.name)
    private subscriptionPlanModel: Model<SubscriptionPlanDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  // ========== SUBSCRIPTION PLANS ==========
  async createPlan(
    createPlanDto: CreateSubscriptionPlanDto,
    unitId: string,
  ): Promise<SubscriptionPlanResponseDto> {
    const plan = new this.subscriptionPlanModel({
      ...createPlanDto,
      unitId,
    });

    const saved = await plan.save();
    return this.toPlanResponseDto(saved);
  }

  async findAllPlans(unitId: string): Promise<SubscriptionPlanResponseDto[]> {
    const plans = await this.subscriptionPlanModel
      .find({ unitId })
      .sort({ createdAt: -1 })
      .exec();
    return plans.map((plan) => this.toPlanResponseDto(plan));
  }

  async findPlanById(
    id: string,
    unitId: string,
  ): Promise<SubscriptionPlanResponseDto> {
    const plan = await this.subscriptionPlanModel
      .findOne({ _id: id, unitId })
      .exec();
    if (!plan) {
      throw new NotFoundException(
        `Plano de assinatura com ID ${id} não encontrado`,
      );
    }
    return this.toPlanResponseDto(plan);
  }

  async updatePlan(
    id: string,
    updatePlanDto: UpdateSubscriptionPlanDto,
    unitId: string,
  ): Promise<SubscriptionPlanResponseDto> {
    const plan = await this.subscriptionPlanModel
      .findOneAndUpdate(
        { _id: id, unitId },
        { $set: updatePlanDto },
        { new: true },
      )
      .exec();

    if (!plan) {
      throw new NotFoundException(
        `Plano de assinatura com ID ${id} não encontrado`,
      );
    }

    return this.toPlanResponseDto(plan);
  }

  async removePlan(id: string, unitId: string): Promise<void> {
    const result = await this.subscriptionPlanModel
      .deleteOne({ _id: id, unitId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `Plano de assinatura com ID ${id} não encontrado`,
      );
    }
  }

  // ========== PAYMENTS ==========
  async createPayment(
    createPaymentDto: CreatePaymentDto,
    unitId: string,
  ): Promise<PaymentResponseDto> {
    const payment = new this.paymentModel({
      ...createPaymentDto,
      unitId,
      dueDate: new Date(createPaymentDto.dueDate),
      status: 'pending',
    });

    const saved = await payment.save();
    return this.toPaymentResponseDto(saved);
  }

  async findAllPayments(
    filters: { studentId?: string; status?: string },
    unitId: string,
  ): Promise<{
    data: PaymentResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query: any = { unitId };

    if (filters.studentId) {
      query.studentId = filters.studentId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const [data, total] = await Promise.all([
      this.paymentModel.find(query).sort({ dueDate: -1 }).exec(),
      this.paymentModel.countDocuments(query).exec(),
    ]);

    return {
      data: data.map((item) => this.toPaymentResponseDto(item)),
      total,
      page: 1,
      limit: 50,
    };
  }

  async findPaymentById(
    id: string,
    unitId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentModel.findOne({ _id: id, unitId }).exec();
    if (!payment) {
      throw new NotFoundException(`Pagamento com ID ${id} não encontrado`);
    }
    return this.toPaymentResponseDto(payment);
  }

  async markPaymentAsPaid(
    id: string,
    paidDate: string,
    paymentMethod: string,
    unitId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentModel.findOne({ _id: id, unitId }).exec();
    if (!payment) {
      throw new NotFoundException(`Pagamento com ID ${id} não encontrado`);
    }

    payment.paidDate = new Date(paidDate);
    payment.status = 'paid';
    payment.paymentMethod = paymentMethod as any;

    const saved = await payment.save();
    return this.toPaymentResponseDto(saved);
  }

  private toPlanResponseDto(
    plan: SubscriptionPlanDocument,
  ): SubscriptionPlanResponseDto {
    return {
      id: plan._id.toString(),
      unitId: plan.unitId,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      duration: plan.duration,
      features: plan.features,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  private toPaymentResponseDto(payment: PaymentDocument): PaymentResponseDto {
    return {
      id: payment._id.toString(),
      unitId: payment.unitId,
      studentId: payment.studentId.toString(),
      subscriptionPlanId: payment.subscriptionPlanId.toString(),
      amount: payment.amount,
      dueDate: payment.dueDate,
      paidDate: payment.paidDate,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
