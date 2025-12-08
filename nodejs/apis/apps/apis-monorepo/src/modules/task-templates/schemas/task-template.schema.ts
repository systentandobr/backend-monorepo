import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type TaskTemplateDocument = TaskTemplate & Document & {
    createdAt?: Date;
    updatedAt?: Date;
};

const TaskStepSchema = new MongooseSchema({
    order: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    required: { type: Boolean, default: true },
}, { _id: false });

const ResourceSchema = new MongooseSchema({
    type: { type: String, enum: ['video', 'pdf', 'link'], required: true },
    url: { type: String, required: true },
    title: { type: String, required: true },
}, { _id: false });

@Schema({
    timestamps: true,
    collection: 'task_templates',
})
export class TaskTemplate {
    _id?: Types.ObjectId;
    id?: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({
        required: true,
        enum: ['automation', 'whatsapp', 'social-media', 'training', 'onboarding', 'other'],
    })
    category: 'automation' | 'whatsapp' | 'social-media' | 'training' | 'onboarding' | 'other';

    @Prop({
        required: true,
        enum: ['single', 'multi-step', 'form', 'video'],
    })
    type: 'single' | 'multi-step' | 'form' | 'video';

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
        type: 'video' | 'pdf' | 'link';
        url: string;
        title: string;
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
