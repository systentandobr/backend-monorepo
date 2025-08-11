import { Test, TestingModule } from '@nestjs/testing';
import { PerfisDeUsuarioDomain } from './perfis-de-usuario.domain';
import { MetadadosDto } from 'libs/shared/data/dtos/Metadados';

describe('PerfisDeUsuarioDomain', () => {
  let service: PerfisDeUsuarioDomain;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerfisDeUsuarioDomain, MetadadosDto],
    }).overrideProvider(PerfisDeUsuarioDomain).useValue({
      listar: jest.fn(),
      remover: jest.fn(),
      cadastrar: jest.fn(),
    }).compile();


    service = module.get<PerfisDeUsuarioDomain>(PerfisDeUsuarioDomain);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
