import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BioimpedanceController } from './bioimpedance.controller';
import { BioimpedanceService } from './bioimpedance.service';
import {
  BioimpedanceMeasurement,
  BioimpedanceMeasurementSchema,
} from './schemas/bioimpedance-measurement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BioimpedanceMeasurement.name, schema: BioimpedanceMeasurementSchema },
    ]),
  ],
  controllers: [BioimpedanceController],
  providers: [BioimpedanceService],
  exports: [BioimpedanceService],
})
export class BioimpedanceModule {}
