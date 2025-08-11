import { Test, TestingModule } from '@nestjs/testing';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { QuestionsRepository } from './repository/question.repository';
import { Question, QuestionSchema } from './model/question.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('QuestionController', () => {
  let controller: QuestionController;
  let mongod: MongoMemoryServer;
  let service: QuestionService;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Question.name, schema: QuestionSchema },
        ]),
      ],
      controllers: [QuestionController],
      providers: [QuestionService, QuestionsRepository],

    }).overrideProvider(QuestionService).useValue({
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateCorrectQuestion: jest.fn(),
      updateInCorrectQuestion: jest.fn(),
      explain: jest.fn(),
      remove: jest.fn(),
      deleteAll: jest.fn(),
    }).compile();


    service = module.get<QuestionService>(QuestionsRepository);
  });

  afterAll(async () => {
    if (mongod) {
      await mongod.stop();
    }
  });

  beforeEach(async () => {
    const uri = mongod.getUri();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Question.name, schema: QuestionSchema },
        ]),
      ],
      controllers: [QuestionController],
      providers: [QuestionService, QuestionsRepository],
    })
      .overrideProvider(QuestionService)
      .useValue({
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateCorrectQuestion: jest.fn(),
        updateInCorrectQuestion: jest.fn(),
        explain: jest.fn(),
        remove: jest.fn(),
        deleteAll: jest.fn(),
      })
      .compile();

    controller = module.get<QuestionController>(QuestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
