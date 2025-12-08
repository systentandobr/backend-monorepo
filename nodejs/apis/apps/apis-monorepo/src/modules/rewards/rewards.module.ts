import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { Reward, RewardSchema } from './schemas/reward.schema';
import { ReferralsModule } from '../referrals/referrals.module';
import { ReferralCampaignsModule } from '../referral-campaigns/referral-campaigns.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reward.name, schema: RewardSchema }]),
    forwardRef(() => ReferralsModule),
    forwardRef(() => ReferralCampaignsModule),
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
