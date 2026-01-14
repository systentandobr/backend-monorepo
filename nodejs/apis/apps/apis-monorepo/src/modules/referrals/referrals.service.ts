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
import { Referral, ReferralDocument } from './schemas/referral.schema';
import { CreateReferralDto } from './dto/create-referral.dto';
import { ReferralFiltersDto } from './dto/referral-filters.dto';
import {
  ReferralResponseDto,
  ReferralStatsResponseDto,
} from './dto/referral-response.dto';
import { Types } from 'mongoose';
import { ReferralCampaignsService } from '../referral-campaigns/referral-campaigns.service';
import { RewardsService } from '../rewards/rewards.service';

@Injectable()
export class ReferralsService {
  private readonly logger = new Logger(ReferralsService.name);

  constructor(
    @InjectModel(Referral.name)
    private referralModel: Model<ReferralDocument>,
    @Inject(forwardRef(() => ReferralCampaignsService))
    private readonly campaignsService: ReferralCampaignsService,
    @Inject(forwardRef(() => RewardsService))
    private readonly rewardsService: RewardsService,
  ) {}

  /**
   * Gera um código único de indicação
   */
  private generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removido 0, O, I, 1 para evitar confusão
    let code = '';
    for (let i = 0; i < 4; i++) {
      if (i > 0) code += '-';
      for (let j = 0; j < 4; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    return code;
  }

  /**
   * Valida se o código de indicação é válido
   */
  async validateCode(code: string): Promise<ReferralResponseDto> {
    const referral = await this.referralModel
      .findOne({ referralCode: code })
      .exec();

    if (!referral) {
      throw new NotFoundException('Código de indicação não encontrado');
    }

    if (referral.status === 'cancelled' || referral.status === 'expired') {
      throw new BadRequestException('Código de indicação não está mais válido');
    }

    // Verificar se expirou
    if (
      referral.tracking?.expiredAt &&
      referral.tracking.expiredAt < new Date()
    ) {
      await this.referralModel.updateOne(
        { _id: referral._id },
        { status: 'expired', 'tracking.expiredAt': new Date() },
      );
      throw new BadRequestException('Código de indicação expirado');
    }

    return this.toResponseDto(referral);
  }

  async create(
    createReferralDto: CreateReferralDto,
    userId: string,
    franchiseId: string,
  ): Promise<ReferralResponseDto> {
    // Validar campanha
    const campaign = await this.campaignsService.findOne(
      createReferralDto.campaignId,
      franchiseId,
    );

    if (campaign.status !== 'active') {
      throw new BadRequestException('Campanha não está ativa');
    }

    // Verificar limites da campanha
    if (campaign.rules?.maxReferralsPerUser) {
      const userReferrals = await this.referralModel.countDocuments({
        referrerId: new Types.ObjectId(userId),
        campaignId: new Types.ObjectId(createReferralDto.campaignId),
        status: { $in: ['pending', 'registered', 'completed'] },
      });

      if (userReferrals >= campaign.rules.maxReferralsPerUser) {
        throw new BadRequestException(
          `Limite de ${campaign.rules.maxReferralsPerUser} indicações atingido`,
        );
      }
    }

    // Verificar limite total da campanha
    if (campaign.rules?.maxReferralsTotal) {
      const totalReferrals = await this.referralModel.countDocuments({
        campaignId: new Types.ObjectId(createReferralDto.campaignId),
        status: { $in: ['pending', 'registered', 'completed'] },
      });

      if (totalReferrals >= campaign.rules.maxReferralsTotal) {
        throw new BadRequestException(
          'Limite total de indicações da campanha atingido',
        );
      }
    }

    // Gerar código único
    let referralCode: string;
    let attempts = 0;
    do {
      referralCode = this.generateReferralCode();
      const existing = await this.referralModel
        .findOne({ referralCode })
        .exec();
      if (!existing) break;
      attempts++;
      if (attempts > 10) {
        throw new BadRequestException(
          'Erro ao gerar código único. Tente novamente.',
        );
      }
    } while (true);

    // Calcular data de expiração
    const expirationDays = campaign.rules?.expirationDays || 30;
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + expirationDays);

    // Criar indicação
    const referral = new this.referralModel({
      campaignId: new Types.ObjectId(createReferralDto.campaignId),
      franchiseId: new Types.ObjectId(franchiseId),
      referrerId: new Types.ObjectId(userId),
      referralCode,
      status: 'pending',
      referrerReward: {
        type: campaign.referrerReward.type,
        value: campaign.referrerReward.value,
        currency: campaign.referrerReward.currency,
        status: 'pending',
      },
      refereeReward: campaign.refereeReward
        ? {
            type: campaign.refereeReward.type,
            value: campaign.refereeReward.value,
            currency: campaign.refereeReward.currency,
            status: 'pending',
          }
        : undefined,
      tracking: {
        sharedAt: new Date(),
        sharedVia: createReferralDto.sharedVia,
        expiredAt,
      },
      fraud: {
        score: 0,
        flags: [],
        verified: false,
      },
      metadata: createReferralDto.metadata,
    });

    const saved = await referral.save();

    // Atualizar métricas da campanha
    await this.updateCampaignMetrics(createReferralDto.campaignId);

    return this.toResponseDto(saved);
  }

