import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exercise, ExerciseDocument } from './schemas/exercise.schema';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseResponseDto } from './dto/exercise-response.dto';

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
      isActive: exercise.isActive,
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
    };
  }
}
