import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferralsService } from './referrals.service';
import { ReferralsController } from './referrals.controller';
import { Referral, ReferralSchema } from './schemas/referral.schema';
import { ReferralCampaignsModule } from '../referral-campaigns/referral-campaigns.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Referral.name, schema: ReferralSchema }]),
    forwardRef(() => ReferralCampaignsModule),
  ],
  controllers: [ReferralsController],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {}
