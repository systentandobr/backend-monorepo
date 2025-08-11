import { Module } from '@nestjs/common';
import { ConcursoService } from './concurso.service';
import { ConcursoController } from './concurso.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Concurso, ConcursoSchema } from './model/concurso.schema';
import { TemaespecificoModule } from './temaespecifico/temaespecifico.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Concurso.name, schema: ConcursoSchema },
    ]),
    TemaespecificoModule,
  ],
  providers: [ConcursoService,],
  controllers: [ConcursoController,],
})
export class ConcursoModule { }
