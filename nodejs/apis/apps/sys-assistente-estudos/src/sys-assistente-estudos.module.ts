import { Module } from '@nestjs/common';
import { SysAssistenteEstudosController } from './sys-assistente-estudos.controller';
import { SysAssistenteEstudosService } from './sys-assistente-estudos.service';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { QuestionModule } from './question/question.module';
import { ConcursoModule } from './concurso/concurso.module';
import { SimulacaoModule } from './simulacao/simulacao.module';
import { EstatisticaModule } from './estatistica/estatistica.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({

  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Torna as variáveis de ambiente acessíveis globalmente
      // load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }), 
    QuestionModule,
    ConcursoModule,
    SimulacaoModule,
    EstatisticaModule,
  ],
  controllers: [SysAssistenteEstudosController],
  providers: [SysAssistenteEstudosService],
})
export class SysAssistenteEstudosModule {}
