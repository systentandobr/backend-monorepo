import { Test, TestingModule } from '@nestjs/testing';
import { PerfisDeUsuarioService } from './perfis-de-usuario.service';

describe('PerfisDeUsuarioService', () => {
  let service: PerfisDeUsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerfisDeUsuarioService],
    }).overrideProvider(PerfisDeUsuarioService).useValue({
      listar: jest.fn(),
      remover: jest.fn(),
      cadastrar: jest.fn(),
    }).compile();

    service = module.get<PerfisDeUsuarioService>(PerfisDeUsuarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
