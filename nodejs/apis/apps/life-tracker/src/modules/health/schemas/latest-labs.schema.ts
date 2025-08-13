import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LatestLabsDocument = LatestLabs & Document;

@Schema({ timestamps: true })
export class LatestLabs {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  creatinina_mg_dl: number;

  @Prop({ required: true })
  ureia_mg_dl: number;

  @Prop({ required: true })
  egfr_ml_min_1_73: number;

  @Prop({ required: true })
  fosforo_mg_dl: number;

  @Prop({ required: true })
  calcio_total_mg_dl: number;

  @Prop({ required: true })
  calcio_ionico_mmol_l: number;

  @Prop({ required: true })
  sodio_mmol_l: number;

  @Prop({ required: true })
  potassio_mmol_l: number;

  @Prop({ required: true })
  hba1c_percent: number;

  @Prop({ required: true })
  glicose_mg_dl: number;

  @Prop({ required: true })
  hb_g_dl: number;

  @Prop({ required: true })
  ferritina_ng_ml: number;

  @Prop({ required: true })
  vitamina_d_25oh_ng_ml: number;

  @Prop({ required: true })
  pth_pg_ml: number;

  @Prop({ required: true })
  sangue_oculto_fezes: string;

  @Prop({ required: true })
  exam_date: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  updatedAt: string;
}

export const LatestLabsSchema = SchemaFactory.createForClass(LatestLabs); 