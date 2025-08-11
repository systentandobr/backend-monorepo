import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { IAutenticacaoDto } from '../interfaces/IAutenticacaoDto';

export type AutenticacaoDocument = mongoose.HydratedDocument<Autenticacao>;
@Schema()
export class Autenticacao implements IAutenticacaoDto {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  id?: number;

  @Prop()
  nome?: string;

  @Prop({ required: true })
  apelido: string = '';

  @Prop({ required: true })
  senha: string = '';

  @Prop()
  cadastroDesativado?: boolean = false;

  @Prop()
  acessoPermitido: boolean = true;

  @Prop()
  dataCadastro?: Date;
  @Prop()
  dataAtualizacao?: Date;

  @Prop()
  dataExclusao?: Date;
}

export const AutenticacaoSchema = SchemaFactory.createForClass(Autenticacao);
