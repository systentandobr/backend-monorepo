import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Question extends Document {
  @Prop({ required: true })
  questionText: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ required: false })
  correctAnswerChecked: boolean;

  @Prop({ required: true })
  correctAnswer: string;

  @Prop({ required: false })
  attempt: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Simulacao',
    required: true,
  })
  simulacaoId: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
