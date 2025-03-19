import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { questionConfig, AnswersType, QuestionDefinition } from '@/config/onboarding/questionConfig';
import { profileGeneratorService } from '@/services/profileGeneratorService';

export type UserProfile = {
  personalType: string;
  financialProfile: string;
  entrepreneurType: string;
  recommendedFocus: string[];
  suggestedHabits: {name: string, category: string, frequency: string}[];
  suggestedInvestments: {type: string, allocation: number, risk: string}[];
  suggestedBusinessOpportunities: {name: string, investmentLevel: string, timeRequired: string}[];
  strengths: string[];
  weaknesses: string[];
  recommendations: {
    personal: string[];
    financial: string[];
    career: string[];
  };
};

export function useOnboarding() {
  const router = useRouter();
  const [currentQuestionId, setCurrentQuestionId] = useState('welcome');
  const [questionSequence, setQuestionSequence] = useState(['welcome']);
  const [stepHistory, setStepHistory] = useState(['welcome']);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Inicializa respostas com valores padrão
  const [answers, setAnswers] = useState<AnswersType>({
    concentration: '',
    lifestyle: '',
    energy: '',
    wakeupTime: '07:00',
    sleepTime: '23:00',
    personalInterests: [],
    financialGoals: [],
    riskTolerance: '',
    investmentHorizon: '',
    currentInvestments: [],
    monthlyIncome: 5000,
    monthlySavings: 1000,
    lifeGoals: [],
    businessInterests: [],
    learningAreas: [],
    entrepreneurProfile: '',
    timeAvailability: 10,
    investmentCapacity: '',
  });

  // Atualiza sequência de perguntas quando certas respostas mudam
  useEffect(() => {
    if (currentQuestionId === 'financialGoals' || currentQuestionId === 'financialDetails') {
      const remainingSequence = generateRemainingSequence(currentQuestionId, answers);
      setQuestionSequence([...stepHistory, ...remainingSequence]);
    }
  }, [answers.financialGoals, currentQuestionId, stepHistory]);

  // Gera a sequência restante de perguntas baseada nas respostas atuais
  const generateRemainingSequence = (startId: string, currentAnswers: AnswersType): string[] => {
    const sequence: string[] = [];
    let currentId = startId;
    const visited = new Set<string>();
    
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      
      const questionDef = questionConfig[currentId];
      if (!questionDef) break;
      
      // Determina a próxima pergunta com base na configuração e respostas
      let nextQuestionIds: string[];
      if (typeof questionDef.nextQuestions === 'function') {
        nextQuestionIds = questionDef.nextQuestions(currentAnswers);
      } else {
        nextQuestionIds = questionDef.nextQuestions;
      }
      
      // Adiciona apenas a primeira próxima pergunta à sequência
      if (nextQuestionIds && nextQuestionIds.length > 0) {
        currentId = nextQuestionIds[0];
        sequence.push(currentId);
      } else {
        break;
      }
    }
    
    return sequence;
  };

  // Gera a sequência completa de perguntas
  useEffect(() => {
    const fullSequence = generateRemainingSequence('welcome', answers);
    setQuestionSequence(['welcome', ...fullSequence]);
  }, []);

  // Avança para a próxima pergunta
  const goToNextQuestion = () => {
    const currentIndex = questionSequence.indexOf(currentQuestionId);
    if (currentIndex < questionSequence.length - 1) {
      const nextId = questionSequence[currentIndex + 1];
      setCurrentQuestionId(nextId);
      setStepHistory([...stepHistory, nextId]);
    }
  };

  // Volta para a pergunta anterior
  const goToPreviousQuestion = () => {
    if (stepHistory.length > 1) {
      const newHistory = [...stepHistory];
      newHistory.pop();
      const previousId = newHistory[newHistory.length - 1];
      setCurrentQuestionId(previousId);
      setStepHistory(newHistory);
    }
  };

  // Calcula o progresso atual
  const calculateProgress = (): number => {
    if (currentQuestionId === 'welcome') return 0;
    if (currentQuestionId === 'profileGeneration') return 100;
    
    const currentIndex = questionSequence.indexOf(currentQuestionId);
    // Exclui welcome e profileGeneration do cálculo
    const totalQuestions = questionSequence.length - 2;
    // Ajusta o índice para excluir a pergunta welcome
    const adjustedIndex = currentIndex - 1;
    
    return Math.round((adjustedIndex / totalQuestions) * 100);
  };

  // Completa o onboarding e gera o perfil do usuário
  const completeOnboarding = async () => {
    setIsGeneratingProfile(true);
    try {
      // Aqui seria feita uma chamada ao serviço de geração de perfil
      const profile = await profileGeneratorService.generateProfile(answers);
      setUserProfile(profile);
    } catch (error) {
      console.error('Erro ao gerar perfil:', error);
      // Implementar tratamento de erro aqui
    } finally {
      setIsGeneratingProfile(false);
    }
  };

  return {
    currentQuestionId,
    questionSequence,
    stepHistory,
    answers,
    isGeneratingProfile,
    userProfile,
    calculateProgress,
    goToNextQuestion,
    goToPreviousQuestion,
    setAnswers,
    completeOnboarding
  };
}