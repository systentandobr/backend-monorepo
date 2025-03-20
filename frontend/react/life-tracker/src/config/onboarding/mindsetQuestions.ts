import { CheckSquare, Shield, TrendingUp, Award, Zap, BookOpen, Heart, Compass, ArrowUpCircle, Clock } from 'lucide-react';
import { QuestionConfig } from './types';

export const mindsetQuestions: QuestionConfig = {
  mindsetConsistency: {
    type: 'mindsetScale',
    answerKey: 'consistencyMindset',
    icon: CheckSquare,
    data: {
      question: "Apareça, não importa o que - Sucesso não é sobre se sentir motivado todos os dias — é sobre aparecer consistentemente.",
      description: "A disciplina supera emoções passageiras como motivação. Como você se classifica neste aspecto?",
      mindsetScales: [
        {
          statement: "Quando não estou motivado...",
          key: "consistencyMindset",
          leftLabel: "Adio minhas tarefas",
          rightLabel: "Faço mesmo assim"
        }
      ]
    },
    nextQuestions: ['dailyHabitCommitment']
  },
  dailyHabitCommitment: {
    type: 'actionCommitment',
    answerKey: ['dailyHabitCommitment', 'dailyHabitTimeframe'],
    icon: Clock,
    data: {
      title: "Compromisso com a Consistência",
      description: "Defina uma prática diária pequena e inegociável que você se comprometerá a fazer todos os dias, não importa quão ocupado esteja:",
      actionCommitment: {
        title: "Meu compromisso diário inegociável",
        description: "Ex: 10 minutos de leitura, 5 minutos de meditação, 15 minutos de exercício",
        actionKey: "dailyHabitCommitment",
        defaultAction: "Farei 10 minutos de leitura todos os dias",
        timeframeKey: "dailyHabitTimeframe",
        defaultTimeframe: "30 dias"
      }
    },
    nextQuestions: ['mindsetFear']
  },
  mindsetFear: {
    type: 'mindsetScale',
    answerKey: 'fearlessMindset',
    icon: Shield,
    data: {
      question: "Faça com medo - O sucesso não é esperar até que você se sinta pronto — é agir apesar do medo.",
      description: "Os maiores avanços vêm quando entramos no desconforto. Como você lida com situações que provocam medo ou ansiedade?",
      mindsetScales: [
        {
          statement: "Quando sinto medo de uma nova situação...",
          key: "fearlessMindset",
          leftLabel: "Evito até me sentir preparado",
          rightLabel: "Avanço mesmo com desconforto"
        }
      ]
    },
    nextQuestions: ['comfortZoneChallenge']
  },
  comfortZoneChallenge: {
    type: 'single',
    answerKey: 'comfortZoneChallenge',
    icon: ArrowUpCircle,
    data: {
      question: "Identifique uma ação que você tem evitado por medo ou desconforto:",
      options: [
        { 
          id: 'speak-public', 
          text: 'Falar em público',
          description: 'Apresentações, reuniões ou networking'
        },
        { 
          id: 'financial-decision', 
          text: 'Tomar uma decisão financeira importante',
          description: 'Investir, mudar de emprego ou iniciar um negócio'
        },
        { 
          id: 'difficult-conversation', 
          text: 'Ter uma conversa difícil',
          description: 'Feedback, negociação ou resolução de conflitos'
        },
        { 
          id: 'learn-skill', 
          text: 'Aprender uma nova habilidade desafiadora',
          description: 'Programação, idioma ou habilidade técnica'
        },
        { 
          id: 'share-work', 
          text: 'Compartilhar meu trabalho publicamente',
          description: 'Publicar conteúdo, mostrar projetos ou pedir feedback'
        },
        { 
          id: 'custom', 
          text: 'Outro (escreva abaixo)',
          description: 'Uma situação específica que você está evitando'
        }
      ]
    },
    nextQuestions: ['mindsetComparison']
  },
  mindsetComparison: {
    type: 'mindsetScale',
    answerKey: 'selfCompetitionMindset',
    icon: TrendingUp,
    data: {
      question: "Não olhe para os lados - Sua única competição é quem você era ontem.",
      description: "Comparar-se com os outros é uma maneira infalível de perder o foco e a confiança. Como você lida com comparações?",
      mindsetScales: [
        {
          statement: "Quando vejo o sucesso dos outros...",
          key: "selfCompetitionMindset",
          leftLabel: "Me sinto inferior ou desmotivado",
          rightLabel: "Foco no meu próprio progresso"
        }
      ]
    },
    nextQuestions: ['mindsetChallenges']
  },
  mindsetChallenges: {
    type: 'mindsetScale',
    answerKey: 'challengesMindset',
    icon: Award,
    data: {
      question: "Escolha Difícil ou a Vida Escolherá por Você - Escolher difícil hoje cria um amanhã mais fácil.",
      description: "Enfrentar desafios de frente desenvolve coragem e determinação. Como você lida com as escolhas difíceis?",
      mindsetScales: [
        {
          statement: "Quando confrontado com uma tarefa desafiadora...",
          key: "challengesMindset",
          leftLabel: "Procrastino ou evito",
          rightLabel: "Encaro de frente imediatamente"
        }
      ]
    },
    nextQuestions: ['procrastinationChallenge']
  },
  procrastinationChallenge: {
    type: 'single',
    answerKey: 'procrastinationChallenge',
    icon: Clock,
    data: {
      question: "Qual tarefa importante você tem procrastinado que, se resolvida, traria benefícios significativos?",
      options: [
        { 
          id: 'organize-finances', 
          text: 'Organizar minhas finanças',
          description: 'Planejar orçamento, revisar investimentos ou reduzir dívidas'
        },
        { 
          id: 'business-plan', 
          text: 'Desenvolver plano de negócios',
          description: 'Estruturar ideias, pesquisar mercado ou definir estratégias'
        },
        { 
          id: 'improve-skills', 
          text: 'Aprimorar minhas habilidades técnicas',
          description: 'Estudar, praticar ou buscar certificações'
        },
        { 
          id: 'health-routine', 
          text: 'Estabelecer rotina de saúde',
          description: 'Exercícios, alimentação ou sono adequado'
        },
        { 
          id: 'network-connections', 
          text: 'Expandir rede de contatos',
          description: 'Networking profissional ou parcerias estratégicas'
        },
        { 
          id: 'custom', 
          text: 'Outro (escreva abaixo)',
          description: 'Uma tarefa específica que você está postergando'
        }
      ]
    },
    nextQuestions: ['mindsetFailure']
  },
  mindsetFailure: {
    type: 'mindsetScale',
    answerKey: 'failureViewMindset',
    icon: Zap,
    data: {
      question: "Errar o alvo não é um fracasso - O fracasso fornece feedback que afia sua estratégia.",
      description: "Como você vê as situações em que não alcança seus objetivos iniciais?",
      mindsetScales: [
        {
          statement: "Quando não atinjo um objetivo...",
          key: "failureViewMindset",
          leftLabel: "Me sinto derrotado e desisto",
          rightLabel: "Extraio aprendizados e ajusto"
        }
      ]
    },
    nextQuestions: ['mindsetReflection']
  },
  mindsetReflection: {
    type: 'mindsetScale',
    answerKey: 'progressReflectionMindset',
    icon: BookOpen,
    data: {
      question: "Olhe para trás com frequência - Reflita sobre o progresso passado e deixe que ele o motive a continuar.",
      description: "Reconhecer seu progresso promove gratidão e confiança. Com que frequência você reflete sobre suas conquistas?",
      mindsetScales: [
        {
          statement: "Quanto à reflexão sobre minhas conquistas...",
          key: "progressReflectionMindset",
          leftLabel: "Raramente observo meu progresso",
          rightLabel: "Celebro regularmente minhas vitórias"
        }
      ]
    },
    nextQuestions: ['dailyReflection']
  },
  dailyReflection: {
    type: 'single',
    answerKey: 'dailyReflection',
    icon: BookOpen,
    data: {
      question: "Qual método de reflexão você se compromete a incorporar na sua rotina?",
      options: [
        { 
          id: 'journal', 
          text: 'Diário de gratidão/conquistas',
          description: 'Registrar 3 conquistas diárias, por menores que sejam'
        },
        { 
          id: 'weekly-review', 
          text: 'Revisão semanal estruturada',
          description: 'Analisar progressos, aprendizados e ajustar planos'
        },
        { 
          id: 'data-tracking', 
          text: 'Acompanhamento de métricas',
          description: 'Monitorar números-chave de finanças, negócios ou hábitos'
        },
        { 
          id: 'mentorship', 
          text: 'Feedback regular de mentor',
          description: 'Conversas periódicas sobre progresso e desenvolvimento'
        },
        { 
          id: 'visual-progress', 
          text: 'Mapa visual de progresso',
          description: 'Representação gráfica de conquistas e marcos'
        }
      ]
    },
    nextQuestions: ['mindsetListening']
  },
  mindsetListening: {
    type: 'mindsetScale',
    answerKey: 'listeningMindset',
    icon: Heart,
    data: {
      question: "Saiba quando ficar em silêncio - O silêncio cria espaço para observação e compreensão.",
      description: "A força nem sempre é alta. Parar para ouvir e refletir constrói inteligência emocional. Como você lida com situações sociais?",
      mindsetScales: [
        {
          statement: "Em conversas importantes...",
          key: "listeningMindset",
          leftLabel: "Falo mais do que escuto",
          rightLabel: "Escuto atentamente antes de falar"
        }
      ]
    },
    nextQuestions: ['mindsetUncertainty']
  },
  mindsetUncertainty: {
    type: 'mindsetScale',
    answerKey: 'uncertaintyMindset',
    icon: Compass,
    data: {
      question: "Abrace o Desconhecido - Avanços geralmente vêm da exploração de territórios desconhecidos.",
      description: "Pessoas de alto desempenho prosperam na incerteza. Como você reage a situações novas e ambíguas?",
      mindsetScales: [
        {
          statement: "Diante de situações incertas ou ambíguas...",
          key: "uncertaintyMindset",
          leftLabel: "Busco segurança e previsibilidade",
          rightLabel: "Vejo oportunidades de crescimento"
        }
      ]
    },
    nextQuestions: ['concentration']
  }
};