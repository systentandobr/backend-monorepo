import { Test, TestingModule } from '@nestjs/testing';
import { SysAssistenteEstudosController } from './sys-assistente-estudos.controller';
import { SysAssistenteEstudosService } from './sys-assistente-estudos.service';

describe('SysAssistenteEstudosController', () => {
  let sysAssistenteEstudosController: SysAssistenteEstudosController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SysAssistenteEstudosController],
      providers: [SysAssistenteEstudosService],
    }).compile();

    sysAssistenteEstudosController = app.get<SysAssistenteEstudosController>(SysAssistenteEstudosController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(sysAssistenteEstudosController.getHello()).toBe('Hello World!');
    });
  });
});