  async findAll(
    filters: ReferralFiltersDto,
    franchiseId?: string,
  ): Promise<{
    data: ReferralResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query: any = {};

    if (filters.campaignId) {
      query.campaignId = new Types.ObjectId(filters.campaignId);
    }

    if (filters.referrerId) {
      query.referrerId = new Types.ObjectId(filters.referrerId);
    }

    if (filters.refereeId) {
      query.refereeId = new Types.ObjectId(filters.refereeId);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.referralCode) {
      query.referralCode = filters.referralCode;
    }

    if (franchiseId) {
      query.franchiseId = new Types.ObjectId(franchiseId);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.referralModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.referralModel.countDocuments(query).exec(),
    ]);

    return {
      data: data.map((r) => this.toResponseDto(r)),
      total,
      page,
      limit,
    };
  }

  async findOne(
    id: string,
    franchiseId?: string,
  ): Promise<ReferralResponseDto> {
    const query: any = { _id: id };

    if (franchiseId) {
      query.franchiseId = new Types.ObjectId(franchiseId);
    }

    const referral = await this.referralModel.findOne(query).exec();

    if (!referral) {
      throw new NotFoundException('Indicação não encontrada');
    }

    return this.toResponseDto(referral);
  }

  async findByCode(code: string): Promise<ReferralResponseDto> {
    return this.validateCode(code);
  }

  async findByUser(
    userId: string,
    franchiseId?: string,
  ): Promise<ReferralResponseDto[]> {
    const query: any = { referrerId: new Types.ObjectId(userId) };

    if (franchiseId) {
      query.franchiseId = new Types.ObjectId(franchiseId);
    }

    const referrals = await this.referralModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
    return referrals.map((r) => this.toResponseDto(r));
  }

  async completeReferral(
    referralId: string,
    orderId: string,
    refereeId: string,
  ): Promise<ReferralResponseDto> {
    const referral = await this.referralModel
      .findOne({ _id: referralId })
      .exec();

    if (!referral) {
      throw new NotFoundException('Indicação não encontrada');
    }

    if (referral.status === 'completed') {
      throw new BadRequestException('Indicação já foi completada');
    }

    if (referral.status === 'cancelled' || referral.status === 'expired') {
      throw new BadRequestException('Indicação não pode ser completada');
    }

    // Atualizar indicação
    referral.refereeId = new Types.ObjectId(refereeId);
    referral.orderId = new Types.ObjectId(orderId);
    referral.status = 'completed';
    referral.tracking = {
      ...referral.tracking,
      completedAt: new Date(),
    };

    const saved = await referral.save();

    // Atualizar métricas da campanha
    await this.updateCampaignMetrics(referral.campaignId.toString());

    // TODO: Disparar processamento de recompensas (será implementado no módulo de rewards)

    return this.toResponseDto(saved);
  }

  async cancelReferral(
    referralId: string,
    userId: string,
    franchiseId?: string,
  ): Promise<ReferralResponseDto> {
    const query: any = {
      _id: referralId,
      referrerId: new Types.ObjectId(userId),
    };

    if (franchiseId) {
      query.franchiseId = new Types.ObjectId(franchiseId);
    }

    const referral = await this.referralModel.findOne(query).exec();

    if (!referral) {
      throw new NotFoundException('Indicação não encontrada');
    }

    if (referral.status === 'completed') {
      throw new BadRequestException(
        'Não é possível cancelar uma indicação completada',
      );
    }

    if (referral.status === 'cancelled') {
      throw new BadRequestException('Indicação já está cancelada');
    }

    referral.status = 'cancelled';
    referral.tracking = {
      ...referral.tracking,
      cancelledAt: new Date(),
    };

    const saved = await referral.save();

    // Atualizar métricas da campanha
    await this.updateCampaignMetrics(referral.campaignId.toString());

    return this.toResponseDto(saved);
  }

  async getCampaignStats(
    campaignId: string,
    franchiseId?: string,
  ): Promise<ReferralStatsResponseDto> {
    const query: any = { campaignId: new Types.ObjectId(campaignId) };

    if (franchiseId) {
      query.franchiseId = new Types.ObjectId(franchiseId);
    }

    const referrals = await this.referralModel.find(query).exec();

    const totalReferrals = referrals.length;
    const completedReferrals = referrals.filter(
      (r) => r.status === 'completed',
    ).length;
    const pendingReferrals = referrals.filter(
      (r) => r.status === 'pending',
    ).length;
    const cancelledReferrals = referrals.filter(
      (r) => r.status === 'cancelled',
    ).length;
    const expiredReferrals = referrals.filter(
      (r) => r.status === 'expired',
    ).length;

    const totalRewardsValue = referrals
      .filter((r) => r.status === 'completed')
      .reduce((sum, r) => {
        let value = r.referrerReward.value;
        if (r.refereeReward) {
          value += r.refereeReward.value;
        }
        return sum + value;
      }, 0);

    const conversionRate =
      totalReferrals > 0 ? (completedReferrals / totalReferrals) * 100 : 0;

    return {
      campaignId,
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      cancelledReferrals,
      expiredReferrals,
      totalRewardsValue,
      conversionRate,
    };
  }

  /**
   * Atualiza métricas da campanha
   */
  private async updateCampaignMetrics(campaignId: string): Promise<void> {
    const stats = await this.getCampaignStats(campaignId);

    // TODO: Atualizar métricas na campanha quando o serviço de campanhas permitir
    // Por enquanto, apenas logamos
    this.logger.debug(
      `Métricas atualizadas para campanha ${campaignId}:`,
      stats,
    );
  }

  private toResponseDto(referral: ReferralDocument): ReferralResponseDto {
    return {
      id: referral._id.toString(),
      campaignId: referral.campaignId.toString(),
      franchiseId: referral.franchiseId.toString(),
      referrerId: referral.referrerId.toString(),
      refereeId: referral.refereeId?.toString(),
      orderId: referral.orderId?.toString(),
      referralCode: referral.referralCode,
      shortLink: referral.shortLink,
      status: referral.status,
      referrerReward: {
        type: referral.referrerReward.type,
        value: referral.referrerReward.value,
        currency: referral.referrerReward.currency,
        status: referral.referrerReward.status,
        paidAt: referral.referrerReward.paidAt,
        rewardId: referral.referrerReward.rewardId?.toString(),
      },
      refereeReward: referral.refereeReward
        ? {
            type: referral.refereeReward.type,
            value: referral.refereeReward.value,
            currency: referral.refereeReward.currency,
            status: referral.refereeReward.status,
            paidAt: referral.refereeReward.paidAt,
            rewardId: referral.refereeReward.rewardId?.toString(),
          }
        : undefined,
      tracking: referral.tracking,
      fraud: referral.fraud
        ? {
            score: referral.fraud.score,
            flags: referral.fraud.flags,
            verified: referral.fraud.verified,
            verifiedAt: referral.fraud.verifiedAt,
            verifiedBy: referral.fraud.verifiedBy?.toString(),
          }
        : undefined,
      metadata: referral.metadata,
      createdAt: referral.createdAt || new Date(),
      updatedAt: referral.updatedAt || new Date(),
    };
  }
}
