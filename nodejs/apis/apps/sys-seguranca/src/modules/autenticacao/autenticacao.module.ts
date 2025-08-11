import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutenticacaoController } from './controllers/autenticacao.controller';
import { AutenticacaoService } from './services/autenticacao.service';
import { AutenticacaoRepository } from './autenticacao.repository';
import {
  Autenticacao,
  AutenticacaoSchema,
} from './data/schemas/AutenticacaoSchema';
import { JwtModule } from '@nestjs/jwt';
import { AutenticacaoDomain } from './domains/autenticacao.domain';
import { jwtConstants } from '@lib/utils/contantes/Contants';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    MongooseModule.forFeature([
      { name: Autenticacao.name, schema: AutenticacaoSchema },
    ]),
  ],
  controllers: [AutenticacaoController],
  providers: [AutenticacaoService, AutenticacaoRepository, AutenticacaoDomain],
})
export class AutenticacaoModule { }
