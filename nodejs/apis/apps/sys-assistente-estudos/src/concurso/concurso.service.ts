import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Concurso } from './model/concurso.schema';

@Injectable()
export class ConcursoService {
  constructor(
    @InjectModel(Concurso.name) private concursoModel: Model<Concurso>,
  ) {}

  async create(createConcursoDto: any): Promise<Concurso> {
    const createdConcurso = new this.concursoModel(createConcursoDto);
    return createdConcurso.save();
  }

  async findAll(): Promise<Concurso[]> {
    return this.concursoModel.find().exec();
  }

  async findById(id: string): Promise<Concurso> {
    return this.concursoModel.findById(id).exec();
  }

  async deleteAll(): Promise<void> {
    await this.concursoModel.deleteMany({});
  }
}
