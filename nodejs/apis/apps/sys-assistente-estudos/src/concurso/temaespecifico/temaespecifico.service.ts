import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { TemaEspecifico } from './model/temaEspecifico.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TemaespecificoService {
  constructor(
    @InjectModel(TemaEspecifico.name) private temaEspecificoModel: Model<TemaEspecifico>,
  ) { }

  async create(data: TemaEspecifico): Promise<TemaEspecifico> {
    const createTemaEspecificoDto = new this.temaEspecificoModel({
      concursoId: new Types.ObjectId(data.concursoId),
      descricao: data.descricao,
      createdAt: data.createdAt ?? new Date(),
      updatedAt: undefined,

    });
    const createdTemaEspecifico = new this.temaEspecificoModel(createTemaEspecificoDto);
    return createdTemaEspecifico.save();
  }

  async findByTemaEspecificoUserId(
    concursoId: string,
    userId: string,
    filterOpenQuestions = false
  ): Promise<TemaEspecifico[]> {
    try {
      // const userObjectId = new Types.ObjectId(userId);
      const concursoObjectId = new Types.ObjectId(concursoId);
      return await this.temaEspecificoModel
        .find({
          // userId: userObjectId,
          concursoId: concursoObjectId,
        })
        .exec();
    } catch (error) {
      console.error('Error in findByTemaEspecificoUserId:', error);
      throw error;
    }
  }

  async findAll(): Promise<TemaEspecifico[]> {
    return this.temaEspecificoModel.find().exec();
  }

  async findById(id: string): Promise<TemaEspecifico> {
    return this.temaEspecificoModel.findById(id).exec();
  }

  async deleteAll(): Promise<void> {
    await this.temaEspecificoModel.deleteMany({});
  }
}

