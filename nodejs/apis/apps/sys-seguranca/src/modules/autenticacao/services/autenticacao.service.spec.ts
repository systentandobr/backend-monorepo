import { Test, TestingModule } from '@nestjs/testing';
import { AutenticacaoService } from './autenticacao.service';
import { AutenticacaoRepository } from '../autenticacao.repository';
import { Autenticacao, AutenticacaoSchema } from '../data/schemas/AutenticacaoSchema';

describe('AutenticacaoService', () => {
  let service: AutenticacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutenticacaoService,
        AutenticacaoRepository,
        Autenticacao,
        {
          provide: 'AutenticacaoModel',
          useValue: AutenticacaoSchema,
        },
      ],
    }).overrideProvider(AutenticacaoService).useValue({
      listar: jest.fn(),
      remover: jest.fn(),
      cadastrar: jest.fn(),
    }).overrideProvider(AutenticacaoRepository).useValue({
      validaJaExisteCadastro: jest.fn(),
      cadastrar: jest.fn(),
      listar: jest.fn(),
      atualizar: jest.fn(),
      remover: jest.fn(),
    }).compile();

    service = module.get<AutenticacaoService>(AutenticacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
