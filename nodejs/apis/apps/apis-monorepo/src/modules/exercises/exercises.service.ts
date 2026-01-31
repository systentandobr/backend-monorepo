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
    const query: any = { unitId, isActive: true };

    // Filtro de busca por nome
    if (filters.search) {
      query.name = { $regex: filters.search, $options: 'i' };
    }

    // Filtro por grupo muscular
    if (filters.muscleGroup) {
      query.muscleGroups = { $in: [filters.muscleGroup] };
    }

    // Filtro por equipamento
    if (filters.equipment) {
      query.equipment = { $in: [filters.equipment] };
    }

    // Filtro por dificuldade
    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }

    // Filtro por gênero alvo
    if (filters.targetGender) {
      query.$or = [
        { targetGender: filters.targetGender },
        { targetGender: { $exists: false } },
        { targetGender: null },
      ];
    }

    const exercises = await this.exerciseModel
      .find(query)
      .sort({ name: 1 })
      .exec();
    return exercises.map((exercise) => this.toResponseDto(exercise));
  }

  async findOne(id: string, unitId: string): Promise<ExerciseResponseDto> {
    const exercise = await this.exerciseModel
      .findOne({ _id: id, unitId })
      .exec();
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
