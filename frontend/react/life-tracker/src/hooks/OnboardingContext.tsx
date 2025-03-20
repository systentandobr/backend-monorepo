import React, { createContext, useContext, ReactNode } from 'react';
import { AnswersType } from '@/config/onboarding/types';
import { ModuleManager } from '@/config/onboarding/moduleManager';
import { questionConfig } from '@/config/onboarding';
import { UserProfile } from '@/types/userProfile';

// Cria o ModuleManager padrão com todas as questões
const defaultModuleManager = new ModuleManager([questionConfig]);

// Defina explicitamente o tipo do contexto
type OnboardingContextType = {
  currentQuestionId: string;
  currentQuestion: any;
  questionSequence: string[];
  stepHistory: string[];
  answers: AnswersType;
  isGeneratingProfile: boolean;
  userProfile: UserProfile | null;
  calculateProgress: () => number;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  jumpToQuestion: (questionId: string) => void;
  updateAnswer: <K extends keyof AnswersType>(key: K, value: AnswersType[K]) => void;
  updateAnswers: (newAnswers: Partial<AnswersType>) => void;
  completeOnboarding: () => Promise<UserProfile>;
  moduleManager: ModuleManager;
};

// Crie o contexto com um valor default que evita erros de nulo
const defaultContextValue: OnboardingContextType = {
  currentQuestionId: 'welcome',
  currentQuestion: null,
  questionSequence: ['welcome'],
  stepHistory: ['welcome'],
  answers: {},
  isGeneratingProfile: false,
  userProfile: null,
  calculateProgress: () => 0,
  goToNextQuestion: () => {},
  goToPreviousQuestion: () => {},
  jumpToQuestion: () => {},
  updateAnswer: () => {},
  updateAnswers: () => {},
  completeOnboarding: async () => ({} as UserProfile),
  moduleManager: defaultModuleManager
};

// Crie o contexto
export const OnboardingContext = createContext<OnboardingContextType>(defaultContextValue);

// Hook customizado para usar o contexto
export const useOnboardingContext = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingContext deve ser usado dentro de OnboardingProvider');
  }
  return context;
};

// Props do Provider
interface OnboardingProviderProps {
  children: ReactNode;
  value: OnboardingContextType;
}

// Provider como um componente separado
export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children, value }) => {
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};