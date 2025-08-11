import { Injectable } from '@nestjs/common';
import { Simulacao } from './model/simulacao.schema';
import { SimulacaoRepository } from './repository/simulacao.repository';
import { QuestionService } from '../question/question.service';

@Injectable()
export class SimulacaoService {
  constructor(
    readonly repository: SimulacaoRepository,
    readonly questionService: QuestionService,
  ) { }

  async create(data: Simulacao): Promise<Simulacao> {
    return await this.repository.create(data);
  }

  async update(id: string, data: Simulacao): Promise<Simulacao> {
    return await this.repository.update(id, data);
  }

  async filterQuestions(results: Simulacao[], filter = false): Promise<Simulacao[]> {
    const simulacoesComQuestoes = [];
    if (filter) {
      for (const simulacao of results) {
        const questionsBySimulacao = await this.questionService.findBySimulacaoId(
          { simulacaoId: simulacao._id },
        );
        const existe = questionsBySimulacao.some(
          (question) => !question.correctAnswerChecked,
        );
        if (questionsBySimulacao.length > 0 && existe) {
          simulacoesComQuestoes.push(simulacao);
        }
      }
    }
    return filter ? simulacoesComQuestoes : results;
  }

  async findByTemaEspecificoUserId(
    temaEspecificoId: string,
    userId: string,
    filterOpenQuestions = false
  ): Promise<Simulacao[]> {
    const results = await this.repository.findByTemaEspecificoUserId(
      temaEspecificoId,
      userId,
    );
    return await this.filterQuestions(results, filterOpenQuestions);
  }

  async findById(id: string): Promise<Simulacao> {
    return await this.repository.findById(id);
  }

  async deleteAll(): Promise<void> {
    await this.repository.deleteAll();
  }
}
