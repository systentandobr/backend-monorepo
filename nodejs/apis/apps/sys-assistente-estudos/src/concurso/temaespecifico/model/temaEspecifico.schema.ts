import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class TemaEspecifico extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    searchIndex: true
  })
  id: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Concurso',
    required: true,
  })
  concursoId: string;

  @Prop({ required: true })
  descricao: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop()
  updatedAt: Date;

}

export const TemaEspecificoSchema = SchemaFactory.createForClass(TemaEspecifico);
