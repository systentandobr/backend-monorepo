import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type SolarProjectDocument = SolarProject & Document & {
  createdAt?: Date;
  updatedAt?: Date;
};

// Sub-schema para location
const LocationSchema = new MongooseSchema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
  },
  { _id: false },
);

// Sub-schema para project phase history
const ProjectPhaseHistorySchema = new MongooseSchema(
  {
    phase: {
      type: String,
      enum: ['planning', 'licensing', 'procurement', 'installation', 'operation'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    notes: { type: String },
  },
  { _id: false },
);

@Schema({
  timestamps: true,
  collection: 'solar_projects',
})
export class SolarProject {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Number, default: 0 })
  totalCapacityKW: number;

  @Prop({ type: Number, default: 0 })
  terrainArea: number; // m²

  @Prop({ type: Date })
  installationDate?: Date;

  @Prop({
    type: String,
    enum: ['planning', 'licensing', 'procurement', 'installation', 'operation'],
    default: 'planning',
  })
  projectPhase: string;

  @Prop({ type: [ProjectPhaseHistorySchema], default: [] })
  projectPhases: Array<{
    phase: string;
    startDate: Date;
    endDate?: Date;
    status: string;
    notes?: string;
  }>;

  @Prop({ type: Number, default: 0 })
  totalInvestment: number;

  @Prop({ type: Number, default: 0 })
  currentCostPerKWH: number;

  @Prop({ type: Number, default: 0 })
  utilityCostPerKWH: number; // Custo da concessionária

  @Prop({ type: LocationSchema, required: true })
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const SolarProjectSchema = SchemaFactory.createForClass(SolarProject);

// Índices para performance
SolarProjectSchema.index({ unitId: 1 }, { unique: true });
SolarProjectSchema.index({ projectPhase: 1 });
SolarProjectSchema.index({ 'location.state': 1 });
SolarProjectSchema.index({ 'location.city': 1 });
