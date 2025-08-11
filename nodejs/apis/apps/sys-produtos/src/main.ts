import { NestFactory } from '@nestjs/core';
import { SysProdutosModule } from './sys-produtos.module';

async function bootstrap() {
  const app = await NestFactory.create(SysProdutosModule);
  await app.listen(3000);
}
bootstrap();
