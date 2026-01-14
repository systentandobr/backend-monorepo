import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UnitScope } from '../../decorators/unit-scope.decorator';
import {
  CurrentUser,
  CurrentUserShape,
} from '../../decorators/current-user.decorator';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UnitScope()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // ========== SUBSCRIPTION PLANS ==========
  @Post('plans')
  @HttpCode(HttpStatus.CREATED)
  createPlan(
    @Body() createPlanDto: CreateSubscriptionPlanDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.subscriptionsService.createPlan(createPlanDto, unitId);
  }

  @Get('plans')
  findAllPlans(@CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.subscriptionsService.findAllPlans(unitId);
  }

  @Get('plans/:id')
  findPlanById(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.subscriptionsService.findPlanById(id, unitId);
  }

  @Patch('plans/:id')
  updatePlan(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdateSubscriptionPlanDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.subscriptionsService.updatePlan(id, updatePlanDto, unitId);
  }

  @Delete('plans/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removePlan(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.subscriptionsService.removePlan(id, unitId);
  }

  // ========== PAYMENTS ==========
  @Post('payments')
  @HttpCode(HttpStatus.CREATED)
  createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.subscriptionsService.createPayment(createPaymentDto, unitId);
  }

  @Get('payments')
  findAllPayments(
    @CurrentUser() user: CurrentUserShape,
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.subscriptionsService.findAllPayments(
      { studentId, status },
      unitId,
    );
  }

  @Get('payments/:id')
  findPaymentById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.subscriptionsService.findPaymentById(id, unitId);
  }

  @Patch('payments/:id/mark-paid')
  markPaymentAsPaid(
    @Param('id') id: string,
    @Body('paidDate') paidDate: string,
    @Body('paymentMethod') paymentMethod: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.subscriptionsService.markPaymentAsPaid(
      id,
      paidDate,
      paymentMethod,
      unitId,
    );
  }
}
