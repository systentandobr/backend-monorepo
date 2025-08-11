import { Test, TestingModule } from '@nestjs/testing';
import { TemaespecificoController } from './temaespecifico.controller';
import { TemaespecificoService } from './temaespecifico.service';

describe('TemaespecificoController', () => {
  let controller: TemaespecificoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemaespecificoController],
      providers: [TemaespecificoService],
    }).overrideProvider(
      TemaespecificoService
    ).useValue({
      findall: jest.fn(),
    }).compile();

    controller = module.get<TemaespecificoController>(TemaespecificoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
