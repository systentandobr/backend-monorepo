import { Test, TestingModule } from '@nestjs/testing';
import { UtisService } from './utis.service';

describe('UtisService', () => {
  let service: UtisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UtisService],
    }).compile();

    service = module.get<UtisService>(UtisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
