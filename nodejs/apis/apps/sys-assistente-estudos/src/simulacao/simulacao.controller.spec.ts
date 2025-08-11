import { Test, TestingModule } from '@nestjs/testing';
import { SimulacaoController } from './simulacao.controller';
import { SimulacaoService } from './simulacao.service';

describe('SimulacaoController', () => {
  let controller: SimulacaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SimulacaoController],
      providers: [SimulacaoService],
    }).overrideProvider(
      SimulacaoService,
    ).useValue({
      get: jest.fn(),
    }).compile();

    controller = module.get<SimulacaoController>(SimulacaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
