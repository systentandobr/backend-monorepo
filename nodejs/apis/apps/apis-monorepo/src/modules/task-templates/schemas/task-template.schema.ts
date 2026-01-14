import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type TaskTemplateDocument = TaskTemplate &
  Document & {
    createdAt?: Date;
    updatedAt?: Date;
  };

const TaskStepSchema = new MongooseSchema(
  {
    order: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    required: { type: Boolean, default: true },
  },
  { _id: false },
);

const ResourceSchema = new MongooseSchema(
  {
    type: {
      type: String,
      enum: ['video', 'pdf', 'link', 'template', 'document'],
      required: true,
    },
    url: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
  },
  { _id: false },
);

const ValidationSchema = new MongooseSchema(
  {
    type: {
      type: String,
      enum: ['link', 'upload', 'text', 'none'],
      default: 'none',
    },
    required: { type: Boolean, default: false },
    instructions: { type: String },
    acceptedFormats: { type: [String], default: [] },
  },
  { _id: false },
);

@Schema({
  timestamps: true,
  collection: 'task_templates',
})
export class TaskTemplate {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true })
  name: string; // Equivalent to 'title' in frontend mock

  @Prop({ required: true })
  description: string;

  @Prop({
    required: true,
    enum: [
      'setup',
      'automation',
      'whatsapp',
      'social_media',
      'marketing',
      'sales',
      'training',
      'onboarding',
      'other',
    ],
  })
  category: string;

  @Prop({
    required: true,
    default: 'single',
  })
  type: string;

  @Prop({
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  })
  difficulty: string;

  @Prop({ default: 0 })
  points: number;

  @Prop({ default: [] })
  dependencies: string[]; // List of Task IDs (strings)

  @Prop()
  instructions: string;

  @Prop()
  icon: string; // Icon name

  @Prop()
  color: string; // CSS color string

  @Prop({ type: ValidationSchema, default: {} })
  validation: {
    type: 'link' | 'upload' | 'text' | 'none';
    required: boolean;
    instructions: string;
    acceptedFormats?: string[];
  };

  @Prop({ type: [TaskStepSchema], default: [] })
  steps: {
    order: number;
    title: string;
    description: string;
    required: boolean;
  }[];

  @Prop({ type: Object })
  formTemplate?: Record<string, any>;

  @Prop()
  videoUrl?: string;

  @Prop({ type: [ResourceSchema], default: [] })
  resources: {
    type: string;
    url: string;
    title: string;
    description?: string;
  }[];

  @Prop({ required: true, default: 0 })
  estimatedTime: number; // minutes

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: string;
}

export const TaskTemplateSchema = SchemaFactory.createForClass(TaskTemplate);

TaskTemplateSchema.index({ category: 1 });
TaskTemplateSchema.index({ isDefault: 1 });
TaskTemplateSchema.index({ order: 1 });
