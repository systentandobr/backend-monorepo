import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SolarService } from './solar.service';
import { SolarController } from './solar.controller';
import { SolarProject, SolarProjectSchema } from './schemas/solar-project.schema';
import { SolarProduction, SolarProductionSchema } from './schemas/solar-production.schema';
import { DistributionContract, DistributionContractSchema } from './schemas/solar-distribution.schema';
import { SolarEquipment, SolarEquipmentSchema } from './schemas/solar-equipment.schema';
import { Franchise, FranchiseSchema } from '../franchises/schemas/franchise.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SolarProject.name, schema: SolarProjectSchema },
      { name: SolarProduction.name, schema: SolarProductionSchema },
      { name: DistributionContract.name, schema: DistributionContractSchema },
      { name: SolarEquipment.name, schema: SolarEquipmentSchema },
      { name: Franchise.name, schema: FranchiseSchema },
    ]),
  ],
  controllers: [SolarController],
  providers: [SolarService],
  exports: [SolarService],
})
export class SolarModule {}
