import { NestFactory } from '@nestjs/core';
import { SysSegurancaModule } from './sys-seguranca.module';

async function bootstrap() {
  const app = await NestFactory.create(SysSegurancaModule);
  await app.listen(3000);
}
bootstrap();
