import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductivityController } from './productivity.controller';
import { ProductivityService } from './productivity.service';
import { ProductivityGoal, ProductivityGoalSchema } from './schemas/productivity-goal.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductivityGoal.name, schema: ProductivityGoalSchema },
    ]),
  ],
  controllers: [ProductivityController],
  providers: [ProductivityService],
  exports: [ProductivityService],
})
export class ProductivityModule {} 