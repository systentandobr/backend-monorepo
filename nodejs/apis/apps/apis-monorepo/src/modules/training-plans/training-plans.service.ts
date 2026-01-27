import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  TrainingPlan,
  TrainingPlanDocument,
} from './schemas/training-plan.schema';
import { CreateTrainingPlanDto } from './dto/create-training-plan.dto';
import { UpdateTrainingPlanDto } from './dto/update-training-plan.dto';
import { TrainingPlanResponseDto } from './dto/training-plan-response.dto';

@Injectable()
export class TrainingPlansService {
  private readonly logger = new Logger(TrainingPlansService.name);

  constructor(
    @InjectModel(TrainingPlan.name)
    private trainingPlanModel: Model<TrainingPlanDocument>,
  ) {}

  async create(
    createTrainingPlanDto: CreateTrainingPlanDto,
    unitId: string,
  ): Promise<TrainingPlanResponseDto> {
    // Processar exercícios: se vierem no nível raiz mas não dentro do weeklySchedule,
    // distribuir para o primeiro dia ou manter no nível raiz para compatibilidade
    const weeklySchedule = createTrainingPlanDto.weeklySchedule || [];
    const hasExercisesInSchedule = weeklySchedule.some(
      (day) => day.exercises && day.exercises.length > 0,
    );
    const hasExercisesAtRoot =
      createTrainingPlanDto.exercises &&
      createTrainingPlanDto.exercises.length > 0;

    // Função auxiliar para converter exerciseId de string para ObjectId se necessário
    const convertExerciseId = (exerciseId?: string): Types.ObjectId | undefined => {
      if (!exerciseId) return undefined;
      // Se já é um ObjectId válido (string de 24 caracteres hex), converter
      if (Types.ObjectId.isValid(exerciseId)) {
        return new Types.ObjectId(exerciseId);
      }
      return undefined;
    };

    // Processar exercícios convertendo exerciseId quando necessário
    const processExercises = (
      exercises?: CreateTrainingPlanDto['exercises'],
    ) => {
      if (!exercises) return undefined;
      return exercises.map((ex) => ({
        ...ex,
        exerciseId: convertExerciseId(ex.exerciseId),
      }));
    };

    // Processar exercícios convertendo exerciseId quando necessário
    let processedWeeklySchedule = weeklySchedule.map((day) => ({
      ...day,
      exercises: processExercises(day.exercises),
    }));
    let exercisesToKeep = processExercises(createTrainingPlanDto.exercises);

    // Se há exercícios no nível raiz mas não dentro do schedule
    if (hasExercisesAtRoot && !hasExercisesInSchedule) {
      if (processedWeeklySchedule.length > 0) {
        // Distribuir para o primeiro dia se houver schedule
        processedWeeklySchedule = processedWeeklySchedule.map((day, index) => ({
          ...day,
          exercises:
            index === 0
              ? [
                  ...(day.exercises || []),
                  ...(exercisesToKeep || []),
                ]
              : day.exercises,
        }));
        // Não manter no nível raiz se já distribuiu para o schedule
        exercisesToKeep = [];
      }
      // Se não houver schedule, manter exercícios no nível raiz (compatibilidade)
    } else if (hasExercisesInSchedule) {
      // Se há exercícios no schedule, limpar do nível raiz
      exercisesToKeep = [];
    }

    const trainingPlanData: any = {
      ...createTrainingPlanDto,
      unitId,
      weeklySchedule: processedWeeklySchedule,
      exercises: exercisesToKeep,
      startDate: new Date(createTrainingPlanDto.startDate),
      endDate: createTrainingPlanDto.endDate
        ? new Date(createTrainingPlanDto.endDate)
        : undefined,
      progress: {
        completedObjectives: [],
        lastUpdate: new Date(),
      },
    };

    // Se isTemplate não foi fornecido, definir como false
    // Se targetGender foi fornecido mas isTemplate não, assumir que é template
    if (
      createTrainingPlanDto.targetGender &&
      createTrainingPlanDto.isTemplate === undefined
    ) {
      trainingPlanData.isTemplate = true;
    } else if (createTrainingPlanDto.isTemplate !== undefined) {
      trainingPlanData.isTemplate = createTrainingPlanDto.isTemplate;
    } else {
      trainingPlanData.isTemplate = false;
    }

    const trainingPlan = new this.trainingPlanModel(trainingPlanData);
    const saved = await trainingPlan.save();
    return this.toResponseDto(saved);
  }

