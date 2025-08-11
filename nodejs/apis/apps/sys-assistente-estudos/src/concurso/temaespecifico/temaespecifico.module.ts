import { Module } from '@nestjs/common';
import { TemaespecificoService } from './temaespecifico.service';
import { TemaespecificoController } from './temaespecifico.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TemaEspecifico, TemaEspecificoSchema } from './model/temaEspecifico.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TemaEspecifico.name, schema: TemaEspecificoSchema },
    ]),
  ],
  providers: [TemaespecificoService],
  controllers: [TemaespecificoController]
})
export class TemaespecificoModule { }
