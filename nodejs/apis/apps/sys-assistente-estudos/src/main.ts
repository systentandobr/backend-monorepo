import { NestFactory } from '@nestjs/core';
import { SysAssistenteEstudosModule } from './sys-assistente-estudos.module';

async function bootstrap() {
  const app = await NestFactory.create(SysAssistenteEstudosModule);
  await app.listen(3000);
}
bootstrap();
