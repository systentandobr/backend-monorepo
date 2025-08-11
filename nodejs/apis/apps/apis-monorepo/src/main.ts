import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';
import { clc } from '@nestjs/common/utils/cli-colors.util';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // BEGIN SWAGGER CONFIG ---------------------------------------
  const packageFile = resolve(__dirname, '../../..', 'package.json');
  const pkg = JSON.parse(readFileSync(packageFile).toString());
  const config = new DocumentBuilder()
    .setTitle(`${String(pkg.name).toUpperCase()} documentation`)
    .setDescription(pkg.description)
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);
  //END SWAGGER CONFIG ------------------------------------
  const logger = new ConsoleLogger();
  const port = process.env.PORT || 3000;
  logger.log(
    `${clc.magentaBright('🚀')} ${clc.green(
      'Application ready on port',
    )} ${clc.yellow(port.toString())}${clc.green('')}`,
  );

  await app.listen(port);
}
bootstrap();
