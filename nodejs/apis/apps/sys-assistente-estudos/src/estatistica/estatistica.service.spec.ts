import { Test, TestingModule } from '@nestjs/testing';
import { EstatisticaService } from './estatistica.service';
import { EstatisticaRepository } from './repository/estatistica.repository';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { Estatistica, EstatisticaSchema } from './model/estatistica.schema';

describe('EstatisticaService', () => {
  let service: EstatisticaService;
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
      providers: [EstatisticaRepository, EstatisticaService],
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


    service = module.get<EstatisticaService>(EstatisticaService);
  });



  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
