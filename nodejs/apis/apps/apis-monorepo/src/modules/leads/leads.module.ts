import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { Lead, LeadSchema } from './schemas/lead.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/leads'),
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}

