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
import { Veo3Service } from '../../services/veo3.service';
import { NanoBananaService } from '../../services/nano-banana.service';
import { S3Service } from '../../services/s3.service';

@Injectable()
export class ExercisesService {
  private readonly logger = new Logger(ExercisesService.name);

  constructor(
    @InjectModel(Exercise.name) private exerciseModel: Model<ExerciseDocument>,
    private readonly s3Service: S3Service,
  ) { }

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
    nanoBananaService: NanoBananaService, // NanoBananaService - será injetado
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
   * Gera um vídeo para um exercício usando Veo3
   */
  async generateExerciseVideo(
    exerciseName: string,
    description: string | undefined,
    muscleGroups: string[],
    equipment: string[] | undefined,
    targetGender: 'male' | 'female' | 'other',
    veo3Service: Veo3Service,
  ): Promise<string> {
    try {
      const videoBuffer = await veo3Service.generateExerciseVideo(
        exerciseName,
        description,
        muscleGroups,
        equipment,
        targetGender,
      );

      const tempId = `temp-video-${Date.now()}`;
      const url = await this.saveVideoBuffer(videoBuffer, tempId);

      return url;
    } catch (error: any) {
      this.logger.error(`Erro ao gerar vídeo: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lista todas as mídias (imagens e vídeos) de exercícios de forma paginada
   */
  async findAllMedia(
    unitId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: any[]; total: number }> {
    const uploadDir = path.join(process.cwd(), 'uploads', 'exercises');

    if (!fs.existsSync(uploadDir)) {
      return { items: [], total: 0 };
    }

    // Percorre recursivamente o diretório de uploads
    const allFiles: any[] = [];
    const folders = fs.readdirSync(uploadDir);

    for (const folder of folders) {
      const folderPath = path.join(uploadDir, folder);
      if (fs.statSync(folderPath).isDirectory()) {
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
          const filePath = path.join(folderPath, file);
          const stats = fs.statSync(filePath);

          // Verificar se é imagem ou vídeo
          const ext = path.extname(file).toLowerCase();
          const type = ['.mp4', '.mov', '.avi'].includes(ext) ? 'video' : 'image';

          allFiles.push({
            exerciseId: folder,
            filename: file,
            type,
            url: `/exercises/media/stream/${folder}/${file}`,
            size: stats.size,
            createdAt: stats.birthtime,
          });
        }
      }
    }

    // Ordenar por data de criação (mais recentes primeiro)
    allFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = allFiles.length;
    const items = allFiles.slice((page - 1) * limit, page * limit);

    return { items, total };
  }

  /**
   * Prepara um stream para um arquivo de mídia do S3
   */
  async getMediaStream(
    exerciseId: string,
    filename: string,
  ): Promise<{ stream: any; stats: { size: number }; mimeType: string }> {
    const key = `exercises/${exerciseId}/${filename}`;

    try {
      const { stream, contentType, contentLength } = await this.s3Service.getObject(key);
      return {
        stream,
        stats: { size: contentLength || 0 },
        mimeType: contentType || 'application/octet-stream'
      };
    } catch (error) {
      // Fallback para arquivo local (legado)
      const filePath = path.join(process.cwd(), 'uploads', 'exercises', exerciseId, filename);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const ext = path.extname(filename).toLowerCase();
        const mimeType = this.getMimeType(ext);
        const stream = fs.createReadStream(filePath);
        return { stream, stats: { size: stats.size }, mimeType };
      }

      this.logger.error(`Erro ao buscar mídia do S3 ou local: ${error.message}`);
      throw new NotFoundException('Arquivo de mídia não encontrado');
    }
  }

  private getMimeType(ext: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Salva um vídeo em buffer no S3 e retorna a URL
   */
  async saveVideoBuffer(
    buffer: Buffer,
    exerciseId: string,
  ): Promise<string> {
    const hash = crypto.randomBytes(8).toString('hex');
    const filename = `video-${hash}.mp4`;
    const key = `exercises/${exerciseId || 'temp'}/${filename}`;

    await this.s3Service.uploadBuffer(buffer, key, 'video/mp4');

    return `/exercises/media/stream/${exerciseId || 'temp'}/${filename}`;
  }

  /**
   * Salva uma imagem em buffer no S3 e retorna a URL
   */
  async saveImageBuffer(
    buffer: Buffer,
    exerciseId: string,
    imageIndex: number,
  ): Promise<string> {
    // Gerar nome único para a imagem
    const hash = crypto.randomBytes(8).toString('hex');
    const filename = `image-${imageIndex}-${hash}.png`;
    const key = `exercises/${exerciseId || 'temp'}/${filename}`;

    await this.s3Service.uploadBuffer(buffer, key, 'image/png');

    return `/exercises/media/stream/${exerciseId || 'temp'}/${filename}`;
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
      videoUrl: exercise.videoUrl,
      isActive: exercise.isActive,
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
    };
  }
}
