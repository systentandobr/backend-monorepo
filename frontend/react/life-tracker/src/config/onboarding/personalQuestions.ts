import { Brain, Activity, Clock } from 'lucide-react';
import { QuestionConfig } from './types';

export const personalQuestions: QuestionConfig = {
  concentration: {
    type: 'single',
    answerKey: 'concentration',
    icon: Brain,
    data: {
      question: 'Você acha difícil se concentrar em tarefas por longos períodos?',
      options: [
        { 
          id: 'high-focus', 
          text: 'Não, consigo me concentrar facilmente',
          description: 'Mantenho foco mesmo em ambiente com distrações',
          visualIndicator: 'triangle'
        },
        { 
          id: 'medium-focus', 
          text: 'Às vezes perco meu foco',
          description: 'Consigo focar em tarefas interessantes, mas me distraio com outras'
        },
        { 
          id: 'low-focus', 
          text: 'Sim, me distraio facilmente',
          description: 'Tenho dificuldade em manter concentração por longos períodos'
        }
      ]
    },
    nextQuestions: ['lifestyle']
  },
  lifestyle: {
    type: 'single',
    answerKey: 'lifestyle',
    icon: Activity,
    data: {
      question: 'Quão satisfeito você está com seu estilo de vida atual?',
      options: [
        { 
          id: 'very-satisfied', 
          text: 'Bastante satisfeito',
          description: 'Sinto-me muito ativo e com energia regularmente',
          visualIndicator: 'triangle'
        },
        { 
          id: 'somewhat-satisfied', 
          text: 'Moderadamente satisfeito',
          description: 'Está bom, mas gostaria de ver algumas melhorias'
        },
        { 
          id: 'not-satisfied', 
          text: 'Pouco satisfeito',
          description: 'Gostaria de ver mudanças significativas na minha rotina'
        }
      ]
    },
    nextQuestions: ['energy']
  },
  energy: {
    type: 'single',
    answerKey: 'energy',
    icon: Activity,
    data: {
      question: 'Como é seu nível de energia ao longo do dia?',
      options: [
        { 
          id: 'high-energy', 
          text: 'Alto e constante',
          description: 'Mantenho energia consistente durante todo o dia',
          visualIndicator: 'triangle'
        },
        { 
          id: 'medium-energy', 
          text: 'Variado com picos',
          description: 'Tenho momentos de alta energia e outros de baixa'
        },
        { 
          id: 'low-energy', 
          text: 'Diminui progressivamente',
          description: 'Começo com boa energia que vai reduzindo ao longo do dia'
        }
      ]
    },
    nextQuestions: ['dailyRoutine']
  },
  dailyRoutine: {
    type: 'timeRange',
    answerKey: ['wakeupTime', 'sleepTime'],
    icon: Clock,
    data: {
      title: 'Sua rotina diária',
      timePickers: [
        {
          label: 'Que horas você costuma acordar?',
          key: 'wakeupTime',
          defaultValue: '07:00'
        },
        {
          label: 'Que horas você costuma dormir?',
          key: 'sleepTime',
          defaultValue: '23:00'
        }
      ]
    },
    nextQuestions: ['financialGoals']
  }
};