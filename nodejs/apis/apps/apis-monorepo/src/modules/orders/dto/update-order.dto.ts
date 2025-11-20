import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsOptional, IsEnum, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum(['processando', 'enviado', 'entregue', 'cancelado'])
  status: 'processando' | 'enviado' | 'entregue' | 'cancelado';

  @IsOptional()
  @IsString()
  trackingNumber?: string;
}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}

