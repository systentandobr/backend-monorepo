import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { IPerfisDeUsuario } from '../interfaces/IPerfilsDeUsuario';

export type PerfisDeUsuarioDocument =
  mongoose.HydratedDocument<PerfisDeUsuario>;
@Schema()
export class PerfisDeUsuario implements IPerfisDeUsuario {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  id?: number;

  @Prop()
  nome: string = '';

  @Prop()
  cadastroDesativado: boolean = false;

  @Prop()
  dataCadastro?: Date;
  @Prop()
  dataAtualizacao?: Date;

  @Prop()
  dataExclusao?: Date;
}

export const PerfisDeUsuarioSchema =
  SchemaFactory.createForClass(PerfisDeUsuario);
