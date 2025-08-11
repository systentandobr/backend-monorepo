import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { QuestionsRepository } from './repository/question.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './model/question.schema';

@Module({
  // imports: [TypeOrmModule.forFeature([Question])],
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  providers: [QuestionService, QuestionsRepository],
  exports: [QuestionService, QuestionsRepository],
  controllers: [QuestionController],
})
export class QuestionModule {}
