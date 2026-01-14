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
import { ReferralCampaignsModule } from './modules/referral-campaigns/referral-campaigns.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { TaskTemplatesModule } from './modules/task-templates/task-templates.module';
import { FranchiseTasksModule } from './modules/franchise-tasks/franchise-tasks.module';
import { TrainingsModule } from './modules/trainings/trainings.module';
import { RagInstructionsModule } from './modules/rag-instructions/rag-instructions.module';
import { SettingsModule } from './modules/settings/settings.module';
import { StudentsModule } from './modules/students/students.module';
import { TrainingPlansModule } from './modules/training-plans/training-plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ExercisesModule } from './modules/exercises/exercises.module';



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
    ReferralCampaignsModule,
    ReferralsModule,
    RewardsModule,
    TaskTemplatesModule,
    FranchiseTasksModule,
    TrainingsModule,
    RagInstructionsModule,
    SettingsModule,
    StudentsModule,
    TrainingPlansModule,
    SubscriptionsModule,
    ExercisesModule,
  ],
  controllers: [AppController, DebugController],
  providers: [AppService],
})
export class AppModule { }
