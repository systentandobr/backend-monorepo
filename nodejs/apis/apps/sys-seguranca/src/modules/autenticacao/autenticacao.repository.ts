import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { IRepository } from '../../@main/repositories/IRepository';
import { IAutenticacaoDto } from './data/interfaces/IAutenticacaoDto';
import { Autenticacao } from './data/schemas/AutenticacaoSchema';

@Injectable()
export class AutenticacaoRepository implements IRepository<Autenticacao> {
  constructor(
    @InjectModel(Autenticacao.name) private usuarioModel: Model<Autenticacao>,
  ) {}
  async cadastrar(a: Autenticacao): Promise<IAutenticacaoDto> {
    const usuarioCriado = new this.usuarioModel(a);
    return usuarioCriado.save();
  }
  async listar(): Promise<IAutenticacaoDto[]> {
    return this.usuarioModel.find().exec();
  }
  async atualizar(b: Autenticacao): Promise<IAutenticacaoDto> {
    return new this.usuarioModel(b).updateOne();
  }
  async remover(c: Autenticacao): Promise<void> {
    // TODO new this.usuarioModel(c).deleteOne(); this is not working
    // how to fix it?
    new this.usuarioModel(c).deleteOne();
  }

  async encontrarApelido(apelido: string): Promise<IAutenticacaoDto | null> {
    return this.usuarioModel.findOne({ apelido }).exec();
  }

  async findById(id: number): Promise<IAutenticacaoDto | null> {
    return this.usuarioModel.findOne({ _id: id }).exec();
  }
}
