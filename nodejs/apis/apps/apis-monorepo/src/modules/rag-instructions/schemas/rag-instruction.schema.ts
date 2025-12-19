import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RagInstructionDocument = RagInstruction & Document & {
  createdAt?: Date;
  updatedAt?: Date;
};

@Schema({
  timestamps: true,
  collection: 'rag_instructions',
})
export class RagInstruction {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ type: [String], required: true, default: [] })
  instructions: string[];

  @Prop({ type: String, enum: ['text', 'url', 'pdf'], default: 'text' })
  sourceType: 'text' | 'url' | 'pdf';

  @Prop({ type: String })
  sourceUrl?: string;

  @Prop({ type: String })
  sourceFileName?: string;

  @Prop({ type: String })
  sourceFileId?: string;

  @Prop({ type: String })
  rawContent?: string;

  @Prop({ type: Object, default: {} })
  context?: {
    products?: any[];
    campaigns?: any[];
    customers?: any[];
    trainings?: any[];
    [key: string]: any;
  };

  @Prop({ type: Object, default: {} })
  metadata?: {
    version?: string;
    author?: string;
    description?: string;
    tags?: string[];
    processedAt?: Date;
    processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
    processingError?: string;
    indexedInRAG?: boolean;
    ragIndexedAt?: Date;
    [key: string]: any;
  };

  @Prop({ type: Boolean, default: true, index: true })
  active: boolean;

  @Prop({ type: Date })
  lastUsedAt?: Date;
}

export const RagInstructionSchema = SchemaFactory.createForClass(RagInstruction);

// Índices para performance
RagInstructionSchema.index({ unitId: 1, active: 1 });
RagInstructionSchema.index({ unitId: 1, updatedAt: -1 });
