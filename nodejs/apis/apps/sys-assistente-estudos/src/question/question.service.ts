import { Injectable } from '@nestjs/common';
import { QuestionsRepository } from './repository/question.repository';
import { Question } from './model/question.schema';
import * as fs from 'fs';
import * as pdfParse from 'pdf-parse';
import axios from 'axios';
import { QuestionDto } from './model/question.dto';

@Injectable()
export class QuestionService {
  constructor(
    private questionsRepository: QuestionsRepository,
    private estaticasRepository: QuestionsRepository,
  ) {}

  async explain(data: any): Promise<string> {
    const { prompt } = data;
    try {
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
      const config = {
        method: 'post',
        url: 'https://api.openai.com/v1/completions',
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        data: {
          model: 'gpt-3.5-turbo-instruct',
          prompt: prompt,
          temperature: 1,
          max_tokens: 256,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        },
      };
      // const url = 'https://api.openai.com/v1/completions';

      const response = await axios.request(
        // url,

        config,
      );
      return response?.data?.choices.map((choice) => choice.text).join(',');
    } catch (error) {
      console.error('error:', error);
      return error.message;
    }
  }

  async createQuestion(questionData: QuestionDto): Promise<void> {
    await this.questionsRepository.createQuestion(questionData);
  }

  async createAllQuestion(questionsData: Question[]): Promise<void> {
    await this.questionsRepository.createAllQuestion(questionsData);
  }

  async getQuestionById(id: string): Promise<Question | null> {
    return this.questionsRepository.getQuestionById(id);
  }

  async updateQuestion(id: string, questionData: QuestionDto): Promise<void> {
    await this.questionsRepository.updateQuestion(id, questionData);
  }

  async updateCorrectQuestion(
    id: string,
    questionData: QuestionDto,
  ): Promise<QuestionDto> {
    return (await this.questionsRepository.updateCorrectQuestion(
      id,
      questionData,
    )) as QuestionDto;
  }

  async updateInCorrectQuestion(
    id: string,
    questionData: QuestionDto,
  ): Promise<QuestionDto> {
    return (await this.questionsRepository.updateInCorrectQuestion(
      id,
      questionData,
    )) as QuestionDto;
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.questionsRepository.deleteQuestion(id);
  }

  async getAllRandomQuestions({ simulacaoId }): Promise<Question[]> {
    const sliceArray = async (array: Question[]): Promise<Question[]> => {
      let i = 0;
      const reordernedArray: Question[] = [];
      for await (const question of array) {
        i++;
        const order = Object.assign({}, question);
        const prefix = `${i}) `;
        order.questionText = prefix.concat(order.questionText?.slice(2).trim());
        reordernedArray.push(order);
      }
      return reordernedArray;
    };

    const randomizeQuestions = async (
      array: Question[],
    ): Promise<Question[]> => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return await sliceArray(array);
    };

    const filtered = await randomizeQuestions(
      await this.findBySimulacaoId({ simulacaoId }),
    );

    const limited = filtered.filter(
      (question) => !question.correctAnswerChecked,
    );

    return await limited;
  }

  async findBySimulacaoId({ simulacaoId }): Promise<Question[]> {
    return this.questionsRepository.findBySimulacaoId(simulacaoId);
  }

  async deleteAllBySimulacaoId(simulacaoId): Promise<string> {
    return this.questionsRepository.deleteAllBySimulacaoId({ simulacaoId });
  }

  regAE = new RegExp('([a-eA-E]\\))', 'g');

  async melhorarFormatacao(text: string): Promise<string> {
    const formatado = text.replace(/\*\*/g, ' **').replace(this.regAE, '\n$1');

    return formatado.replace(new RegExp('^\\d{1,2}[\\).]?\\s*.+$'), '\n$1');
  }
  // curl -X POST http://localhost:3000/questions/import -H "Content-Type: application/json" -d '{"filePath": "/path/to/SIMULADO+IFS+-+COM+GABARITO.docx"}'

  async importQuestionsFromPdf(
    pdfFilePath: string,
    simulacaoId: string,
  ): Promise<void> {
    await this.deleteAllBySimulacaoId(simulacaoId);

    const dataBuffer = fs.readFileSync(pdfFilePath);
    const data = await pdfParse(dataBuffer);

    const lines = (await this.melhorarFormatacao(data.text))
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line);
    const questions = [];
    let currentQuestion = null;
    let capturingQuestionText = false;

    for (const line of lines) {
      const $re = new RegExp('^\\d{1,2}[\\).]?\\s*.+$');
      if (line.match($re)) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          questionText: line,
          options: [],
          correctAnswer: null,
          simulacaoId,
        };
        capturingQuestionText = true;
      } else if (capturingQuestionText) {
        if (line.match(this.regAE)) {
          capturingQuestionText = false;
          const option = line.slice(3).trim();
          if (option.includes('<b>') || option.includes('**')) {
            // Supondo que o texto em negrito será marcado assim no PDF
            currentQuestion.correctAnswer = line;
          }
          currentQuestion.options.push(line);
        } else {
          currentQuestion.questionText += ` ${line}`;
        }
      } else if (line.match(this.regAE)) {
        const option = line.slice(3).trim();
        if (option.includes('<b>') || option.includes('**')) {
          // Supondo que o texto em negrito será marcado assim no PDF
          currentQuestion.correctAnswer = line;
        }
        currentQuestion.options.push(line);
      }
    }
    if (currentQuestion) {
      questions.push(currentQuestion);
    }
    console.log('questions::: ', questions.length);
    // for (const question of questions) {
    //   if (!question.correctAnswer) {
    //     console.log('without correct answer:', question);
    //   }
    //   await this.createQuestion(question);
    // }
    await this.createAllQuestion(questions);
    const incorrectAnswers = questions.filter(
      (question) => !question.correctAnswer,
    );
    console.log('incorrectAnswers::: ', incorrectAnswers.length);
    console.log('questions::: ', questions.length);
  }
}
