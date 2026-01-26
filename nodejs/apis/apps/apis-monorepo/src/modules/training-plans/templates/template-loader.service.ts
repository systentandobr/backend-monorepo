import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CreateTrainingPlanDto } from '../dto/create-training-plan.dto';

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

  constructor() {
    this.loadTemplates();
  }

  /**
   * Carrega os templates do arquivo JSON
   */
  private loadTemplates(): void {
    try {
      // Tentar múltiplos caminhos possíveis
      const possiblePaths = [
        // Caminho quando compilado (produção) - __dirname aponta para dist/modules/training-plans/templates
        path.join(__dirname, 'abc-beginner-templates.json'),
        // Caminho em desenvolvimento (src)
        path.join(
          process.cwd(),
          'src',
          'modules',
          'training-plans',
          'templates',
          'abc-beginner-templates.json',
        ),
        // Caminho alternativo em dist (caso __dirname não funcione)
        path.join(
          process.cwd(),
          'dist',
          'modules',
          'training-plans',
          'templates',
          'abc-beginner-templates.json',
        ),
      ];

      let templatesPath: string | null = null;
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          templatesPath = possiblePath;
          break;
        }
      }

      if (!templatesPath) {
        throw new Error(
          `Arquivo de templates não encontrado. Tentados: ${possiblePaths.join(', ')}`,
        );
      }

      const fileContent = fs.readFileSync(templatesPath, 'utf-8');
      const data: TemplatesFile = JSON.parse(fileContent);
      this.templates = data.templates || [];
      this.logger.log(
        `✅ Templates carregados: ${this.templates.length} templates encontrados de ${templatesPath}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Erro ao carregar templates: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
      this.templates = [];
    }
  }

  /**
   * Busca um template por gênero
   * @param gender Gênero do estudante ('male', 'female', 'other')
   * @returns Template correspondente ou null se não encontrado
   */
  getTemplateByGender(
    gender?: 'male' | 'female' | 'other',
  ): TemplateData | null {
    if (!gender) {
      // Se não houver gênero, retornar template masculino como padrão
      this.logger.warn(
        '⚠️ Gênero não informado, usando template masculino como padrão',
      );
      return this.templates.find((t) => t.targetGender === 'male') || null;
    }

    const template = this.templates.find((t) => t.targetGender === gender);
    if (!template) {
      this.logger.warn(
        `⚠️ Template não encontrado para gênero ${gender}, usando template masculino como padrão`,
      );
      return this.templates.find((t) => t.targetGender === 'male') || null;
    }

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
  getTemplateAsCreateDto(
    gender?: 'male' | 'female' | 'other',
    studentId?: string,
    studentName?: string,
  ): CreateTrainingPlanDto | null {
    if (!studentId) {
      this.logger.error('❌ studentId é obrigatório para criar plano');
      return null;
    }

    const template = this.getTemplateByGender(gender);
    if (!template) {
      this.logger.error('❌ Template não encontrado');
      return null;
    }

    return this.convertTemplateToCreateDto(template, studentId, studentName);
  }
}
