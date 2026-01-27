import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTrainingPlanDto } from '../dto/create-training-plan.dto';
import { TrainingPlan, TrainingPlanDocument } from '../schemas/training-plan.schema';

interface TemplateData {
  name: string;
  description: string;
  targetGender: 'male' | 'female' | 'other';
  objectives: string[];
  weeklySchedule: {
    dayOfWeek: number;
    timeSlots: {
      startTime: string;
      endTime: string;
      activity: string;
    }[];
    exercises: {
      name: string;
      sets: number;
      reps: string;
      restTime: number;
      notes?: string;
    }[];
  }[];
}

interface TemplatesFile {
  templates: TemplateData[];
}

@Injectable()
export class TemplateLoaderService {
  private readonly logger = new Logger(TemplateLoaderService.name);
  private templates: TemplateData[] = [];
  private templatesLoaded = false;

  constructor(
    @InjectModel(TrainingPlan.name)
    private trainingPlanModel: Model<TrainingPlanDocument>,
  ) {
    // Carregar templates do MongoDB de forma assíncrona
    this.loadTemplatesFromDatabase();
  }

  /**
   * Carrega os templates do MongoDB
   */
  private async loadTemplatesFromDatabase(): Promise<void> {
    try {
      this.logger.log('🔍 Carregando templates do MongoDB...');
      
      // Buscar todos os templates no banco
      const dbTemplates = await this.trainingPlanModel
        .find({
          isTemplate: true,
        })
        .exec();

      if (dbTemplates.length === 0) {
        this.logger.warn(
          '⚠️ Nenhum template encontrado no MongoDB. Execute o script de importação: npx ts-node -r tsconfig-paths/register src/modules/training-plans/scripts/import-templates.ts',
        );
        this.templates = [];
        this.templatesLoaded = true;
        return;
      }

      // Converter documentos do MongoDB para TemplateData
      this.templates = dbTemplates.map((tp) => ({
        name: tp.name,
        description: tp.description || '',
        targetGender: tp.targetGender || 'male',
        objectives: tp.objectives || [],
        weeklySchedule: (tp.weeklySchedule || []).map((day) => ({
          dayOfWeek: day.dayOfWeek,
          timeSlots: day.timeSlots || [],
          exercises: (day.exercises || []).map((ex) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            restTime: ex.restTime,
            notes: ex.notes,
          })),
        })),
      }));

      this.logger.log(
        `✅ Templates carregados do MongoDB: ${this.templates.length} templates encontrados`,
      );
      
      // Log dos gêneros disponíveis
      const genders = this.templates.map((t) => t.targetGender).join(', ');
      this.logger.log(`📋 Gêneros disponíveis nos templates: ${genders}`);
      
