import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Estatistica } from '../model/estatistica.schema';
import { EstatisticaDto } from '../model/estatistica.dto';
import { adapterQuestion } from '../../question/model/question.dto';

@Injectable()
export class EstatisticaRepository {
  constructor(
    @InjectModel(Estatistica.name)
    private EstatisticaModel: Model<Estatistica>,
  ) {}

  async create(data: Partial<EstatisticaDto>): Promise<Estatistica> {
    const createdEstatistica = new this.EstatisticaModel({
      userId: data.userId,
      concursoId: data.concursoId,
      simulacaoId: data.simulacaoId,
      simulacaoName: data.simulacaoName,
      question: adapterQuestion(data.question),
      dateTime: Date.now(),
    });
    return createdEstatistica.save();
  }

  async update(
    id: string,
    createEstatisticaDto: Partial<EstatisticaDto>,
  ): Promise<Estatistica> {
    const createdEstatistica = await this.EstatisticaModel.findByIdAndUpdate(
      id,
      createEstatisticaDto,
      { new: true },
    );
    return createdEstatistica;
  }

  async findByConcursoId(concursoId: string): Promise<Estatistica[]> {
    return this.EstatisticaModel.find({
      concursoId,
    }).exec();
  }

  async findByConcursoESimulacaoId(
    concursoId: string,
    simulacaoId: string,
  ): Promise<Estatistica[]> {
    return this.EstatisticaModel.find({
      concursoId,
      $or: [{ simulacaoId }],
    }).exec();
  }

  async findByUserId(userId: string): Promise<Estatistica[]> {
    return this.EstatisticaModel.find({ userId }).exec();
  }

  async findById(id: string): Promise<Estatistica> {
    return this.EstatisticaModel.findById(id).exec();
  }

  async deleteAll(): Promise<void> {
    await this.EstatisticaModel.deleteMany({});
  }
}
