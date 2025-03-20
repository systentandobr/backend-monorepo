import { Target, Wallet, AlertCircle, Clock, BarChart } from 'lucide-react';
import { QuestionConfig, AnswersType } from './types';

export const financialQuestions: QuestionConfig = {
  financialGoals: {
    type: 'multiselect',
    answerKey: 'financialGoals',
    icon: Target,
    data: {
      question: 'Quais são seus principais objetivos financeiros?',
      minSelections: 1,
      options: [
        { 
          id: 'wealth-building', 
          text: 'Acumular patrimônio',
          description: 'Crescimento sustentável com estratégia de longo prazo'
        },
        { 
          id: 'passive-income', 
          text: 'Gerar renda passiva',
          description: 'Criar fluxos de receita recorrentes com investimentos'
        },
        { 
          id: 'specific-goal', 
          text: 'Economizar para objetivo específico',
          description: 'Como imóvel, aposentadoria ou educação'
        },
        { 
          id: 'business-opportunity', 
          text: 'Identificar oportunidades de negócio',
          description: 'Encontrar e explorar novos empreendimentos'
        },
        { 
          id: 'debt-reduction', 
          text: 'Reduzir dívidas',
          description: 'Eliminar financiamentos e empréstimos'
        }
      ]
    },
    nextQuestions: (answers: AnswersType) => {
      const hasInvestment = answers.financialGoals?.includes('wealth-building') || 
                          answers.financialGoals?.includes('passive-income');
      const hasBusiness = answers.financialGoals?.includes('business-opportunity');
      
      const nextQuestions = [];
      
      if (hasInvestment) nextQuestions.push('financialHabitCommitment');
      else if (hasBusiness) nextQuestions.push('businessInterests');
      else nextQuestions.push('lifeGoals');
      
      return nextQuestions;
    }
  },
  financialHabitCommitment: {
    type: 'actionCommitment',
    answerKey: ['financialHabitCommitment', 'financialHabitTimeframe'],
    icon: Wallet,
    data: {
      title: "Compromisso com Hábito Financeiro",
      description: "Defina um hábito financeiro específico que você se comprometerá a manter:",
      actionCommitment: {
        title: "Meu compromisso financeiro",
        description: "Ex: Investir 10% da renda, revisar gastos semanalmente, estudar 30min/semana sobre investimentos",
        actionKey: "financialHabitCommitment",
        defaultAction: "Separar 20% da minha renda para investimentos antes de qualquer gasto",
        timeframeKey: "financialHabitTimeframe",
        defaultTimeframe: "12 meses"
      }
    },
    nextQuestions: ['riskTolerance']
  },
  riskTolerance: {
    type: 'single',
    answerKey: 'riskTolerance',
    icon: AlertCircle,
    data: {
      question: 'Qual é sua tolerância a risco em investimentos?',
      options: [
        { 
          id: 'conservative', 
          text: 'Conservador',
          description: 'Prefiro segurança mesmo com retornos menores'
        },
        { 
          id: 'moderate', 
          text: 'Moderado',
          description: 'Equilíbrio entre segurança e oportunidades de crescimento'
        },
        { 
          id: 'aggressive', 
          text: 'Agressivo',
          description: 'Aceito volatilidade em busca de retornos maiores'
        }
      ]
    },
    nextQuestions: ['investmentHorizon']
  },
  investmentHorizon: {
    type: 'single',
    answerKey: 'investmentHorizon',
    icon: Clock,
    data: {
      question: 'Qual é seu horizonte de investimento?',
      options: [
        { 
          id: 'short-term', 
          text: 'Curto prazo (até 2 anos)',
          description: 'Necessito de liquidez e acesso rápido aos recursos'
        },
        { 
          id: 'medium-term', 
          text: 'Médio prazo (2-5 anos)',
          description: 'Posso esperar alguns anos para resultados melhores'
        },
        { 
          id: 'long-term', 
          text: 'Longo prazo (mais de 5 anos)',
          description: 'Foco em crescimento consistente ao longo do tempo'
        }
      ]
    },
    nextQuestions: ['currentInvestments']
  },
  currentInvestments: {
    type: 'multiselect',
    answerKey: 'currentInvestments',
    icon: BarChart,
    data: {
      question: 'Quais tipos de investimentos você já possui?',
      minSelections: 0,
      options: [
        { id: 'savings', text: 'Poupança ou CDB' },
        { id: 'stocks', text: 'Ações' },
        { id: 'funds', text: 'Fundos de investimento' },
        { id: 'reits', text: 'Fundos imobiliários' },
        { id: 'crypto', text: 'Criptomoedas' },
        { id: 'real-estate', text: 'Imóveis' },
        { id: 'business', text: 'Participação em negócios' },
        { id: 'none', text: 'Ainda não possuo investimentos' }
      ]
    },
    nextQuestions: ['financialDetails']
  },
  financialDetails: {
    type: 'sliders',
    answerKey: ['monthlyIncome', 'monthlySavings'],
    icon: Wallet,
    data: {
      title: 'Detalhes Financeiros',
      sliders: [
        {
          label: 'Renda mensal aproximada',
          key: 'monthlyIncome',
          min: 1000,
          max: 50000,
          step: 1000,
          defaultValue: 5000,
          formatLabel: (value) => `R$ ${value.toLocaleString()}`
        },
        {
          label: 'Quanto consegue poupar por mês',
          key: 'monthlySavings',
          min: 0,
          max: 20000,
          step: 500,
          defaultValue: 1000,
          formatLabel: (value) => `R$ ${value.toLocaleString()}`
        }
      ]
    },
    nextQuestions: (answers: AnswersType) => {
      const hasBusiness = answers.financialGoals?.includes('business-opportunity');
      return hasBusiness ? ['businessInterests'] : ['lifeGoals'];
    }
  }
};