  async findAll(
    filters: { studentId?: string; status?: string },
    unitId: string,
  ): Promise<{
    data: TrainingPlanResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query: any = { unitId };

    if (filters.studentId) {
      query.studentId = filters.studentId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const [data, total] = await Promise.all([
      this.trainingPlanModel.find(query).sort({ createdAt: -1 }).exec(),
      this.trainingPlanModel.countDocuments(query).exec(),
    ]);

    return {
      data: data.map((item) => this.toResponseDto(item)),
      total,
      page: 1,
      limit: 50,
    };
  }

  async findOne(id: string, unitId: string): Promise<TrainingPlanResponseDto> {
    const trainingPlan = await this.trainingPlanModel
      .findOne({ _id: id, unitId })
      .exec();
    if (!trainingPlan) {
      throw new NotFoundException(
        `Plano de treino com ID ${id} não encontrado`,
      );
    }
    return this.toResponseDto(trainingPlan);
  }

  async update(
    id: string,
    updateTrainingPlanDto: UpdateTrainingPlanDto,
    unitId: string,
  ): Promise<TrainingPlanResponseDto> {
    // Função auxiliar para converter exerciseId de string para ObjectId se necessário
    const convertExerciseId = (exerciseId?: string): Types.ObjectId | undefined => {
      if (!exerciseId) return undefined;
      // Se já é um ObjectId válido (string de 24 caracteres hex), converter
      if (Types.ObjectId.isValid(exerciseId)) {
        return new Types.ObjectId(exerciseId);
      }
      return undefined;
    };

    // Processar exercícios convertendo exerciseId quando necessário
    const processExercises = (
      exercises?: UpdateTrainingPlanDto['exercises'],
    ) => {
      if (!exercises) return undefined;
      return exercises.map((ex) => ({
        ...ex,
        exerciseId: convertExerciseId(ex.exerciseId),
      }));
    };

    const updateData: any = { ...updateTrainingPlanDto };

    // Processar exercícios se weeklySchedule ou exercises foram fornecidos
    if (
      updateTrainingPlanDto.weeklySchedule !== undefined ||
      updateTrainingPlanDto.exercises !== undefined
    ) {
      const weeklySchedule = (updateTrainingPlanDto.weeklySchedule || []).map((day) => ({
        ...day,
        exercises: processExercises(day.exercises),
      }));
      const hasExercisesInSchedule = weeklySchedule.some(
        (day) => day.exercises && day.exercises.length > 0,
      );
      const hasExercisesAtRoot =
        updateTrainingPlanDto.exercises &&
        updateTrainingPlanDto.exercises.length > 0;

      // Se há exercícios no nível raiz mas não dentro do schedule
      if (hasExercisesAtRoot && !hasExercisesInSchedule) {
        if (weeklySchedule.length > 0) {
          // Distribuir para o primeiro dia se houver schedule
          updateData.weeklySchedule = weeklySchedule.map((day, index) => ({
            ...day,
            exercises: index === 0 ? processExercises(updateTrainingPlanDto.exercises) || [] : [],
          }));
          // Remover exercícios do nível raiz se já distribuiu para o schedule
          delete updateData.exercises;
        } else {
          // Se não houver schedule, manter exercícios no nível raiz (compatibilidade)
          updateData.exercises = processExercises(updateTrainingPlanDto.exercises);
        }
      } else if (hasExercisesInSchedule) {
        // Se há exercícios no schedule, remover do nível raiz
        updateData.weeklySchedule = weeklySchedule;
        delete updateData.exercises;
      } else if (weeklySchedule.length > 0) {
        // Se há schedule sem exercícios, usar o schedule fornecido
        updateData.weeklySchedule = weeklySchedule;
      }
      // Se não há schedule nem exercícios no nível raiz, manter como está
    }

    if (updateTrainingPlanDto.startDate) {
      updateData.startDate = new Date(updateTrainingPlanDto.startDate);
    }
    if (updateTrainingPlanDto.endDate) {
      updateData.endDate = new Date(updateTrainingPlanDto.endDate);
    }

    const trainingPlan = await this.trainingPlanModel
      .findOneAndUpdate(
        { _id: id, unitId },
        { $set: updateData },
        { new: true },
      )
      .exec();

    if (!trainingPlan) {
      throw new NotFoundException(
        `Plano de treino com ID ${id} não encontrado`,
      );
    }

    return this.toResponseDto(trainingPlan);
  }

  async updateObjectives(
    id: string,
    objectives: string[],
    unitId: string,
  ): Promise<TrainingPlanResponseDto> {
    const trainingPlan = await this.trainingPlanModel
      .findOne({ _id: id, unitId })
      .exec();
    if (!trainingPlan) {
      throw new NotFoundException(
        `Plano de treino com ID ${id} não encontrado`,
      );
    }

    trainingPlan.progress = trainingPlan.progress || {
      completedObjectives: [],
      lastUpdate: new Date(),
    };
    trainingPlan.progress.completedObjectives = objectives;
    trainingPlan.progress.lastUpdate = new Date();

    const saved = await trainingPlan.save();
    return this.toResponseDto(saved);
  }

  async remove(id: string, unitId: string): Promise<void> {
    const result = await this.trainingPlanModel
      .deleteOne({ _id: id, unitId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `Plano de treino com ID ${id} não encontrado`,
      );
    }
  }

  async findTemplates(
    filters: { gender?: string },
    unitId: string,
  ): Promise<TrainingPlanResponseDto[]> {
    const query: any = {
      unitId,
      isTemplate: true,
    };

    if (filters.gender) {
      query.targetGender = filters.gender;
    }

    const templates = await this.trainingPlanModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();

    return templates.map((item) => this.toResponseDto(item));
  }

  private toResponseDto(
    trainingPlan: TrainingPlanDocument,
  ): TrainingPlanResponseDto {
    // Converter exerciseId de ObjectId para string nos exercícios do weeklySchedule
    const weeklySchedule = (trainingPlan.weeklySchedule || []).map((day) => ({
      dayOfWeek: day.dayOfWeek,
      timeSlots: day.timeSlots || [],
      exercises: (day.exercises || []).map((ex) => ({
        exerciseId: ex.exerciseId
          ? typeof ex.exerciseId === 'string'
            ? ex.exerciseId
            : ex.exerciseId.toString()
          : undefined,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        restTime: ex.restTime,
        notes: ex.notes,
      })),
    }));

    // Converter exerciseId de ObjectId para string nos exercícios do nível raiz
    const exercises = (trainingPlan.exercises || []).map((ex) => ({
      exerciseId: ex.exerciseId
        ? typeof ex.exerciseId === 'string'
          ? ex.exerciseId
          : ex.exerciseId.toString()
        : undefined,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      restTime: ex.restTime,
      notes: ex.notes,
    }));

    return {
      id: trainingPlan._id.toString(),
      unitId: trainingPlan.unitId,
      studentId: trainingPlan.studentId.toString(),
      name: trainingPlan.name,
      description: trainingPlan.description,
      objectives: trainingPlan.objectives,
      weeklySchedule,
      exercises,
      startDate: trainingPlan.startDate,
      endDate: trainingPlan.endDate,
      status: trainingPlan.status,
      progress: trainingPlan.progress,
      isTemplate: trainingPlan.isTemplate,
      targetGender: trainingPlan.targetGender,
      templateId: trainingPlan.templateId?.toString(),
      createdAt: trainingPlan.createdAt,
      updatedAt: trainingPlan.updatedAt,
    };
  }
}
