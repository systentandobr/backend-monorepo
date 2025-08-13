import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HealthPlan, HealthPlanSchema } from './schemas/health-plan.schema';
import { LatestLabs, LatestLabsSchema } from './schemas/latest-labs.schema';
import { DietParameters, DietParametersSchema } from './schemas/diet-parameters.schema';
import { Recipe, RecipeSchema } from './schemas/recipe.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HealthPlan.name, schema: HealthPlanSchema },
      { name: LatestLabs.name, schema: LatestLabsSchema },
      { name: DietParameters.name, schema: DietParametersSchema },
      { name: Recipe.name, schema: RecipeSchema },
    ]),
  ],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {} 