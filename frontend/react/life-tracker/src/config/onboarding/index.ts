import { QuestionConfig } from './types';
import { introQuestions } from './introQuestions';
import { mindsetQuestions } from './mindsetQuestions';
import { personalQuestions } from './personalQuestions';
import { financialQuestions } from './financialQuestions';
import { businessQuestions } from './businessQuestions';
import { lifeGoalsQuestions } from './lifeGoalsQuestions';

// Combinar todos os conjuntos de questões em um único objeto
export const questionConfig: QuestionConfig = {
  ...introQuestions,
  ...mindsetQuestions,
  ...personalQuestions,
  ...financialQuestions,
  ...businessQuestions,
  ...lifeGoalsQuestions
};

// Exportar os módulos individuais para permitir importações parciais
export {
  introQuestions,
  mindsetQuestions,
  personalQuestions,
  financialQuestions,
  businessQuestions,
  lifeGoalsQuestions
};

// Tipos comuns
export * from './types';