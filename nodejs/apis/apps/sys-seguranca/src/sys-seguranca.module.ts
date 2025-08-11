import { Module } from '@nestjs/common';
import { SysSegurancaController } from './sys-seguranca.controller';
import { SysSegurancaService } from './sys-seguranca.service';
import { AutenticacaoModule } from './modules/autenticacao/autenticacao.module';
import { EmailServiceService } from './modules/notifications/email-service/email-service.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PerfisDeUsuarioModule } from './modules/perfis-de-usuario/perfis-de-usuario.module';

@Module({
  imports: [
    AutenticacaoModule,
    ConfigModule.forRoot({ envFilePath: `.env` }),
    MongooseModule.forRoot(
      `mongodb+srv://${encodeURIComponent(
        process.env.USER_DB as string,
      )}:${encodeURIComponent(process.env.PASS_DB as string)}@${process.env.HOST_DB
      }/`,
    ),
    PerfisDeUsuarioModule,
  ],


  controllers: [SysSegurancaController],
  providers: [SysSegurancaService, EmailServiceService],
})
export class SysSegurancaModule { }
