import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  TrainingExecution,
  TrainingExecutionDocument,
} from './schemas/training-execution.schema';
import { CreateTrainingExecutionDto } from './dto/create-training-execution.dto';
import {
  UpdateExerciseExecutionDto,
  CompleteTrainingExecutionDto,
} from './dto/update-training-execution.dto';
import { TrainingExecutionResponseDto } from './dto/training-execution-response.dto';
import { GamificationService } from '../gamification/gamification.service';
import { TrainingPlansService } from '../training-plans/training-plans.service';

@Injectable()
export class TrainingExecutionsService {
  private readonly logger = new Logger(TrainingExecutionsService.name);

  constructor(
    @InjectModel(TrainingExecution.name)
    private trainingExecutionModel: Model<TrainingExecutionDocument>,
    @Inject(forwardRef(() => GamificationService))
    private gamificationService: GamificationService,
    @Inject(forwardRef(() => TrainingPlansService))
    private trainingPlansService: TrainingPlansService,
  ) { }

  /**
   * Cria uma nova execução de treino
   */
  async create(
    createDto: CreateTrainingExecutionDto,
  ): Promise<TrainingExecutionResponseDto> {
    // Verificar se já existe uma execução em progresso para este usuário/unidade
    const activeExecution = await this.trainingExecutionModel
      .findOne({
        userId: createDto.userId,
        unitId: createDto.unitId,
        status: 'in_progress',
      })
      .exec();

    if (activeExecution) {
      throw new BadRequestException(
        'Já existe uma execução de treino em progresso. Finalize a execução atual antes de iniciar uma nova.',
      );
    }

    const trainingExecution = new this.trainingExecutionModel({
      trainingPlanId: new Types.ObjectId(createDto.trainingPlanId),
      userId: createDto.userId,
      unitId: createDto.unitId,
      startedAt: new Date(),
      status: 'in_progress',
      exercises: [],
      metadata: createDto.metadata,
    });

    const saved = await trainingExecution.save();
    return this.toResponseDto(saved);
  }

  /**
   * Atualiza a execução de um exercício específico
   */
  async updateExerciseExecution(
    id: string,
    exerciseId: string,
    updateDto: UpdateExerciseExecutionDto,
    userId: string,
    unitId: string,
  ): Promise<TrainingExecutionResponseDto> {
    const trainingExecution = await this.trainingExecutionModel
      .findOne({ _id: id, userId, unitId })
      .exec();

    if (!trainingExecution) {
      throw new NotFoundException(
        `Execução de treino com ID ${id} não encontrada`,
      );
    }

    if (trainingExecution.status !== 'in_progress') {
      throw new BadRequestException(
        'Apenas execuções em progresso podem ser atualizadas',
      );
    }

    // Encontrar ou criar exercício na lista
    let exerciseIndex = trainingExecution.exercises.findIndex(
      (ex) => ex.exerciseId === exerciseId || ex.name === exerciseId,
    );

    const executedSets = updateDto.executedSets.map((set) => ({
      setNumber: set.setNumber,
      plannedReps: set.plannedReps,
      executedReps: set.executedReps,
      plannedWeight: set.plannedWeight,
      executedWeight: set.executedWeight,
      completed: set.completed ?? false,
      timestamp: set.timestamp || new Date().toISOString(),
      durationSeconds: set.durationSeconds,
      restDurationSeconds: set.restDurationSeconds,
    }));

    if (exerciseIndex >= 0) {
      // Atualizar exercício existente
      trainingExecution.exercises[exerciseIndex].executedSets = executedSets;
    } else {
      // Criar novo exercício - buscar nome do TrainingPlan
      let exerciseName = exerciseId;
      try {
        const plan = await this.trainingPlansService.findOne(
          trainingExecution.trainingPlanId.toString(),
          trainingExecution.unitId,
        );
        // Procurar exercício no plano para obter o nome
        const planExercise = [
          ...(plan.weeklySchedule?.flatMap((d) => d.exercises || []) || []),
          ...(plan.exercises || []),
        ].find(
          (ex) => ex.exerciseId === exerciseId || ex.name === exerciseId,
        );
        if (planExercise) {
          exerciseName = planExercise.name;
        }
      } catch (error) {
        this.logger.warn(
          `Erro ao buscar nome do exercício do plano: ${error}`,
        );
      }

      trainingExecution.exercises.push({
        exerciseId,
        name: exerciseName,
        executedSets,
      });
    }

    const saved = await trainingExecution.save();

    // Verificar se todas as séries do exercício estão completas
    const exercise = trainingExecution.exercises[exerciseIndex >= 0 ? exerciseIndex : trainingExecution.exercises.length - 1];
    const allSetsCompleted = exercise.executedSets.every(
      (set) => set.completed === true,
    ) && exercise.executedSets.length > 0;

    // Se todas as séries estão completas, criar PointTransaction com EXERCISE_COMPLETION
    if (allSetsCompleted) {
      await this.gamificationService.createExerciseCompletion(
        trainingExecution.userId,
        trainingExecution.unitId,
        trainingExecution.trainingPlanId.toString(),
        exerciseId,
      );

      // Verificar se todos os exercícios do treino estão completos
      // Buscar o plano para saber quantos exercícios são esperados
      try {
        const plan = await this.trainingPlansService.findOne(
          trainingExecution.trainingPlanId.toString(),
          trainingExecution.unitId,
        );
        const currentDayOfWeek = new Date().getDay();
        const daySchedule = plan.weeklySchedule?.find(
          (d) => d.dayOfWeek === currentDayOfWeek,
        );

        const expectedExercises = daySchedule?.exercises || plan.exercises || [];
        const allExercisesCompleted = expectedExercises.every((expectedEx) => {
          const executedEx = saved.exercises.find(
            (ex) => ex.exerciseId === expectedEx.exerciseId || ex.name === expectedEx.name,
          );
          if (!executedEx || executedEx.executedSets.length === 0) {
            return false;
          }
          return executedEx.executedSets.every((set) => set.completed === true);
        });

        if (allExercisesCompleted && expectedExercises.length > 0) {
          // Criar PointTransaction com WORKOUT_COMPLETION
          await this.gamificationService.createWorkoutCompletion(
            trainingExecution.userId,
            trainingExecution.unitId,
            trainingExecution.trainingPlanId.toString(),
          );
        }
      } catch (error) {
        this.logger.warn(
          `Erro ao verificar conclusão do treino: ${error}`,
        );
      }
    }

    return this.toResponseDto(saved);
  }

