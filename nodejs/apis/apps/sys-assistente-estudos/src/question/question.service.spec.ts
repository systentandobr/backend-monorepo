import { Test, TestingModule } from '@nestjs/testing';
import { QuestionService } from './question.service';
import { QuestionsRepository } from './repository/question.repository';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { QuestionController } from './question.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './model/question.schema';

describe('QuestionService', () => {
  let controller: QuestionController;
  let mongod: MongoMemoryServer;
  let service: QuestionService;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Question.name, schema: QuestionSchema },
        ]),
      ],
      providers: [QuestionService, QuestionsRepository],
    })
      .overrideProvider(QuestionsRepository)
      .useValue({
        findBySimulacaoId: jest.fn(),
        deleteAllBySimulacaoId: jest.fn(),
        importQuestionsFromPdf: jest.fn(),
        createQuestion: jest.fn(),
        createAllQuestion: jest.fn(),
        getQuestionById: jest.fn(),
        updateQuestion: jest.fn(),
        updateCorrectQuestion: jest.fn(),
        updateInCorrectQuestion: jest.fn(),
        deleteQuestion: jest.fn(),
        explain: jest.fn(),
      })
      .compile();

    service = module.get<QuestionService>(QuestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
