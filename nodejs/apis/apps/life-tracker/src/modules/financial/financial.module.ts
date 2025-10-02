import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';
import { Portfolio, PortfolioSchema } from './schemas/portfolio.schema';
import { Asset, AssetSchema } from './schemas/asset.schema';
import { FinancialGoal, FinancialGoalSchema } from './schemas/financial-goal.schema';
import { JwtValidatorService } from '../../services/jwt-validator.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    MongooseModule.forFeature([
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: Asset.name, schema: AssetSchema },
      { name: FinancialGoal.name, schema: FinancialGoalSchema },
    ]),
  ],
  controllers: [FinancialController],
  providers: [FinancialService, JwtValidatorService],
  exports: [FinancialService],
})
export class FinancialModule {} 