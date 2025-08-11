import { Test, TestingModule } from '@nestjs/testing';
import { PerfisDeUsuarioController } from './perfis-de-usuario.controller';
import { JwtService } from '@nestjs/jwt';
import { PerfisDeUsuarioService } from './services/perfis-de-usuario.service';
import { PerfisDeUsuarioDomain } from './domains/perfis-de-usuario/perfis-de-usuario.domain';
import { PerfisDeUsuarioRepository } from './repositories/repositories.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { PerfisDeUsuario, PerfisDeUsuarioSchema } from './data/schemas/PerfilsDeUsuarioSchema';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('PerfisDeUsuarioController', () => {
  let controller: PerfisDeUsuarioController;
  let service: PerfisDeUsuarioService;

  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: PerfisDeUsuario.name, schema: PerfisDeUsuarioSchema },
        ]),
      ],
      providers: [JwtService, PerfisDeUsuarioService, PerfisDeUsuarioDomain, PerfisDeUsuarioRepository],
    })
      .overrideProvider(PerfisDeUsuarioController).useValue({
        getProfile: jest.fn(),
        listar: jest.fn(),
      }).compile();

    service = module.get<PerfisDeUsuarioService>(PerfisDeUsuarioRepository);
  });

  afterAll(async () => {
    if (mongod) {
      await mongod.stop();
    }
  });


  beforeEach(async () => {
    const uri = mongod.getUri();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: PerfisDeUsuario.name, schema: PerfisDeUsuarioSchema },
        ]),
      ],
      controllers: [PerfisDeUsuarioController],
      providers: [JwtService, PerfisDeUsuarioService, PerfisDeUsuarioDomain, PerfisDeUsuarioRepository],
    }).overrideProvider(PerfisDeUsuarioController).useValue({
      getProfile: jest.fn(),
      listar: jest.fn(),
    }).compile();


    controller = module.get<PerfisDeUsuarioController>(PerfisDeUsuarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
