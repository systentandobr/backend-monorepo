import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReferralCampaign, ReferralCampaignDocument } from './schemas/referral-campaign.schema';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignFiltersDto } from './dto/campaign-filters.dto';
import {
  ReferralCampaignResponseDto,
  CampaignStatsResponseDto,
} from './dto/campaign-response.dto';
import { Types } from 'mongoose';

@Injectable()
export class ReferralCampaignsService {
  private readonly logger = new Logger(ReferralCampaignsService.name);

  constructor(
    @InjectModel(ReferralCampaign.name)
    private campaignModel: Model<ReferralCampaignDocument>,
  ) {}

  async create(
    createCampaignDto: CreateCampaignDto,
    userId: string,
    franchiseId?: string,
  ): Promise<ReferralCampaignResponseDto> {
    // Validar datas
    const startDate = new Date(createCampaignDto.startDate);
    const endDate = new Date(createCampaignDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Data de início deve ser anterior à data de fim');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Data de início não pode ser no passado');
    }

    // Validar tipo e recompensas
    if (createCampaignDto.type === 'multi-tier' && !createCampaignDto.refereeReward) {
      throw new BadRequestException('Campanhas multi-tier requerem refereeReward');
    }

    // Verificar se slug já existe
    const existingSlug = await this.campaignModel.findOne({
      slug: createCampaignDto.slug,
    });

    if (existingSlug) {
      throw new BadRequestException('Slug já existe');
    }

    const campaign = new this.campaignModel({
      name: createCampaignDto.name,
      description: createCampaignDto.description,
      slug: createCampaignDto.slug,
      type: createCampaignDto.type,
      rewardTypes: createCampaignDto.rewardTypes,
      franchiseId: franchiseId ? new Types.ObjectId(franchiseId) : undefined,
      startDate,
      endDate,
      createdBy: new Types.ObjectId(userId),
      referrerReward: {
        rewardType: createCampaignDto.referrerReward.type,
        value: createCampaignDto.referrerReward.value,
        currency: createCampaignDto.referrerReward.currency,
        productId: createCampaignDto.referrerReward.productId
          ? new Types.ObjectId(createCampaignDto.referrerReward.productId)
          : undefined,
      },
      refereeReward: createCampaignDto.refereeReward
        ? {
            rewardType: createCampaignDto.refereeReward.type,
            value: createCampaignDto.refereeReward.value,
            currency: createCampaignDto.refereeReward.currency,
            productId: createCampaignDto.refereeReward.productId
              ? new Types.ObjectId(createCampaignDto.refereeReward.productId)
              : undefined,
          }
        : undefined,
      rules: createCampaignDto.rules
        ? {
            minPurchaseValue: createCampaignDto.rules.minPurchaseValue,
            maxReferralsPerUser: createCampaignDto.rules.maxReferralsPerUser,
            maxReferralsTotal: createCampaignDto.rules.maxReferralsTotal,
            expirationDays: createCampaignDto.rules.expirationDays,
            requireEmailVerification: createCampaignDto.rules.requireEmailVerification,
            allowedProducts: createCampaignDto.rules.allowedProducts?.map(
              (id) => new Types.ObjectId(id),
            ),
            excludedProducts: createCampaignDto.rules.excludedProducts?.map(
              (id) => new Types.ObjectId(id),
            ),
          }
        : undefined,
      metrics: {
        totalReferrals: 0,
        completedReferrals: 0,
        totalRewardsValue: 0,
        conversionRate: 0,
      },
      metadata: createCampaignDto.metadata,
    });

