import { Module } from '@nestjs/common';
import { SimulacaoService } from './simulacao.service';
import { SimulacaoController } from './simulacao.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Simulacao, SimulacaoSchema } from './model/simulacao.schema';
import { SimulacaoRepository } from './repository/simulacao.repository';
import { QuestionModule } from '../question/question.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Simulacao.name, schema: SimulacaoSchema },
    ]),
    QuestionModule,
  ],
  providers: [SimulacaoService, SimulacaoRepository],
  controllers: [SimulacaoController],
})
export class SimulacaoModule {}
