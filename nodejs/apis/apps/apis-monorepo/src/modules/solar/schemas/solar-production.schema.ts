import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type SolarProductionDocument = SolarProduction & Document & {
  createdAt?: Date;
  updatedAt?: Date;
};

// Sub-schema para weather conditions
const WeatherConditionsSchema = new MongooseSchema(
  {
    temperature: { type: Number },
    irradiance: { type: Number },
    cloudCover: { type: Number },
  },
  { _id: false },
);

@Schema({
  timestamps: true,
  collection: 'solar_production',
})
export class SolarProduction {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ type: Date, required: true, index: true })
  timestamp: Date;

  @Prop({ type: Number, required: true })
  productionKW: number;

  @Prop({ type: Number, required: true })
  productionKWH: number;

  @Prop({ type: Number, required: true })
  efficiency: number; // porcentagem

  @Prop({ type: WeatherConditionsSchema })
  weatherConditions?: {
    temperature: number;
    irradiance: number;
    cloudCover?: number;
  };
}

export const SolarProductionSchema = SchemaFactory.createForClass(SolarProduction);

// Índices compostos para performance em queries por período
SolarProductionSchema.index({ unitId: 1, timestamp: -1 });
SolarProductionSchema.index({ timestamp: -1 }); // Para queries globais
