import { Injectable, NotFoundException } from '@nestjs/common';
import { Question } from '../model/question.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { QuestionDto } from '../model/question.dto';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) {}

  async findAll(): Promise<Question[]> {
    return await this.questionModel.find().lean().exec();
  }

  adapterToQuestion(data: QuestionDto): Question {
    const createQuestion = new this.questionModel({
      questionText: data.questionText,
      options: data.options,
      correctAnswer: data.correctAnswer,
      simulacaoId: data.simulacaoId,
      attempt: 0,
    });
    return createQuestion;
  }

  async findBySimulacaoId(simulacaoId: string): Promise<Question[]> {
    const limit = 25;
    try {
      const simulacaoObjectId = new Types.ObjectId(simulacaoId);
      // const size = await this.questionModel.find({
      //   simulacaoId: simulacaoObjectId,
      //   $or: [
      //     { correctAnswerChecked: false },
      //     { correctAnswerChecked: { $exists: false } },
      //   ],
      // });
      // const totalItems = size.length;
      // const totalPages = Math.ceil(totalItems / limit);

      // // Randomize the page number
      // const randomPage = Math.floor(Math.random() * totalPages) + 1;

      // console.log(`Total items: ${totalItems}`);
      // console.log(`Total pages: ${totalPages}`);
      // console.log(`Random page: ${randomPage}`);

      const results = await this.questionModel
        .find({
          simulacaoId: simulacaoObjectId,
          $or: [
            { correctAnswerChecked: false },
            { correctAnswerChecked: { $exists: false } },
          ],
        })
        .skip(0)
        .limit(limit)
        .lean()
        .exec();
      // console.log(`results: ${results}`);
      return results;
    } catch (error) {
      console.error('Error in findBySimulacaoId:', error);
      throw error;
    }
  }

  async createQuestion(createQuestionDto: QuestionDto): Promise<Question> {
    const createdQuestion = this.adapterToQuestion(createQuestionDto);
    return createdQuestion.save();
  }

  async createAllQuestion(createQuestionDto: Question[]): Promise<Question[]> {
    return await this.questionModel.create(createQuestionDto);
  }

  async getQuestionById(id: string): Promise<Question | null> {
    const question = await this.questionModel.findById(id).exec();
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  async updateQuestion(
    id: string,
    update: Partial<QuestionDto>,
  ): Promise<Question> {
    const existingQuestion = await this.questionModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();

    if (!existingQuestion) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return existingQuestion;
  }

  async updateCorrectQuestion(id: string, dto: QuestionDto): Promise<Question> {
    const existingQuestion = await this.questionModel.findById(id).exec();

    if (existingQuestion) {
      dto.correctAnswerChecked = true;
      return await this.updateQuestion(id, dto as any);
    }
    if (!existingQuestion) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return existingQuestion;
  }

  async updateInCorrectQuestion(
    id: string,
    dto: QuestionDto,
  ): Promise<Question> {
    const existingQuestion = await this.questionModel.findById(id).exec();

    if (existingQuestion) {
      dto.correctAnswerChecked = false;
      dto.attempt = (dto.attempt || 0) + 1;
      return await this.updateQuestion(id, dto as any);
    }
    if (!existingQuestion) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return existingQuestion;
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.questionModel.findByIdAndDelete(id).exec();
  }

  async deleteAllBySimulacaoId({ simulacaoId }): Promise<string> {
    try {
      await this.questionModel.deleteMany({
        simulacaoId: new Types.ObjectId(simulacaoId),
      });
      return `Documentos da simulacaoId: ${simulacaoId} excluídos com sucesso!`;
    } catch (error) {
      console.error('Erro ao excluir documentos:', error);
      // Lide com o erro conforme necessário
    }
  }
}
