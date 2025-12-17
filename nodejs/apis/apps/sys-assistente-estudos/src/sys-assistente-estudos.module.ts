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
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (uri) return { uri };

        const user = configService.get<string>('USER_DB');
        const pass = configService.get<string>('PASS_DB');
        const host = configService.get<string>('HOST_DB');

        if (user && pass && host) {
          return {
            uri: `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(
              pass,
            )}@${host}/sys-assistente-estudos`,
          };
        }

        return {
          uri: 'mongodb://127.0.0.1:27017/sys-assistente-estudos',
        };
      },
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
export class SysAssistenteEstudosModule { }
