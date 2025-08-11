import { Test, TestingModule } from '@nestjs/testing';
import { TemaespecificoService } from './temaespecifico.service';

describe('TemaespecificoService', () => {
  let service: TemaespecificoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemaespecificoService],
    }).overrideProvider(
      TemaespecificoService
    ).useValue({
      findAll: jest.fn(),
    }).compile()

    service = module.get<TemaespecificoService>(TemaespecificoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
