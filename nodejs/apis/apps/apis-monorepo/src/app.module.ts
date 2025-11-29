import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DebugController } from './debug.controller';
import { SysAssistenteEstudosModule } from 'apps/sys-assistente-estudos/src/sys-assistente-estudos.module';
import { SysPagamentosModule } from 'apps/sys-pagamentos/src/sys-pagamentos.module';
import { SysProdutosModule } from 'apps/sys-produtos/src/sys-produtos.module';
import { LifeTrackerModule } from 'apps/life-tracker/src/life-tracker.module';
import { AuthSharedModule } from './auth/auth-shared.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { FranchisesModule } from './modules/franchises/franchises.module';
import { LeadsModule } from './modules/leads/leads.module';
import { NotificationsModule } from 'apps/notifications/src/notifications.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    HttpModule,
    AuthSharedModule,
    SysAssistenteEstudosModule,
    SysPagamentosModule,
    SysProdutosModule,
    LifeTrackerModule,
    CustomersModule,
    OrdersModule,
    FranchisesModule,
    LeadsModule,
    NotificationsModule,
    UsersModule,
  ],
  controllers: [AppController, DebugController],
  providers: [AppService],
})
export class AppModule {}
