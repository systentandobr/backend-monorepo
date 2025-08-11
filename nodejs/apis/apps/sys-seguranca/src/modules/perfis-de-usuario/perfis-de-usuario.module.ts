import { Module } from '@nestjs/common';
import { PerfisDeUsuarioController } from './perfis-de-usuario.controller';
import { PerfisDeUsuarioRepository } from './repositories/repositories.repository';
import { PerfisDeUsuarioService } from './services/perfis-de-usuario.service';
import { PerfisDeUsuarioDomain } from './domains/perfis-de-usuario/perfis-de-usuario.domain';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PerfisDeUsuario,
  PerfisDeUsuarioSchema,
} from './data/schemas/PerfilsDeUsuarioSchema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PerfisDeUsuario.name, schema: PerfisDeUsuarioSchema },
    ]),
  ],
  controllers: [PerfisDeUsuarioController],
  providers: [
    PerfisDeUsuarioDomain,
    PerfisDeUsuarioService,
    PerfisDeUsuarioRepository,
  ],
})
export class PerfisDeUsuarioModule {}
