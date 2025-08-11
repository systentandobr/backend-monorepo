import { InjectModel } from '@nestjs/mongoose';
import { IRepository } from '../../../@main/repositories/IRepository';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Autenticacao } from '../data/schemas/AutenticacaoSchema';
import { IAutenticacaoDto } from '../data/interfaces/IAutenticacaoDto';

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
    new this.usuarioModel(c).deleteOne();
  }
  async findByEmail(email: string): Promise<IAutenticacaoDto | null> {
    return this.usuarioModel.findOne({ email }).exec();
  }
}
