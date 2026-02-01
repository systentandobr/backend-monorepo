import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exercise, ExerciseDocument } from './schemas/exercise.schema';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseResponseDto } from './dto/exercise-response.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class ExercisesService {
  private readonly logger = new Logger(ExercisesService.name);

  constructor(
    @InjectModel(Exercise.name) private exerciseModel: Model<ExerciseDocument>,
  ) {}

  async create(
    createExerciseDto: CreateExerciseDto,
    unitId: string,
  ): Promise<ExerciseResponseDto> {
    const exerciseData = {
      ...createExerciseDto,
      unitId,
      isActive:
        createExerciseDto.isActive !== undefined
          ? createExerciseDto.isActive
          : true,
    };

    const exercise = new this.exerciseModel(exerciseData);
    const saved = await exercise.save();
    return this.toResponseDto(saved);
  }

  async findAll(
    filters: {
      search?: string;
      muscleGroup?: string;
      equipment?: string;
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      targetGender?: 'male' | 'female' | 'other';
    },
    unitId: string,
  ): Promise<ExerciseResponseDto[]> {
    const systemUnitId = process.env.DEFAULT_UNIT_ID || '#BR#ALL#SYSTEM#0001';
    
    // Primeiro busca exercícios da unidade do usuário
    const userUnitQuery: any = {
      unitId,
      isActive: true,
    };

    // Aplicar filtros na query da unidade do usuário
    if (filters.search) {
      userUnitQuery.name = { $regex: filters.search, $options: 'i' };
    }
    if (filters.muscleGroup) {
      userUnitQuery.muscleGroups = { $in: [filters.muscleGroup] };
    }
    if (filters.equipment) {
      userUnitQuery.equipment = { $in: [filters.equipment] };
    }
    if (filters.difficulty) {
      userUnitQuery.difficulty = filters.difficulty;
    }
    if (filters.targetGender) {
      userUnitQuery.$or = [
        { targetGender: filters.targetGender },
        { targetGender: { $exists: false } },
        { targetGender: null },
      ];
    }

    const userExercises = await this.exerciseModel
      .find(userUnitQuery)
      .sort({ name: 1 })
      .exec();

    // Busca também pelos exercícios do sistema como fallback
    // (os exercícios da unidade do usuário têm prioridade e serão retornados primeiro)
    const systemQuery: any = {
      unitId: systemUnitId,
      isActive: true,
    };

    // Aplicar os mesmos filtros na query do sistema
    if (filters.search) {
      systemQuery.name = { $regex: filters.search, $options: 'i' };
    }
    if (filters.muscleGroup) {
      systemQuery.muscleGroups = { $in: [filters.muscleGroup] };
    }
    if (filters.equipment) {
      systemQuery.equipment = { $in: [filters.equipment] };
    }
    if (filters.difficulty) {
      systemQuery.difficulty = filters.difficulty;
    }
    if (filters.targetGender) {
      systemQuery.$or = [
        { targetGender: filters.targetGender },
        { targetGender: { $exists: false } },
        { targetGender: null },
      ];
    }

    const systemExercises = await this.exerciseModel
      .find(systemQuery)
      .sort({ name: 1 })
      .exec();

    // Combinar resultados: primeiro os da unidade do usuário, depois os do sistema
    // Remover duplicatas baseado no _id
    const exerciseMap = new Map<string, ExerciseDocument>();
    
    // Adicionar exercícios da unidade do usuário primeiro (prioridade)
    userExercises.forEach(ex => {
      exerciseMap.set(ex._id.toString(), ex);
    });
    
    // Adicionar exercícios do sistema apenas se não existirem duplicatas
    systemExercises.forEach(ex => {
      if (!exerciseMap.has(ex._id.toString())) {
        exerciseMap.set(ex._id.toString(), ex);
      }
    });

    const allExercises = Array.from(exerciseMap.values());
    return allExercises.map((exercise) => this.toResponseDto(exercise));
  }

  async findOne(id: string, unitId: string): Promise<ExerciseResponseDto> {
    // Primeiro tenta encontrar pela unidade do usuário
    let exercise = await this.exerciseModel
      .findOne({ _id: id, unitId })
      .exec();

    // Se não encontrou, tenta buscar pelos exercícios do sistema como fallback
    if (!exercise) {
      const systemUnitId = process.env.DEFAULT_UNIT_ID || '#BR#ALL#SYSTEM#0001';
      exercise = await this.exerciseModel
        .findOne({ _id: id, unitId: systemUnitId })
        .exec();
    }

    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }
    return this.toResponseDto(exercise);
  }

  async update(
    id: string,
    updateExerciseDto: UpdateExerciseDto,
    unitId: string,
  ): Promise<ExerciseResponseDto> {
    const exercise = await this.exerciseModel
      .findOneAndUpdate(
        { _id: id, unitId },
        { $set: updateExerciseDto },
        { new: true },
      )
      .exec();

    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    return this.toResponseDto(exercise);
  }

  async remove(id: string, unitId: string): Promise<void> {
    const result = await this.exerciseModel
      .findOneAndDelete({ _id: id, unitId })
      .exec();
    if (!result) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }
  }

  /**
   * Gera imagens para um exercício usando Nano Banana
   */
  async generateExerciseImages(
    exerciseName: string,
    description: string | undefined,
    muscleGroups: string[],
    equipment: string[] | undefined,
    targetGender: 'male' | 'female' | 'other',
    nanoBananaService: any, // NanoBananaService - será injetado
  ): Promise<string[]> {
    try {
      // Gerar imagens usando Nano Banana
      const imageBuffers = await nanoBananaService.generateExerciseImages(
        exerciseName,
        description,
        muscleGroups,
        equipment,
        targetGender,
      );

      // Salvar imagens temporariamente (serão movidas quando o exercício for criado)
      const tempId = `temp-${Date.now()}`;
      const urls = await this.saveImageBuffers(imageBuffers, tempId);

      return urls;
    } catch (error: any) {
      this.logger.error(`Erro ao gerar imagens: ${error.message}`);
      throw error;
    }
  }

  /**
   * Salva uma imagem em buffer e retorna a URL
   */
  async saveImageBuffer(
    buffer: Buffer,
    exerciseId: string,
    imageIndex: number,
  ): Promise<string> {
    const uploadDir = path.join(
      process.cwd(),
      'uploads',
      'exercises',
      exerciseId || 'temp',
    );

    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Gerar nome único para a imagem
    const hash = crypto.randomBytes(8).toString('hex');
    const filename = `image-${imageIndex}-${hash}.png`;
    const filePath = path.join(uploadDir, filename);

    // Salvar arquivo
    fs.writeFileSync(filePath, buffer);

    // Retornar URL relativa (será servida estaticamente)
    return `/uploads/exercises/${exerciseId || 'temp'}/${filename}`;
  }

  /**
   * Salva múltiplas imagens e retorna URLs
   */
  async saveImageBuffers(
    buffers: Buffer[],
    exerciseId: string,
  ): Promise<string[]> {
    const urls: string[] = [];

    for (let i = 0; i < buffers.length; i++) {
      const url = await this.saveImageBuffer(buffers[i], exerciseId, i);
      urls.push(url);
    }

    return urls;
  }

  private toResponseDto(exercise: ExerciseDocument): ExerciseResponseDto {
    return {
      id: exercise._id.toString(),
      unitId: exercise.unitId,
      name: exercise.name,
      description: exercise.description,
      muscleGroups: exercise.muscleGroups,
      equipment: exercise.equipment,
      defaultSets: exercise.defaultSets,
      defaultReps: exercise.defaultReps,
      defaultRestTime: exercise.defaultRestTime,
      difficulty: exercise.difficulty,
      targetGender: exercise.targetGender,
      images: exercise.images,
      isActive: exercise.isActive,
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
    };
  }
}
