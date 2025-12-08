import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferralCampaignsService } from './referral-campaigns.service';
import { ReferralCampaignsController } from './referral-campaigns.controller';
import {
  ReferralCampaign,
  ReferralCampaignSchema,
} from './schemas/referral-campaign.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReferralCampaign.name, schema: ReferralCampaignSchema },
    ]),
  ],
  controllers: [ReferralCampaignsController],
  providers: [ReferralCampaignsService],
  exports: [ReferralCampaignsService],
})
export class ReferralCampaignsModule {}
