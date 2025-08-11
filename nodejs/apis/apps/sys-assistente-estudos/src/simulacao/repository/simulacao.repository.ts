import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Simulacao } from '../model/simulacao.schema';

@Injectable()
export class SimulacaoRepository {
  constructor(
    @InjectModel(Simulacao.name) private simulacaoModel: Model<Simulacao>,
  ) { }

  async create(data: Simulacao): Promise<Simulacao> {
    const createSimulacaoDto = new this.simulacaoModel({
      userId: new Types.ObjectId(data.userId),
      temaEspecificoId: new Types.ObjectId(data.temaEspecificoId),
      name: data.name,
      questionIds:
        data.questionIds?.map((id: string) => new Types.ObjectId(id)) ?? [],
      startTime: data.startTime ?? new Date(),
      endTime: data.endTime ?? null,
      questionTimes: data.questionTimes ?? [],
      questionDifficulties: data.questionDifficulties ?? [],
      questionResults: data.questionResults ?? [],
      correctAnswers: data.correctAnswers ?? 0,
      totalAnswers: data.totalAnswers ?? 0,
    });
    const createdSimulacao = new this.simulacaoModel(createSimulacaoDto);
    return createdSimulacao.save();
  }

  async update(id: string, data: Simulacao): Promise<Simulacao> {
    const updateSimulacaoDto = new this.simulacaoModel({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(data.userId),
      temaEspecificoId: new Types.ObjectId(data.temaEspecificoId),
      name: data.name,
      questionIds:
        data.questionIds?.map((id: string) => new Types.ObjectId(id)) ?? [],
      startTime: data.startTime ?? new Date(),
      endTime: data.endTime ?? null,
      questionTimes: data.questionTimes ?? [],
      questionDifficulties: data.questionDifficulties ?? [],
      questionResults: data.questionResults ?? [],
      correctAnswers: data.correctAnswers ?? 0,
      totalAnswers: data.totalAnswers ?? 0,
    });
    const updatedSimulacao = new this.simulacaoModel(updateSimulacaoDto);
    return this.simulacaoModel
      .findByIdAndUpdate(id, updatedSimulacao, { new: true })
      .exec();
  }

  async findByTemaEspecificoUserId(
    temaEspecificoId: string,
    userId: string,
  ): Promise<Simulacao[]> {
    try {
      const userObjectId = new Types.ObjectId(userId);
      const temaEspecificoObjectId = new Types.ObjectId(temaEspecificoId);
      return await this.simulacaoModel
        .find({
          userId: userObjectId,
          temaEspecificoId: temaEspecificoObjectId,
        })
        .exec();
    } catch (error) {
      console.error('Error in findByTemaEspecificoUserId:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Simulacao> {
    return this.simulacaoModel.findById(id).exec();
  }

  async deleteAll(): Promise<void> {
    await this.simulacaoModel.deleteMany({});
  }
}
