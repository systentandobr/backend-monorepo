import { Compass, Heart } from 'lucide-react';
import { QuestionConfig } from './types';

export const introQuestions: QuestionConfig = {
  welcome: {
    type: 'welcome',
    nextQuestions: ['personalInterests'],
    icon: Compass,
    data: {
      title: 'Bem-vindo ao Life Goal Tracker',
      description: 'Vamos personalizar sua experiência para ajudá-lo a alcançar seus objetivos pessoais, financeiros e empreendedores.'
    }
  },
  personalInterests: {
    type: 'multiselect',
    answerKey: 'personalInterests',
    icon: Heart,
    data: {
      question: 'Quais áreas da sua vida você deseja desenvolver?',
      minSelections: 1,
      options: [
        { id: 'health', text: 'Saúde e bem-estar' },
        { id: 'career', text: 'Carreira e trabalho' },
        { id: 'finances', text: 'Finanças e investimentos' },
        { id: 'relationships', text: 'Relacionamentos' },
        { id: 'personal-growth', text: 'Crescimento pessoal' },
        { id: 'creativity', text: 'Criatividade e hobbies' },
        { id: 'business', text: 'Empreendimentos e negócios' },
        { id: 'community', text: 'Comunidade e impacto social' }
      ]
    },
    nextQuestions: ['mindsetConsistency']
  }
};