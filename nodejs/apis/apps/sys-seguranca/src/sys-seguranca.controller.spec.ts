import { Test, TestingModule } from '@nestjs/testing';
import { SysSegurancaController } from './sys-seguranca.controller';
import { SysSegurancaService } from './sys-seguranca.service';

describe('SysSegurancaController', () => {
  let sysSegurancaController: SysSegurancaController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SysSegurancaController],
      providers: [SysSegurancaService],
    }).compile();

    sysSegurancaController = app.get<SysSegurancaController>(SysSegurancaController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(sysSegurancaController.getHello()).toBe('Hello World!');
    });
  });
});
