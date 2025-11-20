import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({
  timestamps: true,
  collection: 'orders',
})
export class Order {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ required: true })
  orderNumber: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Customer' })
  customerId: string;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerEmail: string;

  @Prop()
  customerPhone?: string;

  @Prop({
    type: [{
      productId: { type: String, required: true },
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      total: { type: Number, required: true },
    }],
    default: [],
  })
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;

  @Prop({ required: true, type: Number, default: 0 })
  total: number;

  @Prop({
    type: String,
    enum: ['processando', 'enviado', 'entregue', 'cancelado'],
    default: 'processando',
  })
  status: 'processando' | 'enviado' | 'entregue' | 'cancelado';

  @Prop({ type: Date, default: Date.now })
  orderDate: Date;

  @Prop({ type: Date })
  shippedAt?: Date;

  @Prop({ type: Date })
  deliveredAt?: Date;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop()
  trackingNumber?: string;

  @Prop({ type: Object })
  shippingAddress?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Índices para performance
OrderSchema.index({ unitId: 1, orderDate: -1 });
OrderSchema.index({ unitId: 1, status: 1 });
OrderSchema.index({ unitId: 1, customerId: 1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });

