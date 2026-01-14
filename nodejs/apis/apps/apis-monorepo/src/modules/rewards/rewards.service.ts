import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reward, RewardDocument } from './schemas/reward.schema';
import { ProcessRewardDto } from './dto/process-reward.dto';
import { RewardResponseDto } from './dto/reward-response.dto';
import { Types } from 'mongoose';
import { ReferralsService } from '../referrals/referrals.service';
import { ReferralCampaignsService } from '../referral-campaigns/referral-campaigns.service';

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);

  constructor(
    @InjectModel(Reward.name)
    private rewardModel: Model<RewardDocument>,
    @Inject(forwardRef(() => ReferralsService))
    private readonly referralsService: ReferralsService,
    @Inject(forwardRef(() => ReferralCampaignsService))
    private readonly campaignsService: ReferralCampaignsService,
  ) {}

  /**
   * Processa uma recompensa baseada em uma indicação completada
   */
  async processReward(
    processRewardDto: ProcessRewardDto,
  ): Promise<RewardResponseDto | null> {
    // Buscar indicação
    const referral = await this.referralsService.findOne(
      processRewardDto.referralId,
    );

    if (referral.status !== 'completed') {
      throw new BadRequestException(
        'Indicação deve estar completada para processar recompensa',
      );
    }

    // Buscar campanha
    const campaign = await this.campaignsService.findOne(referral.campaignId);

    // Processar recompensa do indicador
    if (
      referral.referrerReward &&
      referral.referrerReward.status === 'pending'
    ) {
      await this.createReward({
        referralId: referral.id,
        userId: referral.referrerId,
        campaignId: referral.campaignId,
        type: campaign.referrerReward.type as
          | 'cashback'
          | 'discount'
          | 'points'
          | 'physical',
        value: campaign.referrerReward.value,
        currency: campaign.referrerReward.currency,
        metadata: processRewardDto.metadata,
      });
    }

    // Processar recompensa do indicado (se houver)
    if (
      referral.refereeReward &&
      referral.refereeReward.status === 'pending' &&
      referral.refereeId &&
      campaign.refereeReward
    ) {
      await this.createReward({
        referralId: referral.id,
        userId: referral.refereeId,
        campaignId: referral.campaignId,
        type: campaign.refereeReward.type as
          | 'cashback'
          | 'discount'
          | 'points'
          | 'physical',
        value: campaign.refereeReward.value,
        currency: campaign.refereeReward.currency,
        metadata: processRewardDto.metadata,
      });
    }

    // Buscar recompensas criadas
    const rewards = await this.rewardModel
      .find({ referralId: new Types.ObjectId(processRewardDto.referralId) })
      .exec();

    return rewards.length > 0 ? this.toResponseDto(rewards[0]) : null;
  }

  /**
   * Cria uma recompensa
   */
  private async createReward(data: {
    referralId: string;
    userId: string;
    campaignId: string;
    type: 'cashback' | 'discount' | 'points' | 'physical';
    value: number;
    currency?: string;
    metadata?: Record<string, any>;
  }): Promise<RewardDocument> {
    const reward = new this.rewardModel({
      referralId: new Types.ObjectId(data.referralId),
      userId: new Types.ObjectId(data.userId),
      campaignId: new Types.ObjectId(data.campaignId),
      type: data.type,
      value: data.value,
      currency: data.currency,
      status: 'pending',
      processing: {
        scheduledAt: new Date(),
      },
      metadata: data.metadata,
    });

    return await reward.save();
  }

  async findAllByUser(
    userId: string,
    _franchiseId?: string,
  ): Promise<RewardResponseDto[]> {
    const query: any = { userId: new Types.ObjectId(userId) };

    // TODO: Filtrar por franchiseId através da campanha quando necessário

    const rewards = await this.rewardModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
    return rewards.map((r) => this.toResponseDto(r));
  }

  async findPending(_franchiseId?: string): Promise<RewardResponseDto[]> {
    const query: any = { status: 'pending' };

    // TODO: Filtrar por franchiseId através da campanha quando necessário

    const rewards = await this.rewardModel
      .find(query)
      .sort({ 'processing.scheduledAt': 1 })
      .exec();

    return rewards.map((r) => this.toResponseDto(r));
  }

  async findOne(id: string, userId?: string): Promise<RewardResponseDto> {
    const query: any = { _id: id };

    if (userId) {
      query.userId = new Types.ObjectId(userId);
    }

    const reward = await this.rewardModel.findOne(query).exec();

    if (!reward) {
      throw new NotFoundException('Recompensa não encontrada');
    }

    return this.toResponseDto(reward);
  }

  async approve(
    id: string,
    approvedBy: string,
    _franchiseId?: string,
  ): Promise<RewardResponseDto> {
    const reward = await this.rewardModel.findOne({ _id: id }).exec();

    if (!reward) {
      throw new NotFoundException('Recompensa não encontrada');
    }

    if (reward.status !== 'pending' && reward.status !== 'processing') {
      throw new BadRequestException(
        'Recompensa não pode ser aprovada neste status',
      );
    }

    reward.status = 'approved';
    reward.processing = {
      ...reward.processing,
      approvedBy: new Types.ObjectId(approvedBy),
      approvedAt: new Date(),
    };

    const saved = await reward.save();

    // TODO: Processar pagamento baseado no tipo de recompensa
    // - Cashback: creditar na carteira
    // - Desconto: gerar cupom
    // - Pontos: adicionar pontos
    // - Prêmio: reservar produto

    return this.toResponseDto(saved);
  }

  async cancel(
    id: string,
    cancelledBy: string,
    reason: string,
    _franchiseId?: string,
  ): Promise<RewardResponseDto> {
    const reward = await this.rewardModel.findOne({ _id: id }).exec();

    if (!reward) {
      throw new NotFoundException('Recompensa não encontrada');
    }

    if (reward.status === 'paid') {
      throw new BadRequestException(
        'Não é possível cancelar uma recompensa já paga',
      );
    }

    reward.status = 'cancelled';
    reward.processing = {
      ...reward.processing,
      cancelledBy: new Types.ObjectId(cancelledBy),
      cancelledAt: new Date(),
      cancelReason: reason,
    };

    const saved = await reward.save();

    return this.toResponseDto(saved);
  }

  async markAsPaid(id: string): Promise<RewardResponseDto> {
    const reward = await this.rewardModel.findOne({ _id: id }).exec();

    if (!reward) {
      throw new NotFoundException('Recompensa não encontrada');
    }

    if (reward.status !== 'approved') {
      throw new BadRequestException(
        'Recompensa deve estar aprovada para ser marcada como paga',
      );
    }

    reward.status = 'paid';
    reward.processing = {
      ...reward.processing,
      paidAt: new Date(),
      processedAt: new Date(),
    };

    const saved = await reward.save();

    // Atualizar status na indicação
    // Nota: findOne pode não precisar de franchiseId neste contexto
    try {
      const referral = await this.referralsService.findOne(
        reward.referralId.toString(),
      );

      if (referral.referrerId === reward.userId.toString()) {
        // TODO: Atualizar status da recompensa do referrer na indicação
      }

      if (
        referral.refereeId === reward.userId.toString() &&
        referral.refereeReward
      ) {
        // TODO: Atualizar status da recompensa do referee na indicação
      }
    } catch (error) {
      this.logger.warn(
        `Erro ao buscar indicação para atualizar status: ${error.message}`,
      );
    }

    return this.toResponseDto(saved);
  }

  private toResponseDto(reward: RewardDocument): RewardResponseDto {
    return {
      id: reward._id.toString(),
      referralId: reward.referralId.toString(),
      userId: reward.userId.toString(),
      campaignId: reward.campaignId.toString(),
      type: reward.type,
      value: reward.value,
      currency: reward.currency,
      status: reward.status,
      details: reward.details
        ? {
            walletId: reward.details.walletId?.toString(),
            transactionId: reward.details.transactionId,
            couponCode: reward.details.couponCode,
            couponExpiresAt: reward.details.couponExpiresAt,
            pointsAccountId: reward.details.pointsAccountId?.toString(),
            productId: reward.details.productId?.toString(),
            shippingAddress: reward.details.shippingAddress,
            trackingCode: reward.details.trackingCode,
          }
        : undefined,
      processing: reward.processing
        ? {
            scheduledAt: reward.processing.scheduledAt,
            processedAt: reward.processing.processedAt,
            approvedBy: reward.processing.approvedBy?.toString(),
            approvedAt: reward.processing.approvedAt,
            paidAt: reward.processing.paidAt,
            cancelledAt: reward.processing.cancelledAt,
            cancelledBy: reward.processing.cancelledBy?.toString(),
            cancelReason: reward.processing.cancelReason,
          }
        : undefined,
      metadata: reward.metadata,
      createdAt: reward.createdAt || new Date(),
      updatedAt: reward.updatedAt || new Date(),
    };
  }
}
