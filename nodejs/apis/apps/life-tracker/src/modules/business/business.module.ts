import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import {
  BusinessOpportunity,
  BusinessOpportunitySchema,
} from './schemas/business-opportunity.schema';
import {
  BusinessProject,
  BusinessProjectSchema,
} from './schemas/business-project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BusinessOpportunity.name, schema: BusinessOpportunitySchema },
      { name: BusinessProject.name, schema: BusinessProjectSchema },
    ]),
  ],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
