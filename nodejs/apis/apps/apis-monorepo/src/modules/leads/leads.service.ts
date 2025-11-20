import { Injectable, NotFoundException, ConflictException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument, LeadStatus } from './schemas/lead.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadFiltersDto, LeadResponseDto, LeadPipelineStatsDto } from './dto/lead-response.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createLeadDto: CreateLeadDto, unitId: string): Promise<LeadResponseDto> {
    // Verificar se já existe lead com mesmo email na mesma unidade
    const existing = await this.leadModel.findOne({
      unitId,
      email: createLeadDto.email,
    });

    if (existing) {
      // Atualizar lead existente ao invés de criar duplicado
      return this.update(existing._id.toString(), createLeadDto, unitId);
    }

    // Calcular score inicial baseado nos dados
    const score = this.calculateInitialScore(createLeadDto);

    const lead = new this.leadModel({
      ...createLeadDto,
      unitId,
      score,
      pipeline: {
        stage: 'new',
        stageHistory: [{
          stage: 'new',
          enteredAt: new Date(),
        }],
      },
    });

    const saved = await lead.save();
    const responseDto = this.toResponseDto(saved);
    
    // Enviar notificação sobre novo lead
    this.notificationsService.notifyNewLead({
      id: responseDto.id,
      name: responseDto.name,
      email: responseDto.email,
      phone: responseDto.phone,
      city: responseDto.city,
      source: responseDto.source,
      score: responseDto.score,
      unitId: responseDto.unitId,
    }).catch(err => {
      this.logger.error(`Erro ao enviar notificação de novo lead: ${err.message}`);
    });
    
    return responseDto;
  }

  async findAll(filters: LeadFiltersDto, unitId: string): Promise<{
    data: LeadResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query: any = { unitId };

    // Aplicar filtros
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.source) {
      query.source = filters.source;
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.minScore !== undefined || filters.maxScore !== undefined) {
      query.score = {};
      if (filters.minScore !== undefined) query.score.$gte = filters.minScore;
      if (filters.maxScore !== undefined) query.score.$lte = filters.maxScore;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
        { city: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.leadModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.leadModel.countDocuments(query).exec(),
    ]);

    return {
      data: data.map(l => this.toResponseDto(l)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, unitId: string): Promise<LeadResponseDto> {
    const lead = await this.leadModel.findOne({ _id: id, unitId }).exec();
    
    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    return this.toResponseDto(lead);
  }

  async update(id: string, updateLeadDto: UpdateLeadDto, unitId: string): Promise<LeadResponseDto> {
    const lead = await this.leadModel.findOne({ _id: id, unitId }).exec();
    
    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    // Atualizar pipeline se status mudou
    const updateData: any = { ...updateLeadDto };
    
    if (updateLeadDto.status && updateLeadDto.status !== lead.status) {
      updateData[`${updateLeadDto.status}At`] = new Date();
      
      // Atualizar histórico do pipeline
      const currentStage = lead.pipeline?.stageHistory[lead.pipeline.stageHistory.length - 1];
      if (currentStage && !currentStage.exitedAt) {
        currentStage.exitedAt = new Date();
      }
      
      updateData.pipeline = {
        stage: this.getPipelineStage(updateLeadDto.status),
        stageHistory: [
          ...(lead.pipeline?.stageHistory || []),
          {
            stage: this.getPipelineStage(updateLeadDto.status),
            enteredAt: new Date(),
          },
        ],
      };
    }

    // Adicionar nota se fornecida
    if (updateLeadDto.note) {
      const notes = lead.notes || [];
      notes.push({
        content: updateLeadDto.note,
        author: 'system', // TODO: Pegar do usuário autenticado
        createdAt: new Date(),
      });
      updateData.notes = notes;
    }

    const updated = await this.leadModel.findOneAndUpdate(
      { _id: id, unitId },
      { ...updateData, updatedAt: new Date() },
      { new: true },
    ).exec();

    return this.toResponseDto(updated);
  }

  async convertToCustomer(id: string, unitId: string, customerId: string): Promise<LeadResponseDto> {
    const lead = await this.leadModel.findOneAndUpdate(
      { _id: id, unitId },
      {
        status: LeadStatus.CUSTOMER,
        customerId,
        convertedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true },
    ).exec();

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    const responseDto = this.toResponseDto(lead);
    
    // Enviar notificação sobre conversão
    this.notificationsService.notifyLeadConverted({
      id: responseDto.id,
      name: responseDto.name,
      email: responseDto.email,
      customerId: responseDto.customerId!,
      unitId: responseDto.unitId,
    }).catch(err => {
      this.logger.error(`Erro ao enviar notificação de conversão: ${err.message}`);
    });
    
    return responseDto;
  }

  async remove(id: string, unitId: string): Promise<void> {
    const result = await this.leadModel.deleteOne({ _id: id, unitId }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException('Lead não encontrado');
    }
  }

  async getPipelineStats(unitId: string): Promise<LeadPipelineStatsDto> {
    const leads = await this.leadModel.find({ unitId }).exec();
    
    const newCount = leads.filter(l => l.status === LeadStatus.NEW).length;
    const contactedCount = leads.filter(l => l.status === LeadStatus.CONTACTED).length;
    const qualifiedCount = leads.filter(l => l.status === LeadStatus.QUALIFIED).length;
    const convertedCount = leads.filter(l => l.status === LeadStatus.CONVERTED || l.status === LeadStatus.CUSTOMER).length;
    const lostCount = leads.filter(l => l.status === LeadStatus.LOST).length;
    const total = leads.length;
    
    const conversionRate = total > 0 ? (convertedCount / total) * 100 : 0;

    return {
      new: newCount,
      contacted: contactedCount,
      qualified: qualifiedCount,
      converted: convertedCount,
      lost: lostCount,
      total,
      conversionRate: Number(conversionRate.toFixed(2)),
    };
  }

  private calculateInitialScore(lead: CreateLeadDto): number {
    let score = 0;

    // Score baseado em dados completos
    if (lead.name && lead.name.length > 2) score += 10;
    if (lead.email) score += 10;
    if (lead.phone) score += 10;
    if (lead.city) score += 10;

    // Score baseado em metadata
    if (lead.metadata?.budget) score += 20;
    if (lead.metadata?.franchiseType) score += 15;
    if (lead.metadata?.experience) score += 10;
    if (lead.metadata?.timeToStart) score += 15;

    return Math.min(score, 100);
  }

  private getPipelineStage(status: LeadStatus): string {
    const stageMap: Record<LeadStatus, string> = {
      [LeadStatus.NEW]: 'new',
      [LeadStatus.CONTACTED]: 'contacted',
      [LeadStatus.QUALIFIED]: 'qualified',
      [LeadStatus.CONVERTED]: 'converted',
      [LeadStatus.CUSTOMER]: 'customer',
      [LeadStatus.LOST]: 'lost',
    };
    return stageMap[status] || 'new';
  }

  private toResponseDto(lead: LeadDocument): LeadResponseDto {
    return {
      id: lead._id.toString(),
      unitId: lead.unitId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      city: lead.city,
      state: lead.state,
      source: lead.source,
      status: lead.status,
      metadata: lead.metadata,
      tags: lead.tags,
      notes: lead.notes,
      contactedAt: lead.contactedAt,
      qualifiedAt: lead.qualifiedAt,
      convertedAt: lead.convertedAt,
      customerId: lead.customerId?.toString(),
      score: lead.score,
      pipeline: lead.pipeline,
      createdAt: lead.createdAt || new Date(),
      updatedAt: lead.updatedAt || new Date(),
    };
  }
}

