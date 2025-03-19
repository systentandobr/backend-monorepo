// src/components/onboarding/ProfileGeneration.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Target, BarChart, Briefcase, ArrowRight } from 'lucide-react';

// Interface para o perfil do usuário
interface UserProfile {
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
}

interface ProfileGenerationProps {
  profile: UserProfile;
  onContinue: () => void;
}

// Ícones para categorias
const categoryIcons: Record<string, React.ReactNode> = {
  'Bem-estar': <User size={16} className="text-green-400" />,
  'Educação': <Target size={16} className="text-blue-400" />,
  'Finanças': <BarChart size={16} className="text-yellow-400" />,
  'Empreendimento': <Briefcase size={16} className="text-purple-400" />
};

// Estilos para níveis de risco
const riskStyles: Record<string, string> = {
  'Baixo': 'bg-green-500 bg-opacity-20 text-green-500',
  'Médio': 'bg-yellow-500 bg-opacity-20 text-yellow-500',
  'Alto': 'bg-red-500 bg-opacity-20 text-red-500'
};

// Componente principal
const ProfileGeneration: React.FC<ProfileGenerationProps> = ({ profile, onContinue }) => {
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-center mb-8">Seu Perfil Personalizado</h1>
      </motion.div>

      {/* Seção de perfil pessoal */}
      <motion.div variants={itemVariants} className="mb-8">
        <Card className="bg-dark-card p-6 border-none shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <User size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Perfil Pessoal</h2>
              <p className="text-gray-400 text-sm">Baseado em suas características e preferências</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-dark-background p-4 rounded-lg">
              <h3 className="font-medium text-gray-300 mb-1">Tipo Pessoal</h3>
              <p className="text-lg font-semibold text-primary">{profile.personalType}</p>
            </div>
            <div className="bg-dark-background p-4 rounded-lg">
              <h3 className="font-medium text-gray-300 mb-1">Perfil Financeiro</h3>
              <p className="text-lg font-semibold text-yellow-400">{profile.financialProfile}</p>
            </div>
            <div className="bg-dark-background p-4 rounded-lg">
              <h3 className="font-medium text-gray-300 mb-1">Tipo Empreendedor</h3>
              <p className="text-lg font-semibold text-blue-400">{profile.entrepreneurType}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-gray-300 mb-3">Recomendações de Foco</h3>
            <div className="flex flex-wrap gap-2">
              {profile.recommendedFocus.map((focus, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 rounded-full bg-primary bg-opacity-20 text-primary text-sm"
                >
                  {focus}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Seção de hábitos */}
      <motion.div variants={itemVariants} className="mb-8">
        <Card className="bg-dark-card p-6 border-none shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <Target size={24} className="text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Hábitos Recomendados</h2>
              <p className="text-gray-400 text-sm">Baseado em seus objetivos e perfil</p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {profile.suggestedHabits.map((habit, index) => (
              <div key={index} className="bg-dark-background p-4 rounded-lg flex items-center">
                <div className="mr-3">
                  {categoryIcons[habit.category] || <Target size={16} className="text-primary" />}
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium text-white">{habit.name}</h3>
                  <div className="flex items-center text-sm text-gray-400">
                    <span>{habit.category}</span>
                    <span className="mx-2">•</span>
                    <span>{habit.frequency}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  <ArrowRight size={16} />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Seção de investimentos */}
      <motion.div variants={itemVariants} className="mb-8">
        <Card className="bg-dark-card p-6 border-none shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-yellow-500 bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <BarChart size={24} className="text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Sugestões de Investimentos</h2>
              <p className="text-gray-400 text-sm">Baseado no seu perfil de risco e objetivos</p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {profile.suggestedInvestments.map((investment, index) => (
              <div key={index} className="bg-dark-background p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-white">{investment.type}</h3>
                  <span className={`text-sm px-2 py-1 rounded-full ${riskStyles[investment.risk]}`}>
                    {investment.risk}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${investment.allocation}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>Alocação</span>
                    <span>{investment.allocation}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Seção de oportunidades de negócio */}
      {profile.suggestedBusinessOpportunities.length > 0 && (
        <motion.div variants={itemVariants} className="mb-8">
          <Card className="bg-dark-card p-6 border-none shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <Briefcase size={24} className="text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Oportunidades de Negócio</h2>
                <p className="text-gray-400 text-sm">Baseado nos seus interesses empreendedores</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {profile.suggestedBusinessOpportunities.map((opportunity, index) => (
                <div key={index} className="bg-dark-background p-4 rounded-lg">
                  <h3 className="font-medium text-white mb-2">{opportunity.name}</h3>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="inline-block px-2 py-1 rounded-full bg-yellow-500 bg-opacity-20 text-yellow-500">
                      Investimento: {opportunity.investmentLevel}
                    </span>
                    <span className="inline-block px-2 py-1 rounded-full bg-blue-500 bg-opacity-20 text-blue-500">
                      Tempo: {opportunity.timeRequired}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Botão para continuar */}
      <motion.div variants={itemVariants} className="text-center">
        <Button
          onClick={onContinue}
          className="bg-primary hover:bg-primary-dark text-white px-8 py-6 rounded-full text-lg"
        >
          Explorar Meu Dashboard
          <ArrowRight size={20} className="ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ProfileGeneration;
