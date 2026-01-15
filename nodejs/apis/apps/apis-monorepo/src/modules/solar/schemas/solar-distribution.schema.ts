import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DistributionContractDocument = DistributionContract & Document & {
  createdAt?: Date;
  updatedAt?: Date;
};

@Schema({
  timestamps: true,
  collection: 'solar_distribution_contracts',
})
export class DistributionContract {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ required: true })
  associationName: string;

  @Prop({ type: String })
  associationId?: string;

  @Prop({ type: Date, required: true })
  contractStartDate: Date;

  @Prop({ type: Date })
  contractEndDate?: Date;

  @Prop({ type: Number, required: true })
  monthlyKWH: number;

  @Prop({ type: Number, required: true })
  pricePerKWH: number;

  @Prop({
    type: String,
    enum: ['active', 'pending', 'expired', 'cancelled'],
    default: 'pending',
    index: true,
  })
  status: string;
}

export const DistributionContractSchema = SchemaFactory.createForClass(DistributionContract);

// Índices para performance
DistributionContractSchema.index({ unitId: 1, status: 1 });
DistributionContractSchema.index({ status: 1 });
DistributionContractSchema.index({ contractStartDate: 1 });
DistributionContractSchema.index({ contractEndDate: 1 });
