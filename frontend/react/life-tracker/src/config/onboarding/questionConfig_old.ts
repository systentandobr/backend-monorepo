import { 
  Activity, AlertCircle, ArrowRight, BarChart, Brain, Clock, 
  Compass, Heart, Lightbulb, Target, User, Wallet
} from 'lucide-react';

export type QuestionType = 'welcome' | 'single' | 'multiselect' | 'timeRange' | 'sliders' | 'profile';

export type Option = {
  id: string;
  text: string;
  description?: string;
  visualIndicator?: 'triangle';
};

export type TimePickerConfig = {
  label: string;
  key: string;
  defaultValue: string;
};

export type SliderConfig = {
  label?: string;
  key: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  formatLabel: (value: number) => string;
};

export type QuestionData = {
  title?: string;
  question?: string;
  description?: string;
  options?: Option[];
  minSelections?: number;
  timePickers?: TimePickerConfig[];
  sliders?: SliderConfig[];
};

export type NextQuestionsFunction = (answers: any) => string[];

export type QuestionDefinition = {
  type: QuestionType;
  answerKey?: string | string[];
  icon: any;
  data: QuestionData;
  nextQuestions: string[] | NextQuestionsFunction;
};

export type QuestionConfig = {
  [key: string]: QuestionDefinition;
};

export type AnswersType = {
  concentration?: string;
  lifestyle?: string;
  energy?: string;
  wakeupTime?: string;
  sleepTime?: string;
  personalInterests?: string[];
  financialGoals?: string[];
  riskTolerance?: string;
  investmentHorizon?: string;
  currentInvestments?: string[];
  monthlyIncome?: number;
  monthlySavings?: number;
  lifeGoals?: string[];
  businessInterests?: string[];
  learningAreas?: string[];
  entrepreneurProfile?: string;
  timeAvailability?: number;
  investmentCapacity?: string;
  [key: string]: any;
};

export const questionConfig: QuestionConfig = {
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
    nextQuestions: ['concentration']
  },
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
  },
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
      
      if (hasInvestment) nextQuestions.push('riskTolerance');
      else if (hasBusiness) nextQuestions.push('businessInterests');
      else nextQuestions.push('lifeGoals');
      
      return nextQuestions;
    }
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
  },
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
  },
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
    nextQuestions: ['profileGeneration']
  },
  profileGeneration: {
    type: 'profile',
    icon: User,
    data: {
      title: 'Criando seu perfil personalizado',
      description: 'Analisando suas respostas e gerando recomendações...'
    },
    nextQuestions: []
  }
};