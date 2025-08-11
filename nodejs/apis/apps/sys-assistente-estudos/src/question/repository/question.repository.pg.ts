import { Injectable } from '@nestjs/common';
import { Question } from '../model/question.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionsRepository {
  private questionsCollection: Question[] = [];

  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
  ) {}

  async findAll(): Promise<Question[]> {
    return this.questionsRepository.find();
  }

  async createQuestion(question: Question): Promise<Question> {
    return this.questionsRepository.save(question);
  }

  async getQuestionById(id: string): Promise<Question | null> {
    return this.questionsRepository.findOne(id as any);
  }

  async updateQuestion(id: string, update: Question): Promise<void> {
    try {
      console.log('updateQuestion', id, update);
      await this.questionsRepository.upsert(update, [id]);
    } catch (error) {
      console.error('Erro ao atualizar a questão:', error);
      throw new Error('Erro ao atualizar a questão');
    }
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.questionsRepository.delete(id);
  }

  async deleteAll(): Promise<void> {
    await this.questionsRepository.clear();
  }
}
