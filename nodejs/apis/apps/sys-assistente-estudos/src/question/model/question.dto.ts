import { Question } from './question.schema';

export interface QuestionDto {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  correctAnswerChecked: boolean;
  simulacaoId: string;
  attempt?: number;
}

export const adapterQuestion = (data: QuestionDto): Question => {
  return {
    _id: data._id,
    questionText: data.questionText,
    options: data.options,
    correctAnswer: data.correctAnswer,
    correctAnswerChecked: data.correctAnswerChecked,
    simulacaoId: data.simulacaoId,
    attempt: data.attempt ?? 0,
  } as Question;
};

export const adapterQuestionDto = (data: Question | any): QuestionDto => {
  return {
    _id: data._id as unknown as string,
    questionText: data.questionText,
    options: data.options,
    correctAnswer: data.correctAnswer,
    correctAnswerChecked: data.correctAnswerChecked,
    simulacaoId: data.simulacaoId,
    attempt: data.attempt,
  };
};

export const adapterArrayQuestionDto = (
  data: Question[] | any[],
): QuestionDto[] => {
  return data.map((question) => adapterQuestionDto(question));
};
