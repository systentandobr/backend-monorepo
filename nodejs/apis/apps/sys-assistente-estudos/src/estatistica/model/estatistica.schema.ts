import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Question } from '../../question/model/question.schema';

@Schema()
export class Estatistica extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Simulacao',
    required: true,
  })
  simulacaoId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Concurso',
    required: true,
  })
  concursoId: string;

  @Prop()
  simulacaoName: string;

  @Prop({ type: Question })
  question: Question;

  @Prop()
  dateTime: number;
}

export const EstatisticaSchema = SchemaFactory.createForClass(Estatistica);
