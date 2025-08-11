import { Test, TestingModule } from '@nestjs/testing';
import { PerfisDeUsuarioRepository } from './repositories.repository';

describe('PerfisDeUsuarioRepository', () => {
  let service: PerfisDeUsuarioRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerfisDeUsuarioRepository],
    }).overrideProvider(PerfisDeUsuarioRepository).useValue({
      validaJaExisteCadastro: jest.fn(),
      cadastrar: jest.fn(),
      listar: jest.fn(),
      atualizar: jest.fn(),
      remover: jest.fn(),
    }).compile();

    service = module.get<PerfisDeUsuarioRepository>(PerfisDeUsuarioRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
