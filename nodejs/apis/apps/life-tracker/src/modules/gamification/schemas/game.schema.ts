import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameDocument = Game & Document;

@Schema({ timestamps: true })
export class Game {
  @Prop({ type: Object, required: true })
  board: {
    rows: number;
    cols: number;
    milestones: {
      tile: number;
      label: string;
    }[];
  };

  @Prop({ type: [Object], required: true })
  scoring_rules: {
    action: string;
    points: number;
    desc: string;
  }[];

  @Prop({ required: true, default: 100 })
  weekly_goal_points: number;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const GameSchema = SchemaFactory.createForClass(Game);
