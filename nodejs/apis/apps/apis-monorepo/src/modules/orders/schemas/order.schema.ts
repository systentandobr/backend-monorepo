import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type OrderDocument = Order & Document & {
  createdAt?: Date;
  updatedAt?: Date;
};

// Sub-schema para OrderItem
const OrderItemSchema = new MongooseSchema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
}, { _id: false });

// Sub-schema para ShippingAddress
const ShippingAddressSchema = new MongooseSchema({
  street: { type: String, required: true },
  number: { type: String, required: true },
  complement: { type: String },
  neighborhood: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
}, { _id: false });

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

  @Prop({ type: [OrderItemSchema], default: [] })
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

  @Prop({ type: ShippingAddressSchema })
  shippingAddress?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };

  @Prop()
  referralCode?: string; // Código de indicação usado no checkout

  @Prop({ type: Types.ObjectId, ref: 'Referral', required: false })
  referralId?: Types.ObjectId; // Referência à indicação quando completada

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Índices para performance
OrderSchema.index({ unitId: 1, orderDate: -1 });
OrderSchema.index({ unitId: 1, status: 1 });
OrderSchema.index({ unitId: 1, customerId: 1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ referralCode: 1 });
OrderSchema.index({ referralId: 1 });

