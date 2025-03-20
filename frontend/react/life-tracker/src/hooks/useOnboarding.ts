import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnswersType } from '@/config/onboarding/types';
import { ModuleManager } from '@/config/onboarding/moduleManager';
import { profileGeneratorService } from '@/services/profileGeneratorService';
import { UserProfile } from '@/types/userProfile';

// Tipado explicitamente para corresponder com o OnboardingContext
export function useOnboarding(
  moduleManager: ModuleManager,
  initialQuestionId: string = 'welcome'
) {
  const router = useRouter();
  const [currentQuestionId, setCurrentQuestionId] = useState(initialQuestionId);
  const [questionSequence, setQuestionSequence] = useState([initialQuestionId]);
  const [stepHistory, setStepHistory] = useState([initialQuestionId]);
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
    // Novos campos para mindset
    consistencyMindset: 5,
    fearlessMindset: 5,
    selfCompetitionMindset: 5,
    challengesMindset: 5,
    failureViewMindset: 5,
    progressReflectionMindset: 5,
    listeningMindset: 5,
    uncertaintyMindset: 5,
    // Campos para compromissos
    dailyHabitCommitment: '',
    dailyHabitTimeframe: '30 dias',
    financialHabitCommitment: '',
    financialHabitTimeframe: '12 meses',
    learningHabitCommitment: '',
    learningHabitTimeframe: '60 dias',
    businessHabitCommitment: '',
    businessHabitTimeframe: '90 dias',
  });

  // Atualiza sequência de perguntas quando certas respostas mudam
  useEffect(() => {
    // Questões que podem modificar a sequência do fluxo
    const triggerQuestions = ['financialGoals', 'financialDetails', 'mindsetConsistency'];
    
    if (triggerQuestions.includes(currentQuestionId)) {
      const remainingSequence = generateRemainingSequence(currentQuestionId, answers);
      setQuestionSequence([...stepHistory, ...remainingSequence]);
    }
  }, [
    answers.financialGoals, 
    answers.consistencyMindset,
    answers.fearlessMindset,
    currentQuestionId, 
    stepHistory
  ]);

  // Gera a sequência restante de perguntas baseada nas respostas atuais
  const generateRemainingSequence = (startId: string, currentAnswers: AnswersType): string[] => {
    const sequence: string[] = [];
    let currentId = startId;
    const visited = new Set<string>();
    
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      
      const questionDef = moduleManager.getQuestion(currentId);
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
    const fullSequence = generateRemainingSequence(initialQuestionId, answers);
    setQuestionSequence([initialQuestionId, ...fullSequence]);
  }, [moduleManager, initialQuestionId]);

  // Função para atualizar uma resposta específica
  const updateAnswer = <K extends keyof AnswersType>(key: K, value: AnswersType[K]) => {
    setAnswers(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Função para atualizar múltiplas respostas ao mesmo tempo
  const updateAnswers = (newAnswers: Partial<AnswersType>) => {
    setAnswers(prev => ({
      ...prev,
      ...newAnswers
    }));
  };

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

  // Pula para uma questão específica
  const jumpToQuestion = (questionId: string) => {
    if (questionSequence.includes(questionId)) {
      setCurrentQuestionId(questionId);
      // Atualiza o histórico para incluir todas as perguntas até esta
      const newHistory = [];
      for (const id of questionSequence) {
        newHistory.push(id);
        if (id === questionId) break;
      }
      setStepHistory(newHistory);
    }
  };

  // Calcula o progresso atual
  const calculateProgress = (): number => {
    if (currentQuestionId === initialQuestionId) return 0;
    if (currentQuestionId === 'profileGeneration') return 100;
    
    const currentIndex = questionSequence.indexOf(currentQuestionId);
    // Exclui welcome e profileGeneration do cálculo
    const totalQuestions = questionSequence.length - 2;
    // Ajusta o índice para excluir a pergunta inicial
    const adjustedIndex = currentIndex - 1;
    
    // Garante que o progresso esteja entre 0 e 100
    return Math.max(0, Math.min(100, Math.round((adjustedIndex / totalQuestions) * 100)));
  };

  // Completa o onboarding e gera o perfil do usuário
  const completeOnboarding = async (): Promise<UserProfile> => {
    setIsGeneratingProfile(true);
    try {
      // Chamada ao serviço de geração de perfil
      const profile = await profileGeneratorService.generateProfile(answers);
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('Erro ao gerar perfil:', error);
      throw error;
    } finally {
      setIsGeneratingProfile(false);
    }
  };

  // Retorna a questão atual com base no ID
  const getCurrentQuestion = () => {
    return moduleManager.getQuestion(currentQuestionId);
  };

  return {
    currentQuestionId,
    currentQuestion: getCurrentQuestion(),
    questionSequence,
    stepHistory,
    answers,
    isGeneratingProfile,
    userProfile,
    calculateProgress,
    goToNextQuestion,
    goToPreviousQuestion,
    jumpToQuestion,
    updateAnswer,
    updateAnswers,
    completeOnboarding,
    moduleManager
  };
}