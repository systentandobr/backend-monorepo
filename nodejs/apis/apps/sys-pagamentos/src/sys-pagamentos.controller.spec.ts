import { Test, TestingModule } from '@nestjs/testing';
import { SysPagamentosController } from './sys-pagamentos.controller';
import { SysPagamentosService } from './sys-pagamentos.service';

describe('SysPagamentosController', () => {
  let sysPagamentosController: SysPagamentosController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SysPagamentosController],
      providers: [SysPagamentosService],
    }).compile();

    sysPagamentosController = app.get<SysPagamentosController>(SysPagamentosController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(sysPagamentosController.getHello()).toBe('Hello World!');
    });
  });
});
