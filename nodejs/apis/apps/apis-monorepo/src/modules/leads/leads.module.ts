import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { Lead, LeadSchema } from './schemas/lead.schema';
import { NotificationsModule } from '../../../../notifications/src/notifications.module';

import { LeadsPublicController } from './leads.public.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [LeadsController, LeadsPublicController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule { }

