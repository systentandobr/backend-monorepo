import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type TrainingDocument = Training & Document & {
    createdAt?: Date;
    updatedAt?: Date;
};

const ResourceSchema = new MongooseSchema({
    type: { type: String, required: true },
    url: { type: String, required: true },
    title: { type: String, required: true },
}, { _id: false });

@Schema({
    timestamps: true,
    collection: 'trainings',
})
export class Training {
    _id?: Types.ObjectId;
    id?: string;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({
        required: true,
        enum: ['onboarding', 'marketing', 'sales', 'operations', 'other'],
    })
    category: 'onboarding' | 'marketing' | 'sales' | 'operations' | 'other';

    @Prop({
        required: true,
        enum: ['video', 'pdf', 'article', 'interactive'],
    })
    type: 'video' | 'pdf' | 'article' | 'interactive';

    @Prop()
    videoUrl?: string;

    @Prop()
    thumbnailUrl?: string;

    @Prop()
    duration?: number; // minutes

    @Prop({ type: [ResourceSchema], default: [] })
    resources: {
        type: string;
        url: string;
        title: string;
    }[];

    @Prop({ default: true })
    isGlobal: boolean;

    @Prop({ type: Types.ObjectId, ref: 'Franchise' })
    franchiseId?: string;

    @Prop({ default: 0 })
    order: number;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: string;

    @Prop({ default: 0 })
    viewCount: number;

    @Prop({ type: Object })
    metadata?: Record<string, any>;
}

export const TrainingSchema = SchemaFactory.createForClass(Training);

TrainingSchema.index({ category: 1 });
TrainingSchema.index({ isGlobal: 1 });
TrainingSchema.index({ franchiseId: 1 });
