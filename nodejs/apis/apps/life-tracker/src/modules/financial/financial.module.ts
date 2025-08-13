import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';
import { Portfolio, PortfolioSchema } from './schemas/portfolio.schema';
import { Asset, AssetSchema } from './schemas/asset.schema';
import { FinancialGoal, FinancialGoalSchema } from './schemas/financial-goal.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: Asset.name, schema: AssetSchema },
      { name: FinancialGoal.name, schema: FinancialGoalSchema },
    ]),
  ],
  controllers: [FinancialController],
  providers: [FinancialService],
  exports: [FinancialService],
})
export class FinancialModule {} 