import { Injectable } from '@nestjs/common';
import { IRepository } from '../../../@main/repositories/IRepository';
import { PerfisDeUsuario } from '../data/schemas/PerfilsDeUsuarioSchema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPerfisDeUsuario } from '../data/interfaces/IPerfilsDeUsuario';

@Injectable()
export class PerfisDeUsuarioRepository implements IRepository<PerfisDeUsuario> {
  constructor(
    @InjectModel(PerfisDeUsuario.name)
    private usuarioModel: Model<PerfisDeUsuario>,
  ) {}

  async validaJaExisteCadastro(nome: string): Promise<IPerfisDeUsuario | null> {
    return this.usuarioModel.findOne({ nome }).exec();
  }
  async cadastrar(a: PerfisDeUsuario): Promise<IPerfisDeUsuario> {
    const usuarioCriado = new this.usuarioModel(a);
    return usuarioCriado.save();
  }
  async listar(): Promise<IPerfisDeUsuario[]> {
    return this.usuarioModel.find().exec();
  }
  async atualizar(b: PerfisDeUsuario): Promise<IPerfisDeUsuario> {
    return new this.usuarioModel(b).updateOne();
  }
  async remover(c: PerfisDeUsuario): Promise<void> {
    new this.usuarioModel(c).deleteOne();
  }
}
