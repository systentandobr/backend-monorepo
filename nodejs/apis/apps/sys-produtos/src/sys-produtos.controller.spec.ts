import { Test, TestingModule } from '@nestjs/testing';
import { SysProdutosController } from './sys-produtos.controller';
import { SysProdutosService } from './sys-produtos.service';

describe('SysProdutosController', () => {
  let sysProdutosController: SysProdutosController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SysProdutosController],
      providers: [SysProdutosService],
    }).compile();

    sysProdutosController = app.get<SysProdutosController>(SysProdutosController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(sysProdutosController.getHello()).toBe('Hello World!');
    });
  });
});
