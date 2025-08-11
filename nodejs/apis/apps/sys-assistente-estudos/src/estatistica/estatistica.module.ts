import { Module } from '@nestjs/common';
import { EstatisticaService } from './estatistica.service';
import { EstatisticaController } from './estatistica.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Estatistica, EstatisticaSchema } from './model/estatistica.schema';
import { EstatisticaRepository } from './repository/estatistica.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Estatistica.name, schema: EstatisticaSchema },
    ]),
  ],
  providers: [EstatisticaService, EstatisticaRepository],
  controllers: [EstatisticaController],
})
export class EstatisticaModule {}
