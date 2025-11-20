import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DebugController } from './debug.controller';
import { SysAssistenteEstudosModule } from 'apps/sys-assistente-estudos/src/sys-assistente-estudos.module';
import { SysPagamentosModule } from 'apps/sys-pagamentos/src/sys-pagamentos.module';
import { SysProdutosModule } from 'apps/sys-produtos/src/sys-produtos.module';
import { LifeTrackerModule } from 'apps/life-tracker/src/life-tracker.module';
import { JwtValidatorService } from './services/jwt-validator.service';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { FranchisesModule } from './modules/franchises/franchises.module';
import { LeadsModule } from './modules/leads/leads.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/viralkids'),
    SysAssistenteEstudosModule,
    SysPagamentosModule,
    SysProdutosModule,
    LifeTrackerModule,
    CustomersModule,
    OrdersModule,
    FranchisesModule,
    LeadsModule,
    NotificationsModule,
  ],
  controllers: [AppController, DebugController],
  providers: [AppService, JwtValidatorService],
})
export class AppModule {}
