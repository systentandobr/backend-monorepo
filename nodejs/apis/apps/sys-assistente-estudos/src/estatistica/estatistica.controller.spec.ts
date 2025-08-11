import { Test, TestingModule } from '@nestjs/testing';
import { EstatisticaController } from './estatistica.controller';
import { EstatisticaRepository } from './repository/estatistica.repository';
import { EstatisticaService } from './estatistica.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Estatistica, EstatisticaSchema } from './model/estatistica.schema';

describe('EstatisticaController', () => {
  let controller: EstatisticaController;
  let mongod: MongoMemoryServer;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Estatistica.name, schema: EstatisticaSchema },
        ]),
      ],
      controllers: [EstatisticaController],
      providers: [EstatisticaRepository, EstatisticaService, EstatisticaRepository],
    }).overrideProvider(EstatisticaService)
      .useValue({
        create: jest.fn(),
        update: jest.fn(),
        findByConcursoId: jest.fn(),
        findByConcursoESimulacaoId: jest.fn(),
        findById: jest.fn(),
        findByUserId: jest.fn(),
        deleteAll: jest.fn(),
      })
      .compile();


    controller = module.get<EstatisticaController>(EstatisticaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
