import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SysSegurancaModule } from 'apps/sys-seguranca/src/sys-seguranca.module';
import { SysAssistenteEstudosModule } from 'apps/sys-assistente-estudos/src/sys-assistente-estudos.module';
import { SysPagamentosModule } from 'apps/sys-pagamentos/src/sys-pagamentos.module';
import { SysProdutosModule } from 'apps/sys-produtos/src/sys-produtos.module';

@Module({
  imports: [
    SysSegurancaModule,
    SysAssistenteEstudosModule,
    SysPagamentosModule,
    SysProdutosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
