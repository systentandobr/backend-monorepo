'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionCard from '@/components/onboarding/QuestionCard';
import TimePicker from '@/components/onboarding/TimePicker';
import { Button } from '@/components/ui/button';

// Define o tipo para as respostas do usuário
interface UserAnswers {
  concentration: string;
  lifestyle: string;
  energy: string;
  wakeupTime: string;
  financialGoals: string;
  riskTolerance: string;
  investmentHorizon: string;
}

// Constantes para os IDs das perguntas
const QUESTIONS = {
  CONCENTRATION: 'concentration',
  LIFESTYLE: 'lifestyle',
  ENERGY: 'energy',
  WAKEUP_TIME: 'wakeupTime',
  FINANCIAL_GOALS: 'financialGoals',
  RISK_TOLERANCE: 'riskTolerance',
  INVESTMENT_HORIZON: 'investmentHorizon',
};

// Componente principal da página de onboarding
export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({
    concentration: '',
    lifestyle: '',
    energy: '',
    wakeupTime: '05:30',
    financialGoals: '',
    riskTolerance: '',
    investmentHorizon: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Total de passos no onboarding
  const totalSteps = 7;

  // Progresso do onboarding (0-100%)
  const progress = Math.round((currentStep / totalSteps) * 100);

  // Função para salvar uma resposta e avançar para o próximo passo
  const saveAnswer = (question: keyof UserAnswers, answer: string) => {
    setAnswers(prev => ({ ...prev, [question]: answer }));
    
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  // Finaliza o onboarding e redireciona para o dashboard
  const completeOnboarding = async () => {
    setIsLoading(true);
    
    try {
      // Aqui você poderia salvar os dados no backend/local storage
      // await api.saveOnboardingData(answers);
      
      // Simulando um tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redireciona para o dashboard após o processamento
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao finalizar onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Variantes para animações
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delayChildren: 0.3,
        staggerChildren: 0.2 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Conteúdo baseado no passo atual
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <QuestionCard
            question="Você acha difícil se concentrar?"
            options={[
              { 
                id: 'high-focus', 
                text: 'Não, eu me concentro quando necessário',
                visualIndicator: 'triangle'
              },
              { 
                id: 'medium-focus', 
                text: 'Às vezes eu perco meu foco',
              },
              { 
                id: 'low-focus', 
                text: 'Sim, eu me distraio facilmente',
              }
            ]}
            selectedOptionId={answers.concentration}
            onSelect={(optionId) => saveAnswer(QUESTIONS.CONCENTRATION, optionId)}
          />
        );
        
      case 1:
        return (
          <QuestionCard
            question="Quão satisfeito você está com seu estilo de vida atual?"
            options={[
              { 
                id: 'very-satisfied', 
                text: 'Completamente — me sinto muito ativo e com energia',
                visualIndicator: 'triangle'
              },
              { 
                id: 'somewhat-satisfied', 
                text: 'Um pouco — eu gostaria de ver alguma melhoria',
              },
              { 
                id: 'not-satisfied', 
                text: 'Nem um pouco — sou sedentário e gostaria de ver uma grande mudança',
              }
            ]}
            selectedOptionId={answers.lifestyle}
            onSelect={(optionId) => saveAnswer(QUESTIONS.LIFESTYLE, optionId)}
          />
        );
        
      case 2:
        return (
          <QuestionCard
            question="Qual é o seu nível de energia ao longo do dia?"
            options={[
              { 
                id: 'high-energy', 
                text: 'Alto — tenho energia ao longo do dia',
                visualIndicator: 'triangle'
              },
              { 
                id: 'medium-energy', 
                text: 'Médio — tenho explosões de energia',
              },
              { 
                id: 'low-energy', 
                text: 'Baixo — minha energia diminui ao longo do dia',
              }
            ]}
            selectedOptionId={answers.energy}
            onSelect={(optionId) => saveAnswer(QUESTIONS.ENERGY, optionId)}
          />
        );
        
      case 3:
        return (
          <TimePicker
            question="Que horas você costuma acordar?"
            onTimeSelected={(time) => saveAnswer(QUESTIONS.WAKEUP_TIME, time)}
            defaultTime={answers.wakeupTime}
          />
        );
        
      case 4:
        return (
          <QuestionCard
            question="Quais são seus principais objetivos financeiros?"
            options={[
              { 
                id: 'wealth-building', 
                text: 'Acumular patrimônio a longo prazo',
                description: 'Foco em crescimento sustentável com estratégia de longo prazo'
              },
              { 
                id: 'passive-income', 
                text: 'Gerar renda passiva',
                description: 'Criar fluxos de receita recorrentes com investimentos'
              },
              { 
                id: 'specific-goal', 
                text: 'Economizar para um objetivo específico',
                description: 'Como comprar um imóvel, aposentadoria ou educação'
              },
              { 
                id: 'business-opportunity', 
                text: 'Identificar oportunidades de negócio',
                description: 'Encontrar e explorar novos empreendimentos rentáveis'
              }
            ]}
            selectedOptionId={answers.financialGoals}
            onSelect={(optionId) => saveAnswer(QUESTIONS.FINANCIAL_GOALS, optionId)}
          />
        );
        
      case 5:
        return (
          <QuestionCard
            question="Qual é sua tolerância a risco em investimentos?"
            options={[
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
            ]}
            selectedOptionId={answers.riskTolerance}
            onSelect={(optionId) => saveAnswer(QUESTIONS.RISK_TOLERANCE, optionId)}
          />
        );
        
      case 6:
        return (
          <QuestionCard
            question="Qual é seu horizonte de investimento?"
            options={[
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
            ]}
            selectedOptionId={answers.investmentHorizon}
            onSelect={(optionId) => saveAnswer(QUESTIONS.INVESTMENT_HORIZON, optionId)}
          />
        );
        
      case 7:
        // Tela de processamento/finalização
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Criando seu programa personalizado...</h2>
            <div className="w-24 h-24 mx-auto mb-8 flex space-x-2">
              <div className="w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="w-6 h-6 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-6 h-6 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-gray-400">Analisando suas preferências e montando recomendações...</p>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-dark-background text-white flex flex-col">
      {/* Barra de progresso */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Status do app */}
      <div className="pt-8 px-6 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {currentStep < totalSteps ? `${currentStep + 1}/${totalSteps}` : ''}
        </div>
        
        {currentStep > 0 && currentStep < totalSteps && (
          <Button 
            variant="ghost" 
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="text-gray-400"
          >
            Voltar
          </Button>
        )}
      </div>
      
      {/* Conteúdo principal */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep}
          className="flex-1 flex items-center justify-center p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
