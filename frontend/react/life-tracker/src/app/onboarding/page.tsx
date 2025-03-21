'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { OnboardingProvider, useOnboardingContext } from '@/hooks/OnboardingProvider';
import { animations } from '@/utils/animations';

// Componentes para renderizar as perguntas
import QuestionCard from '@/components/onboarding/QuestionCard';
import TimePicker from '@/components/onboarding/TimePicker';
import SliderQuestion from '@/components/onboarding/SliderQuestion';
import MultiSelectCard from '@/components/onboarding/MultiSelectCard';
import ProfileGeneration from '@/components/onboarding/ProfileGeneration';
import MindsetScaleCard from '@/components/onboarding/MindsetScaleCard';
import ActionCommitmentCard from '@/components/onboarding/ActionCommitmentCard';

const OnboardingContent: React.FC = () => {
  const router = useRouter();
  const {
    currentQuestionId,
    currentQuestion,
    questionSequence,
    answers,
    isGeneratingProfile,
    userProfile,
    calculateProgress,
    goToNextQuestion,
    goToPreviousQuestion,
    updateAnswer,
    updateAnswers,
    completeOnboarding
  } = useOnboardingContext();

  if (!currentQuestion) return null;
  
  const IconComponent = currentQuestion.icon;
  
  // Renderização da pergunta atual baseada na configuração
  const renderQuestionContent = () => {
    switch (currentQuestion.type) {
      case 'profile':
        return (
          <motion.div
            className="text-center"
            variants={animations.containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 
              className="text-2xl font-bold text-white mb-6"
              variants={animations.itemVariants}
            >
              {currentQuestion.data.title}
            </motion.h2>
            
            {isGeneratingProfile ? (
              <motion.div 
                className="w-24 h-24 mx-auto mb-8"
                variants={animations.itemVariants}
              >
                <div className="flex space-x-2">
                  <div className="w-6 h-6 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-6 h-6 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-6 h-6 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </motion.div>
            ) : userProfile ? (
              <motion.div variants={animations.itemVariants}>
                <ProfileGeneration 
                  profile={userProfile} 
                  onContinue={() => router.push('/')} 
                />
              </motion.div>
            ) : (
              <motion.div variants={animations.itemVariants}>
                <Button 
                  onClick={completeOnboarding}
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-2 rounded-full"
                >
                  Gerar Meu Perfil
                </Button>
              </motion.div>
            )}
            
            <motion.p 
              className="text-gray-400 mt-4"
              variants={animations.itemVariants}
            >
              {currentQuestion.data.description}
            </motion.p>
          </motion.div>
        );
        
      case 'sliders':
        return (
          <div className="bg-dark-card p-6 rounded-xl max-w-md w-full">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <IconComponent className="text-primary" size={20} />
              </div>
              <h2 className="text-xl font-semibold">{currentQuestion.data.title}</h2>
            </div>
            
            {currentQuestion.data.description && (
              <p className="text-gray-400 mb-6">{currentQuestion.data.description}</p>
            )}
            
            {currentQuestion.data.sliders?.map((slider: any, index: number) => (
              <div key={index} className="mb-6">
                <label className="block text-gray-400 mb-2">{slider.label}</label>
                <SliderQuestion
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={answers[slider.key] || slider.defaultValue}
                  onChange={(value) => updateAnswer(slider.key as any, value)}
                  formatLabel={slider.formatLabel}
                />
              </div>
            ))}
            
            <Button 
              onClick={goToNextQuestion}
              className="w-full bg-primary hover:bg-primary-dark"
            >
              Continuar
            </Button>
          </div>
        );
        
      case 'timeRange':
        return (
          <div className="bg-dark-card p-6 rounded-xl max-w-md w-full">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <IconComponent className="text-primary" size={20} />
              </div>
              <h2 className="text-xl font-semibold">{currentQuestion.data.title}</h2>
            </div>
            
            {currentQuestion.data.timePickers?.map((picker: any, index: number) => (
              <div key={index} className="mb-6">
                <TimePicker
                  label={picker.label}
                  onTimeSelected={(time) => updateAnswer(picker.key as any, time)}
                  defaultTime={answers[picker.key] || picker.defaultValue}
                />
              </div>
            ))}
            
            <Button 
              onClick={goToNextQuestion}
              className="w-full bg-primary hover:bg-primary-dark"
            >
              Continuar
            </Button>
          </div>
        );
        
      case 'welcome':
        return (
          <motion.div 
            className="text-center max-w-lg"
            variants={animations.containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={animations.itemVariants}>
              <div className="w-24 h-24 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <IconComponent size={40} className="text-primary" />
              </div>
            </motion.div>
            
            <motion.h1 variants={animations.itemVariants} className="text-3xl font-bold mb-4">
              {currentQuestion.data.title}
            </motion.h1>
            
            <motion.p variants={animations.itemVariants} className="text-gray-400 mb-8">
              {currentQuestion.data.description}
            </motion.p>
            
            <motion.div variants={animations.itemVariants}>
              <Button 
                onClick={goToNextQuestion}
                className="bg-primary hover:bg-primary-dark text-white px-8 py-2 rounded-full"
              >
                Começar Jornada
              </Button>
            </motion.div>
          </motion.div>
        );
        
      case 'single':
        return (
          <QuestionCard
            icon={<IconComponent className="text-primary" size={28} />}
            question={currentQuestion.data.question || ''}
            options={currentQuestion.data.options || []}
            selectedOptionId={answers[currentQuestion.answerKey as string]}
            onSelect={(optionId) => {
              updateAnswer(currentQuestion.answerKey as string, optionId);
              goToNextQuestion();
            }}
          />
        );
        
      case 'multiselect':
        return (
          <MultiSelectCard
            icon={<IconComponent className="text-primary" size={28} />}
            question={currentQuestion.data.question || ''}
            options={currentQuestion.data.options || []}
            selectedOptions={answers[currentQuestion.answerKey as string] || []}
            minSelections={currentQuestion.data.minSelections || 1}
            onComplete={(selected) => {
              updateAnswer(currentQuestion.answerKey as string, selected);
              goToNextQuestion();
            }}
          />
        );

      case 'mindsetScale':
        return (
          <MindsetScaleCard
            icon={<IconComponent className="text-primary" size={28} />}
            question={currentQuestion.data.question || ''}
            description={currentQuestion.data.description || ''}
            scales={currentQuestion.data.mindsetScales || []}
            values={
              currentQuestion.answerKey ? 
                { [currentQuestion.answerKey as string]: answers[currentQuestion.answerKey as string] as number } : 
                {}
            }
            onChange={(key, value) => {
              updateAnswer(key as any, value);
            }}
            onComplete={() => goToNextQuestion()}
          />
        );

      case 'actionCommitment':
        if (
          Array.isArray(currentQuestion.answerKey) && 
          currentQuestion.data.actionCommitment &&
          currentQuestion.answerKey.length === 2
        ) {
          const [actionKey, timeframeKey] = currentQuestion.answerKey;
          return (
            <ActionCommitmentCard
              icon={<IconComponent className="text-primary" size={28} />}
              title={currentQuestion.data.title || ''}
              description={currentQuestion.data.description || ''}
              commitmentConfig={currentQuestion.data.actionCommitment}
              values={{
                action: answers[actionKey] as string,
                timeframe: answers[timeframeKey] as string
              }}
              onChange={(field, value) => {
                if (field === 'action') {
                  updateAnswer(actionKey as any, value);
                } else {
                  updateAnswer(timeframeKey as any, value);
                }
              }}
              onComplete={() => goToNextQuestion()}
            />
          );
        }
        return null;
        
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
          style={{ width: `${calculateProgress()}%` }}
        />
      </div>
      
      {/* Cabeçalho */}
      <div className="pt-8 px-6 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {currentQuestionId !== 'welcome' && currentQuestionId !== 'profileGeneration' ? 
            `${questionSequence.indexOf(currentQuestionId) + 1}/${questionSequence.length}` : ''}
        </div>
        
        {currentQuestionId !== 'welcome' && (
          <Button 
            variant="ghost" 
            onClick={goToPreviousQuestion}
            className="text-gray-400"
          >
            Voltar
          </Button>
        )}
      </div>
      
      {/* Conteúdo principal */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentQuestionId}
          className="flex-1 flex items-center justify-center p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderQuestionContent()}
        </motion.div>
      </AnimatePresence>      
    </main>
  );
};

// Página principal com o Provider
const OnboardingPage: React.FC = () => {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
};

export default OnboardingPage;