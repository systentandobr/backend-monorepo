import { Injectable, NotFoundException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Setting, SettingDocument } from './schemas/setting.schema';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingResponseDto } from './dto/setting-response.dto';
import { Franchise, FranchiseDocument } from '../franchises/schemas/franchise.schema';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectModel(Setting.name) private settingModel: Model<SettingDocument>,
    @InjectModel(Franchise.name) private franchiseModel: Model<FranchiseDocument>,
  ) {}

  /**
   * Converte o documento do MongoDB para DTO de resposta
   */
  private toResponseDto(setting: SettingDocument): SettingResponseDto {
    return {
      id: setting._id.toString(),
      unitId: setting.unitId,
      franchiseId: setting.franchiseId?.toString(),
      notifications: setting.notifications,
      franchise: setting.franchise,
      general: setting.general,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    };
  }

  /**
   * Cria ou atualiza configurações para uma unidade
   */
  async createOrUpdate(createSettingDto: CreateSettingDto): Promise<SettingResponseDto> {
    const { unitId, franchiseId, ...updateData } = createSettingDto;

    // Buscar franchiseId automaticamente se não fornecido
    let franchiseObjectId: Types.ObjectId | undefined;
    if (franchiseId) {
      franchiseObjectId = new Types.ObjectId(franchiseId);
    } else {
      // Buscar franchise por unitId para obter o _id
      const franchise = await this.franchiseModel.findOne({ unitId }).exec();
      if (franchise && franchise._id) {
        franchiseObjectId = franchise._id;
        this.logger.log(`FranchiseId encontrado automaticamente para unitId ${unitId}: ${franchiseObjectId}`);
      }
    }

    // Converter franchiseId string para ObjectId se fornecido ou encontrado
    const updatePayload: any = { ...updateData };
    if (franchiseObjectId) {
      updatePayload.franchiseId = franchiseObjectId;
    }

    const setting = await this.settingModel.findOneAndUpdate(
      { unitId },
      { $set: updatePayload },
      { new: true, upsert: true, runValidators: true },
    );

    return this.toResponseDto(setting);
  }

  /**
   * Busca configurações por unitId
   */
  async findByUnitId(unitId: string): Promise<SettingResponseDto | null> {
    const setting = await this.settingModel.findOne({ unitId });
    
    if (!setting) {
      return null;
    }

    return this.toResponseDto(setting);
  }

  /**
   * Busca configurações por unitId ou retorna null se não existir
   */
  async findOne(unitId: string): Promise<SettingResponseDto> {
    const setting = await this.findByUnitId(unitId);
    
    if (!setting) {
      throw new NotFoundException(`Configurações não encontradas para a unidade ${unitId}`);
    }

    return setting;
  }

  /**
   * Atualiza configurações de uma unidade
   */
  async update(unitId: string, updateSettingDto: UpdateSettingDto): Promise<SettingResponseDto> {
    const setting = await this.settingModel.findOneAndUpdate(
      { unitId },
      { $set: updateSettingDto },
      { new: true, runValidators: true },
    );

    if (!setting) {
      throw new NotFoundException(`Configurações não encontradas para a unidade ${unitId}`);
    }

    return this.toResponseDto(setting);
  }

  /**
   * Remove configurações de uma unidade
   */
  async remove(unitId: string): Promise<void> {
    const result = await this.settingModel.deleteOne({ unitId });
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Configurações não encontradas para a unidade ${unitId}`);
    }
  }

  /**
   * Busca todas as configurações (para admin)
   */
  async findAll(): Promise<SettingResponseDto[]> {
    const settings = await this.settingModel.find();
    return settings.map(setting => this.toResponseDto(setting));
  }

  /**
   * Busca configurações de notificações para uma unidade
   * Retorna null se não existir, permitindo fallback para variáveis de ambiente
   */
  async getNotificationSettings(unitId: string): Promise<{
    telegram?: { botToken?: string; chatId?: string; enabled?: boolean };
    discord?: { webhookUrl?: string; enabled?: boolean };
    email?: { host?: string; port?: number; username?: string; password?: string; from?: string; enabled?: boolean };
  } | null> {
    const setting = await this.findByUnitId(unitId);
    return setting?.notifications || null;
  }
}

