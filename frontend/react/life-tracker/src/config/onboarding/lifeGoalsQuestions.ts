import { Target, Brain, BookOpen, User } from 'lucide-react';
import { QuestionConfig } from './types';

export const lifeGoalsQuestions: QuestionConfig = {
  lifeGoals: {
    type: 'multiselect',
    answerKey: 'lifeGoals',
    icon: Target,
    data: {
      question: 'Quais são seus principais objetivos de vida para os próximos anos?',
      minSelections: 1,
      options: [
        { id: 'financial-freedom', text: 'Liberdade financeira' },
        { id: 'career-growth', text: 'Crescimento na carreira' },
        { id: 'own-business', text: 'Ter meu próprio negócio' },
        { id: 'travel', text: 'Viajar e conhecer novos lugares' },
        { id: 'family', text: 'Construir uma família' },
        { id: 'health', text: 'Melhorar saúde e bem-estar' },
        { id: 'education', text: 'Continuar estudando' },
        { id: 'house', text: 'Adquirir casa própria' }
      ]
    },
    nextQuestions: ['learning']
  },
  learning: {
    type: 'multiselect',
    answerKey: 'learningAreas',
    icon: Brain,
    data: {
      question: 'Quais áreas de conhecimento você gostaria de desenvolver?',
      minSelections: 1,
      options: [
        { id: 'finance', text: 'Finanças e investimentos' },
        { id: 'tech', text: 'Tecnologia e programação' },
        { id: 'business', text: 'Empreendedorismo e gestão' },
        { id: 'marketing', text: 'Marketing e vendas' },
        { id: 'health', text: 'Saúde e bem-estar' },
        { id: 'leadership', text: 'Liderança e comunicação' },
        { id: 'languages', text: 'Idiomas' },
        { id: 'creativity', text: 'Criatividade e arte' }
      ]
    },
    nextQuestions: ['learningHabitCommitment']
  },
  learningHabitCommitment: {
    type: 'actionCommitment',
    answerKey: ['learningHabitCommitment', 'learningHabitTimeframe'],
    icon: BookOpen,
    data: {
      title: "Compromisso com Aprendizado Contínuo",
      description: "Defina uma rotina específica de aprendizado que você se comprometerá a seguir:",
      actionCommitment: {
        title: "Meu compromisso de aprendizado",
        description: "Ex: Ler 20 páginas diárias, completar um curso online em 30 dias, praticar um idioma por 15min/dia",
        actionKey: "learningHabitCommitment",
        defaultAction: "Estudar uma habilidade relevante por pelo menos 30 minutos diários",
        timeframeKey: "learningHabitTimeframe",
        defaultTimeframe: "60 dias"
      }
    },
    nextQuestions: ['profileGeneration']
  },
  profileGeneration: {
    type: 'profile',
    icon: User,
    data: {
      title: 'Criando seu perfil personalizado',
      description: 'Analisando suas respostas e gerando recomendações com base no seu perfil de mentalidade, objetivos e hábitos...'
    },
    nextQuestions: []
  }
};