import React, { ReactNode } from 'react';
import { OnboardingContext, OnboardingProvider as BaseProvider } from './OnboardingContext';
import { useOnboarding } from './useOnboarding';
import { ModuleManager } from '@/config/onboarding/moduleManager';
import { questionConfig } from '@/config/onboarding';

// Cria o ModuleManager padrão com todas as questões
const defaultModuleManager = new ModuleManager([questionConfig]);

// Props para o Provider Wrapper
interface OnboardingProviderProps {
  children: ReactNode;
  moduleManager?: ModuleManager;
  initialQuestionId?: string;
}

// Wrapper que combina o hook useOnboarding com o Provider
export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
  moduleManager = defaultModuleManager,
  initialQuestionId = 'welcome'
}) => {
  const onboarding = useOnboarding(moduleManager, initialQuestionId);

  return (
    <BaseProvider value={onboarding}>
      {children}
    </BaseProvider>
  );
};

// Re-exporta o context hook para fácil acesso
export { useOnboardingContext } from './OnboardingContext';

// Função para criar um fluxo personalizado de onboarding
export const createCustomOnboardingFlow = (
  modules: Record<string, any>[],
  startQuestionId: string = 'welcome'
): {
  moduleManager: ModuleManager;
  initialQuestionId: string;
} => {
  return {
    moduleManager: new ModuleManager(modules),
    initialQuestionId: startQuestionId
  };
};