import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Simulacao extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'TemaEspecifico',
    required: true,
  })
  temaEspecificoId: string;

  @Prop({ type: [String], required: true })
  questionIds: string[];

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop({ type: Map, of: Number })
  questionTimes: Map<string, number>;

  @Prop({ type: Map, of: Boolean })
  questionDifficulties: Map<string, boolean>;

  @Prop({ type: Map, of: Boolean })
  questionResults: Map<string, boolean>;

  @Prop()
  correctAnswers: number;

  @Prop()
  totalAnswers: number;
}

export const SimulacaoSchema = SchemaFactory.createForClass(Simulacao);
