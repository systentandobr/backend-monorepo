import { NestFactory } from '@nestjs/core';
import { SysPagamentosModule } from './sys-pagamentos.module';

async function bootstrap() {
  const app = await NestFactory.create(SysPagamentosModule);
  await app.listen(3000);
}
bootstrap();
