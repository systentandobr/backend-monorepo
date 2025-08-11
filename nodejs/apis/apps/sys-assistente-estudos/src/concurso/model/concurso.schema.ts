import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TemaEspecifico } from '../temaespecifico/model/temaEspecifico.schema';

@Schema()
export class Concurso extends Document {
  @Prop({ searchIndex: true })
  id: string;

  @Prop({ required: true })
  descricao: string;

  @Prop({ required: true })
  dataProva: Date;

  @Prop({ required: true })
  local: string;

  @Prop()
  informacoesOrientacao: string;
}

export const ConcursoSchema = SchemaFactory.createForClass(Concurso);