  /**
   * Finaliza uma execução de treino
   */
  async complete(
    id: string,
    completeDto: CompleteTrainingExecutionDto,
    userId: string,
    unitId: string,
  ): Promise<TrainingExecutionResponseDto> {
    const trainingExecution = await this.trainingExecutionModel
      .findOne({ _id: id, userId, unitId })
      .exec();

    if (!trainingExecution) {
      throw new NotFoundException(
        `Execução de treino com ID ${id} não encontrada`,
      );
    }

    if (trainingExecution.status === 'completed') {
      throw new BadRequestException('Execução de treino já foi finalizada');
    }

    trainingExecution.status = 'completed';
    trainingExecution.completedAt = new Date();
    if (completeDto.totalDurationSeconds !== undefined) {
      trainingExecution.totalDurationSeconds = completeDto.totalDurationSeconds;
    } else {
      // Calcular duração se não fornecida
      const durationMs =
        trainingExecution.completedAt.getTime() -
        trainingExecution.startedAt.getTime();
      trainingExecution.totalDurationSeconds = Math.floor(durationMs / 1000);
    }

    const saved = await trainingExecution.save();

    // Criar WORKOUT_COMPLETION se ainda não foi criado
    try {
      await this.gamificationService.createWorkoutCompletion(
        trainingExecution.userId,
        trainingExecution.unitId,
        trainingExecution.trainingPlanId.toString(),
      );
    } catch (error) {
      // Se já existe, não é erro crítico
      this.logger.warn(
        `Erro ao criar WORKOUT_COMPLETION (pode já existir): ${error}`,
      );
    }

    return this.toResponseDto(saved);
  }

  /**
   * Busca execução ativa do usuário
   */
  async getActive(
    userId: string,
    unitId: string,
  ): Promise<TrainingExecutionResponseDto | null> {
    const trainingExecution = await this.trainingExecutionModel
      .findOne({
        userId,
        unitId,
        status: 'in_progress',
      })
      .sort({ startedAt: -1 })
      .exec();

    if (!trainingExecution) {
      return null;
    }

    return this.toResponseDto(trainingExecution);
  }

  /**
   * Busca histórico de execuções de um plano
   */
  async getByPlan(
    planId: string,
    userId?: string,
  ): Promise<TrainingExecutionResponseDto[]> {
    const query: any = {
      trainingPlanId: new Types.ObjectId(planId),
    };

    if (userId) {
      query.userId = userId;
    }

    const executions = await this.trainingExecutionModel
      .find(query)
      .sort({ startedAt: -1 })
      .exec();

    return executions.map((exec) => this.toResponseDto(exec));
  }

  /**
   * Busca execução por ID
   */
  async findOne(
    id: string,
    userId?: string,
    unitId?: string,
  ): Promise<TrainingExecutionResponseDto> {
    const query: any = { _id: id };

    if (userId) {
      query.userId = userId;
    }

    if (unitId) {
      query.unitId = unitId;
    }

    const trainingExecution = await this.trainingExecutionModel
      .findOne(query)
      .exec();

    if (!trainingExecution) {
      throw new NotFoundException(
        `Execução de treino com ID ${id} não encontrada`,
      );
    }

    return this.toResponseDto(trainingExecution);
  }

  /**
   * Converte documento para DTO
   */
  private toResponseDto(
    trainingExecution: TrainingExecutionDocument,
  ): TrainingExecutionResponseDto {
    return {
      id: trainingExecution._id.toString(),
      trainingPlanId:
        typeof trainingExecution.trainingPlanId === 'string'
          ? trainingExecution.trainingPlanId
          : trainingExecution.trainingPlanId.toString(),
      userId: trainingExecution.userId,
      unitId: trainingExecution.unitId,
      startedAt: trainingExecution.startedAt,
      completedAt: trainingExecution.completedAt,
      status: trainingExecution.status,
      exercises: trainingExecution.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        executedSets: ex.executedSets.map((set) => ({
          setNumber: set.setNumber,
          plannedReps: set.plannedReps,
          executedReps: set.executedReps,
          plannedWeight: set.plannedWeight,
          executedWeight: set.executedWeight,
          completed: set.completed,
          timestamp: set.timestamp,
          durationSeconds: set.durationSeconds,
          restDurationSeconds: set.restDurationSeconds,
        })),
      })),
      totalDurationSeconds: trainingExecution.totalDurationSeconds,
      metadata: trainingExecution.metadata,
      createdAt: trainingExecution.createdAt,
      updatedAt: trainingExecution.updatedAt,
    };
  }
}
