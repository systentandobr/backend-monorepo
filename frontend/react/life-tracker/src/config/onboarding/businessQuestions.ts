import { Lightbulb, User, Target, Clock, Wallet } from 'lucide-react';
import { QuestionConfig } from './types';

export const businessQuestions: QuestionConfig = {
  businessInterests: {
    type: 'multiselect',
    answerKey: 'businessInterests',
    icon: Lightbulb,
    data: {
      question: 'Quais áreas de negócio mais te interessam?',
      minSelections: 1,
      options: [
        { id: 'tech', text: 'Tecnologia e SaaS' },
        { id: 'ecommerce', text: 'E-commerce' },
        { id: 'content', text: 'Criação de conteúdo' },
        { id: 'services', text: 'Serviços e consultoria' },
        { id: 'education', text: 'Educação e treinamentos' },
        { id: 'real-estate', text: 'Negócios imobiliários' },
        { id: 'physical', text: 'Produtos físicos' },
        { id: 'franchise', text: 'Franquias' }
      ]
    },
    nextQuestions: ['businessHabitCommitment']
  },
  businessHabitCommitment: {
    type: 'actionCommitment',
    answerKey: ['businessHabitCommitment', 'businessHabitTimeframe'],
    icon: Target,
    data: {
      title: "Compromisso com Desenvolvimento de Negócio",
      description: "Defina uma ação específica para desenvolver seu lado empreendedor:",
      actionCommitment: {
        title: "Meu compromisso empreendedor",
        description: "Ex: Validar uma ideia de negócio, criar um MVP, conversar com 5 clientes potenciais por semana",
        actionKey: "businessHabitCommitment",
        defaultAction: "Dedicar 5 horas semanais para pesquisar e validar ideias de negócio",
        timeframeKey: "businessHabitTimeframe",
        defaultTimeframe: "90 dias"
      }
    },
    nextQuestions: ['entrepreneurProfile']
  },
  entrepreneurProfile: {
    type: 'single',
    answerKey: 'entrepreneurProfile',
    icon: User,
    data: {
      question: 'Qual perfil empreendedor mais combina com você?',
      options: [
        { 
          id: 'visionary', 
          text: 'Visionário',
          description: 'Prefiro desenvolver ideias inovadoras e revolucionárias'
        },
        { 
          id: 'builder', 
          text: 'Construtor',
          description: 'Gosto de criar sistemas e negócios sustentáveis e escaláveis'
        },
        { 
          id: 'specialist', 
          text: 'Especialista',
          description: 'Prefiro me aprofundar em uma área específica de conhecimento'
        },
        { 
          id: 'opportunist', 
          text: 'Oportunista',
          description: 'Gosto de identificar e explorar oportunidades de mercado'
        }
      ]
    },
    nextQuestions: ['timeAvailability']
  },
  timeAvailability: {
    type: 'sliders',
    answerKey: ['timeAvailability'],
    icon: Clock,
    data: {
      title: 'Disponibilidade de Tempo',
      description: 'Quanto tempo você teria disponível semanalmente para se dedicar a um novo negócio?',
      sliders: [
        {
          key: 'timeAvailability',
          min: 1,
          max: 40,
          step: 1,
          defaultValue: 10,
          formatLabel: (value) => `${value} horas/semana`
        }
      ]
    },
    nextQuestions: ['investmentCapacity']
  },
  investmentCapacity: {
    type: 'single',
    answerKey: 'investmentCapacity',
    icon: Wallet,
    data: {
      question: 'Qual seria sua capacidade de investimento inicial em um negócio?',
      options: [
        { 
          id: 'low', 
          text: 'Até R$ 5.000',
          description: 'Prefiro começar com pouco capital'
        },
        { 
          id: 'medium', 
          text: 'R$ 5.000 a R$ 20.000',
          description: 'Posso investir um valor moderado'
        },
        { 
          id: 'high', 
          text: 'R$ 20.000 a R$ 50.000',
          description: 'Tenho capital considerável disponível'
        },
        { 
          id: 'very-high', 
          text: 'Acima de R$ 50.000',
          description: 'Estou preparado para um investimento significativo'
        }
      ]
    },
    nextQuestions: ['lifeGoals']
  }
};