    const saved = await campaign.save();
    return this.toResponseDto(saved);
  }

  async findAll(
    filters: CampaignFiltersDto,
    franchiseId?: string,
  ): Promise<{
    data: ReferralCampaignResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query: any = {};

    // Aplicar filtro de franquia
    if (filters.franchiseId) {
      query.franchiseId = new Types.ObjectId(filters.franchiseId);
    } else if (franchiseId) {
      query.franchiseId = new Types.ObjectId(franchiseId);
    } else {
      // Se não especificado, mostrar campanhas globais e da franquia
      query.$or = [
        { franchiseId: { $exists: false } },
        { franchiseId: null },
      ];
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { slug: { $regex: filters.search, $options: 'i' } },
      ];
    }

    // Filtrar campanhas ativas por data
    if (filters.status === 'active') {
      const now = new Date();
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.campaignModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.campaignModel.countDocuments(query).exec(),
    ]);

    return {
      data: data.map((c) => this.toResponseDto(c)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, franchiseId?: string): Promise<ReferralCampaignResponseDto> {
    const query: any = { _id: id };
    
    if (franchiseId) {
      query.$or = [
        { franchiseId: new Types.ObjectId(franchiseId) },
        { franchiseId: { $exists: false } },
        { franchiseId: null },
      ];
    }

    const campaign = await this.campaignModel.findOne(query).exec();

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    return this.toResponseDto(campaign);
  }

  async findBySlug(slug: string): Promise<ReferralCampaignResponseDto> {
    const campaign = await this.campaignModel.findOne({ slug }).exec();

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    return this.toResponseDto(campaign);
  }

  async findByFranchise(franchiseId: string): Promise<ReferralCampaignResponseDto[]> {
    const campaigns = await this.campaignModel
      .find({
        $or: [
          { franchiseId: new Types.ObjectId(franchiseId) },
          { franchiseId: { $exists: false } },
          { franchiseId: null },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();

    return campaigns.map((c) => this.toResponseDto(c));
  }

  async update(
    id: string,
    updateCampaignDto: UpdateCampaignDto,
    franchiseId?: string,
  ): Promise<ReferralCampaignResponseDto> {
    const query: any = { _id: id };
    
    if (franchiseId) {
      query.franchiseId = new Types.ObjectId(franchiseId);
    }

    const campaign = await this.campaignModel.findOne(query).exec();

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    // Validar datas se fornecidas
    if (updateCampaignDto.startDate || updateCampaignDto.endDate) {
      const startDate = updateCampaignDto.startDate
        ? new Date(updateCampaignDto.startDate)
        : campaign.startDate;
      const endDate = updateCampaignDto.endDate
        ? new Date(updateCampaignDto.endDate)
        : campaign.endDate;

      if (startDate >= endDate) {
        throw new BadRequestException('Data de início deve ser anterior à data de fim');
      }
    }

    // Preparar dados de atualização
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Copiar campos simples
    if (updateCampaignDto.name !== undefined) updateData.name = updateCampaignDto.name;
    if (updateCampaignDto.description !== undefined) updateData.description = updateCampaignDto.description;
    if (updateCampaignDto.slug !== undefined) updateData.slug = updateCampaignDto.slug;
    if (updateCampaignDto.type !== undefined) updateData.type = updateCampaignDto.type;
    if (updateCampaignDto.rewardTypes !== undefined) updateData.rewardTypes = updateCampaignDto.rewardTypes;
    if (updateCampaignDto.startDate !== undefined) updateData.startDate = new Date(updateCampaignDto.startDate);
    if (updateCampaignDto.endDate !== undefined) updateData.endDate = new Date(updateCampaignDto.endDate);
    if (updateCampaignDto.status !== undefined) updateData.status = updateCampaignDto.status;
    if (updateCampaignDto.metadata !== undefined) updateData.metadata = updateCampaignDto.metadata;

    // Converter referrerReward se fornecido
    if (updateCampaignDto.referrerReward) {
      updateData.referrerReward = {
        rewardType: updateCampaignDto.referrerReward.type,
        value: updateCampaignDto.referrerReward.value,
        currency: updateCampaignDto.referrerReward.currency,
        productId: updateCampaignDto.referrerReward.productId
          ? new Types.ObjectId(updateCampaignDto.referrerReward.productId)
          : undefined,
      };
    }

    // Converter refereeReward se fornecido
    if (updateCampaignDto.refereeReward) {
      updateData.refereeReward = {
        rewardType: updateCampaignDto.refereeReward.type,
        value: updateCampaignDto.refereeReward.value,
        currency: updateCampaignDto.refereeReward.currency,
        productId: updateCampaignDto.refereeReward.productId
          ? new Types.ObjectId(updateCampaignDto.refereeReward.productId)
          : undefined,
      };
    }

    // Converter rules se fornecido
    if (updateCampaignDto.rules) {
      updateData.rules = {
        minPurchaseValue: updateCampaignDto.rules.minPurchaseValue,
        maxReferralsPerUser: updateCampaignDto.rules.maxReferralsPerUser,
        maxReferralsTotal: updateCampaignDto.rules.maxReferralsTotal,
        expirationDays: updateCampaignDto.rules.expirationDays,
        requireEmailVerification: updateCampaignDto.rules.requireEmailVerification,
        allowedProducts: updateCampaignDto.rules.allowedProducts?.map(
          (id) => new Types.ObjectId(id),
        ),
        excludedProducts: updateCampaignDto.rules.excludedProducts?.map(
          (id) => new Types.ObjectId(id),
        ),
      };
    }

    const updated = await this.campaignModel
      .findOneAndUpdate(query, updateData, { new: true })
      .exec();

    return this.toResponseDto(updated);
  }

  async remove(id: string, franchiseId?: string): Promise<void> {
    const query: any = { _id: id };
    
    if (franchiseId) {
      query.franchiseId = new Types.ObjectId(franchiseId);
    }

    const result = await this.campaignModel.deleteOne(query).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Campanha não encontrada');
    }
  }

  async activate(id: string, franchiseId?: string): Promise<ReferralCampaignResponseDto> {
    const campaign = await this.findOne(id, franchiseId);
    
    const now = new Date();
    if (campaign.endDate < now) {
      throw new BadRequestException('Não é possível ativar uma campanha expirada');
    }

    return this.update(id, { status: 'active' }, franchiseId);
  }

  async pause(id: string, franchiseId?: string): Promise<ReferralCampaignResponseDto> {
    return this.update(id, { status: 'paused' }, franchiseId);
  }

  async getStats(id: string, franchiseId?: string): Promise<CampaignStatsResponseDto> {
    const campaign = await this.findOne(id, franchiseId);
    
    // TODO: Implementar cálculo real de estatísticas quando módulo de referrals estiver pronto
    // Por enquanto, retornar métricas básicas da campanha
    
    return {
      campaignId: campaign.id,
      totalReferrals: campaign.metrics?.totalReferrals || 0,
      completedReferrals: campaign.metrics?.completedReferrals || 0,
      pendingReferrals: 0,
      cancelledReferrals: 0,
      expiredReferrals: 0,
      totalRewardsValue: campaign.metrics?.totalRewardsValue || 0,
      conversionRate: campaign.metrics?.conversionRate || 0,
      averageOrderValue: 0,
      totalRevenueGenerated: 0,
    };
  }

  async getActiveCampaigns(franchiseId?: string): Promise<ReferralCampaignResponseDto[]> {
    const now = new Date();
    const query: any = {
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    };

    if (franchiseId) {
      query.$or = [
        { franchiseId: new Types.ObjectId(franchiseId) },
        { franchiseId: { $exists: false } },
        { franchiseId: null },
      ];
    }

    const campaigns = await this.campaignModel.find(query).sort({ createdAt: -1 }).exec();
    return campaigns.map((c) => this.toResponseDto(c));
  }

  private toResponseDto(campaign: ReferralCampaignDocument): ReferralCampaignResponseDto {
    return {
      id: campaign._id.toString(),
      franchiseId: campaign.franchiseId?.toString(),
      name: campaign.name,
      description: campaign.description,
      slug: campaign.slug,
      type: campaign.type,
      rewardTypes: campaign.rewardTypes,
      referrerReward: {
        type: (campaign.referrerReward as any).rewardType || (campaign.referrerReward as any).type,
        value: campaign.referrerReward.value,
        currency: campaign.referrerReward.currency,
        productId: campaign.referrerReward.productId?.toString(),
      },
      refereeReward: campaign.refereeReward
        ? {
            type: (campaign.refereeReward as any).rewardType || (campaign.refereeReward as any).type,
            value: campaign.refereeReward.value,
            currency: campaign.refereeReward.currency,
            productId: campaign.refereeReward.productId?.toString(),
          }
        : undefined,
      rules: campaign.rules
        ? {
            minPurchaseValue: campaign.rules.minPurchaseValue,
            maxReferralsPerUser: campaign.rules.maxReferralsPerUser,
            maxReferralsTotal: campaign.rules.maxReferralsTotal,
            expirationDays: campaign.rules.expirationDays,
            requireEmailVerification: campaign.rules.requireEmailVerification,
            allowedProducts: campaign.rules.allowedProducts?.map((id) => id.toString()),
            excludedProducts: campaign.rules.excludedProducts?.map((id) => id.toString()),
          }
        : undefined,
      status: campaign.status,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      metrics: campaign.metrics,
      metadata: campaign.metadata,
      createdBy: campaign.createdBy.toString(),
      createdAt: campaign.createdAt || new Date(),
      updatedAt: campaign.updatedAt || new Date(),
    };
  }
}