      this.templatesLoaded = true;
    } catch (error) {
      this.logger.error(
        `❌ Erro ao carregar templates do MongoDB: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
      if (error instanceof Error && error.stack) {
        this.logger.error(`Stack trace: ${error.stack}`);
      }
      this.templates = [];
      this.templatesLoaded = true;
    }
  }

  /**
   * Aguarda os templates serem carregados (para uso síncrono)
   */
  private async ensureTemplatesLoaded(): Promise<void> {
    if (!this.templatesLoaded) {
      // Aguardar até 5 segundos para os templates carregarem
      const maxWait = 5000;
      const startTime = Date.now();
      while (!this.templatesLoaded && Date.now() - startTime < maxWait) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }


  /**
   * Normaliza o valor de gênero para garantir que seja válido
   */
  private normalizeGender(gender?: string | null): 'male' | 'female' | 'other' | undefined {
    if (!gender) return undefined;
    
    const normalized = gender.toLowerCase().trim();
    
    // Corrigir valores incorretos comuns
    if (normalized === 'mmale' || normalized === 'male') return 'male';
    if (normalized === 'ffemale' || normalized === 'female') return 'female';
    if (normalized === 'other') return 'other';
    
    // Se não for um valor válido, retornar undefined
    if (!['male', 'female', 'other'].includes(normalized)) {
      this.logger.warn(`⚠️ Gênero inválido recebido: "${gender}", normalizado para undefined`);
      return undefined;
    }
    
    return normalized as 'male' | 'female' | 'other';
  }

  /**
   * Busca um template por gênero
   * @param gender Gênero do estudante ('male', 'female', 'other')
   * @returns Template correspondente ou null se não encontrado
   */
  async getTemplateByGender(
    gender?: 'male' | 'female' | 'other' | string | null,
  ): Promise<TemplateData | null> {
    // Garantir que os templates foram carregados
    await this.ensureTemplatesLoaded();
    
    // Verificar se há templates carregados
    if (this.templates.length === 0) {
      this.logger.error('❌ Nenhum template foi carregado. Execute o script de importação ou verifique o MongoDB.');
      return null;
    }

    // Normalizar o gênero
    const normalizedGender = this.normalizeGender(gender);
    
    if (!normalizedGender) {
      // Se não houver gênero válido, retornar template masculino como padrão
      this.logger.warn(
        `⚠️ Gênero não informado ou inválido (recebido: "${gender}"), usando template masculino como padrão`,
      );
      const defaultTemplate = this.templates.find((t) => t.targetGender === 'male');
      if (!defaultTemplate) {
        this.logger.error('❌ Template masculino padrão não encontrado');
      }
      return defaultTemplate || null;
    }

    this.logger.log(`🔍 Buscando template para gênero: ${normalizedGender}`);
    const template = this.templates.find((t) => t.targetGender === normalizedGender);
    
    if (!template) {
      this.logger.warn(
        `⚠️ Template não encontrado para gênero ${normalizedGender}, usando template masculino como padrão`,
      );
      const defaultTemplate = this.templates.find((t) => t.targetGender === 'male');
      if (!defaultTemplate) {
        this.logger.error('❌ Template masculino padrão não encontrado');
      }
      return defaultTemplate || null;
    }

    this.logger.log(`✅ Template encontrado para gênero: ${normalizedGender}`);
    return template;
  }

  /**
   * Converte um template para CreateTrainingPlanDto
   * @param template Template a ser convertido
   * @param studentId ID do estudante
   * @param studentName Nome do estudante (para personalizar o nome do plano)
   * @returns CreateTrainingPlanDto pronto para criação
   */
  convertTemplateToCreateDto(
    template: TemplateData,
    studentId: string,
    studentName?: string,
  ): CreateTrainingPlanDto {
    const planName = studentName
      ? `${template.name} - ${studentName}`
      : template.name;

    return {
      studentId,
      name: planName,
      description: template.description,
      objectives: template.objectives,
      weeklySchedule: template.weeklySchedule.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        timeSlots: day.timeSlots,
        exercises: day.exercises.map((ex) => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          restTime: ex.restTime,
          notes: ex.notes,
        })),
      })),
      startDate: new Date().toISOString().split('T')[0], // Data atual no formato YYYY-MM-DD
      status: 'active',
      isTemplate: false,
    };
  }

  /**
   * Busca template e converte para CreateTrainingPlanDto
   * @param gender Gênero do estudante
   * @param studentId ID do estudante
   * @param studentName Nome do estudante
   * @returns CreateTrainingPlanDto ou null se template não encontrado
   */
  async getTemplateAsCreateDto(
    gender?: 'male' | 'female' | 'other' | string | null,
    studentId?: string,
    studentName?: string,
  ): Promise<CreateTrainingPlanDto | null> {
    if (!studentId) {
      this.logger.error('❌ studentId é obrigatório para criar plano');
      return null;
    }

    // Garantir que os templates foram carregados
    await this.ensureTemplatesLoaded();

    // Verificar se há templates carregados
    if (this.templates.length === 0) {
      this.logger.error('❌ Nenhum template foi carregado. Execute o script de importação ou verifique o MongoDB.');
      return null;
    }

    const template = await this.getTemplateByGender(gender);
    if (!template) {
      this.logger.error(`❌ Template não encontrado. Templates disponíveis: ${this.templates.length}, Gêneros: ${this.templates.map(t => t.targetGender).join(', ')}`);
      return null;
    }

    this.logger.log(`✅ Convertendo template "${template.name}" para CreateTrainingPlanDto`);
    return this.convertTemplateToCreateDto(template, studentId, studentName);
  }
}
