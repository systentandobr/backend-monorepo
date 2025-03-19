'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/hooks/useOnboarding';
import { questionConfig } from '@/config/onboarding/questionConfig';
import { animations } from '@/utils/animations';

// Componentes necessários para renderizar as perguntas
import QuestionCard from '@/components/onboarding/QuestionCard';
import TimePicker from '@/components/onboarding/TimePicker';
import SliderQuestion from '@/components/onboarding/SliderQuestion';
import MultiSelectCard from '@/components/onboarding/MultiSelectCard';
import ProfileGeneration from '@/components/onboarding/ProfileGeneration';

const OnboardingPage: React.FC = () => {
  const router = useRouter();
  const {
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
  } = useOnboarding();

  // Renderização da pergunta atual baseada na configuração
  const renderQuestionContent = () => {
    const questionDef = questionConfig[currentQuestionId];
    if (!questionDef) return null;
    
    const IconComponent = questionDef.icon;
    
    switch (questionDef.type) {
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
              {questionDef.data.title}
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
              {questionDef.data.description}
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
              <h2 className="text-xl font-semibold">{questionDef.data.title}</h2>
            </div>
            
            {questionDef.data.description && (
              <p className="text-gray-400 mb-6">{questionDef.data.description}</p>
            )}
            
            {questionDef.data.sliders?.map((slider, index) => (
              <div key={index} className="mb-6">
                <label className="block text-gray-400 mb-2">{slider.label}</label>
                <SliderQuestion
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={answers[slider.key] || slider.defaultValue}
                  onChange={(value) => setAnswers(prev => ({ ...prev, [slider.key]: value }))}
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
              <h2 className="text-xl font-semibold">{questionDef.data.title}</h2>
            </div>
            
            {questionDef.data.timePickers?.map((picker, index) => (
              <div key={index} className="mb-6">
                <TimePicker
                  label={picker.label}
                  onTimeSelected={(time) => setAnswers(prev => ({ ...prev, [picker.key]: time }))}
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
              {questionDef.data.title}
            </motion.h1>
            
            <motion.p variants={animations.itemVariants} className="text-gray-400 mb-8">
              {questionDef.data.description}
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
            question={questionDef.data.question || ''}
            options={questionDef.data.options || []}
            selectedOptionId={answers[questionDef.answerKey as string]}
            onSelect={(optionId) => {
              setAnswers(prev => ({ ...prev, [questionDef.answerKey as string]: optionId }));
              goToNextQuestion();
            }}
          />
        );
        
      case 'multiselect':
        return (
          <MultiSelectCard
            icon={<IconComponent className="text-primary" size={28} />}
            question={questionDef.data.question || ''}
            options={questionDef.data.options || []}
            selectedOptions={answers[questionDef.answerKey as string] || []}
            minSelections={questionDef.data.minSelections || 1}
            onComplete={(selected) => {
              setAnswers(prev => ({ ...prev, [questionDef.answerKey as string]: selected }));
              goToNextQuestion();
            }}
          />
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

export default OnboardingPage;