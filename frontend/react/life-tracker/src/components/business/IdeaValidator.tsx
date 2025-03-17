'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Lightbulb, 
  Users, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Send,
  ThumbsUp,
  ThumbsDown,
  Zap,
  BarChart2
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface IdeaValidatorProps {
  className?: string;
}

// Tipos de validação
type ValidationStep = 'problem' | 'solution' | 'market' | 'business-model' | 'mvp' | 'feedback';

// Interface para uma ideia de negócio
interface BusinessIdea {
  id: string;
  name: string;
  description: string;
  problemStatement: string;
  targetAudience: string;
  solutionDescription: string;
  valueProposition: string;
  uniqueSellingPoints: string[];
  marketSize: string;
  competitors: string[];
  businessModel: string;
  revenueStreams: string[];
  costStructure: string[];
  mvpFeatures: string[];
  validationScore: number;
  validationSteps: Record<ValidationStep, {
    completed: boolean;
    score: number;
    feedback: string;
  }>;
}

export const IdeaValidator: React.FC<IdeaValidatorProps> = ({
  className
}) => {
  // Estados para controle do componente
  const [activeStep, setActiveStep] = useState<ValidationStep>('problem');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Exemplo de uma ideia de negócio
  const [businessIdea, setBusinessIdea] = useState<BusinessIdea>({
    id: 'idea-1',
    name: 'Marketplace para Profissionais de Saúde Mental',
    description: 'Plataforma que conecta pacientes a psicólogos, psiquiatras e terapeutas para consultas online e presenciais.',
    problemStatement: 'Dificuldade de encontrar profissionais de saúde mental disponíveis, compatíveis com as necessidades do paciente e com valores acessíveis.',
    targetAudience: 'Pessoas entre 20-45 anos, que buscam cuidados com saúde mental, com acesso à internet e familiaridade com serviços digitais.',
    solutionDescription: 'Plataforma digital que facilita a busca, comparação e agendamento de consultas com profissionais de saúde mental, com filtros por especialidade, preço, disponibilidade e avaliações.',
    valueProposition: 'Encontre o profissional de saúde mental ideal para você em minutos, não em semanas.',
    uniqueSellingPoints: [
      'Sistema de matching inteligente baseado em necessidades e perfil',
      'Teleconsultas integradas na própria plataforma',
      'Preços transparentes e opções de planos de assinatura',
      'Acompanhamento contínuo entre sessões'
    ],
    marketSize: 'Mercado de saúde mental no Brasil estimado em R$ 5 bilhões anuais, com crescimento de 15% ao ano.',
    competitors: [
      'Doctoralia',
      'Zenklub',
      'Psicólogos da Internet',
      'Vittude'
    ],
    businessModel: 'Marketplace com comissão por agendamento (15%) e assinatura para profissionais premium (acesso a mais recursos).',
    revenueStreams: [
      'Comissão por consulta realizada (15%)',
      'Assinatura mensal para profissionais premium (R$ 99/mês)',
      'Planos de assinatura para empresas (EAP)',
      'Marketplace de cursos e conteúdos especializados'
    ],
    costStructure: [
      'Desenvolvimento e manutenção da plataforma',
      'Marketing para aquisição de usuários',
      'Suporte ao cliente e validação de profissionais',
      'Processamento de pagamentos (2-3%)',
      'Infraestrutura de servidores e videoconferência'
    ],
    mvpFeatures: [
      'Cadastro e perfil de profissionais',
      'Sistema de busca e filtros',
      'Agendamento de consultas',
      'Sistema de pagamento',
      'Videoconferência básica integrada'
    ],
    validationScore: 72,
    validationSteps: {
      'problem': {
        completed: true,
        score: 85,
        feedback: 'Problema bem definido e validado com pesquisa de mercado. Considere ampliar a pesquisa para grupos demográficos diversos.'
      },
      'solution': {
        completed: true,
        score: 80,
        feedback: 'Solução coerente com o problema identificado. Recomenda-se aprofundar na diferenciação em relação a concorrentes.'
      },
      'market': {
        completed: true,
        score: 75,
        feedback: 'Mercado com potencial significativo, mas considere segmentar melhor o público-alvo para estratégias mais direcionadas.'
      },
      'business-model': {
        completed: true,
        score: 70,
        feedback: 'Modelo de receita viável, mas atenção aos custos de aquisição de clientes que podem ser elevados neste setor.'
      },
      'mvp': {
        completed: false,
        score: 60,
        feedback: 'Features essenciais identificadas, mas falta priorização e roadmap para desenvolvimento.'
      },
      'feedback': {
        completed: false,
        score: 0,
        feedback: ''
      }
    }
  });

  // Perguntas de validação para cada etapa
  const validationQuestions: Record<ValidationStep, {title: string, questions: string[]}> = {
    'problem': {
      title: 'Validação do Problema',
      questions: [
        'O problema que você identificou é realmente uma dor para o público-alvo?',
        'Você já validou este problema com potenciais clientes?',
        'O problema é recorrente ou ocasional?',
        'As pessoas estão dispostas a pagar para resolver este problema?',
        'Como as pessoas resolvem este problema atualmente?'
      ]
    },
    'solution': {
      title: 'Validação da Solução',
      questions: [
        'Sua solução resolve o problema de forma eficaz?',
        'Qual é o diferencial competitivo da sua solução?',
        'Você já testou protótipos da solução com usuários reais?',
        'Sua solução é melhor que as alternativas existentes?',
        'Quais são os principais obstáculos para a adoção da sua solução?'
      ]
    },
    'market': {
      title: 'Validação de Mercado',
      questions: [
        'Qual é o tamanho do mercado para sua solução?',
        'Qual é a taxa de crescimento deste mercado?',
        'Quem são seus principais concorrentes?',
        'Qual é sua vantagem competitiva sustentável?',
        'Qual parcela do mercado você pretende capturar no curto e longo prazo?'
      ]
    },
    'business-model': {
      title: 'Validação do Modelo de Negócio',
      questions: [
        'Como sua empresa ganhará dinheiro?',
        'Qual é o preço ideal para seu produto/serviço?',
        'Quais são seus principais custos operacionais?',
        'Qual é a margem de lucro esperada?',
        'Em quanto tempo você espera atingir o ponto de equilíbrio?'
      ]
    },
    'mvp': {
      title: 'Validação do MVP',
      questions: [
        'Quais são as funcionalidades essenciais para o MVP?',
        'Como você medirá o sucesso do MVP?',
        'Qual é o prazo para desenvolvimento do MVP?',
        'Como você pretende obter feedback dos primeiros usuários?',
        'Quais métricas serão mais importantes para validar seu MVP?'
      ]
    },
    'feedback': {
      title: 'Feedbacks e Iterações',
      questions: [
        'Como você pretende coletar feedbacks dos usuários?',
        'Qual é seu plano para iterar o produto com base nos feedbacks?',
        'Como você identificará quais feedbacks priorizar?',
        'Qual é sua estratégia para reter os primeiros usuários?',
        'Como você irá escalar após a validação inicial?'
      ]
    }
  };

  // Toggle para expandir/colapsar seções
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Avançar para a próxima etapa
  const nextStep = () => {
    const steps: ValidationStep[] = ['problem', 'solution', 'market', 'business-model', 'mvp', 'feedback'];
    const currentIndex = steps.indexOf(activeStep);
    
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1]);
      setCurrentQuestion(0);
    }
  };

  // Voltar para a etapa anterior
  const prevStep = () => {
    const steps: ValidationStep[] = ['problem', 'solution', 'market', 'business-model', 'mvp', 'feedback'];
    const currentIndex = steps.indexOf(activeStep);
    
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1]);
      setCurrentQuestion(0);
    }
  };

  // Avançar para a próxima pergunta
  const nextQuestion = () => {
    if (currentQuestion < validationQuestions[activeStep].questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      nextStep();
    }
  };

  // Voltar para a pergunta anterior
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      prevStep();
    }
  };

  // Renderizar o resumo da ideia
  const renderIdeaSummary = () => {
    return (
      <Card className="bg-dark-background border-dark-border p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-white flex items-center">
            <Lightbulb size={18} className="text-primary mr-2" />
            Resumo da Ideia
          </h4>
          <div className="flex items-center">
            <span className={`text-sm font-medium ${
              businessIdea.validationScore >= 80 ? 'text-green-500' : 
              businessIdea.validationScore >= 60 ? 'text-amber-500' : 'text-red-500'
            }`}>
              Score: {businessIdea.validationScore}/100
            </span>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-white mb-2">{businessIdea.name}</h3>
          <p className="text-gray-400 text-sm mb-4">{businessIdea.description}</p>
          
          <div className="space-y-4">
            {/* Problema */}
            <div>
              <button 
                className="flex items-center justify-between w-full text-left"
                onClick={() => toggleSection('problem')}
              >
                <span className="font-medium text-white">Problema</span>
                {expandedSection === 'problem' ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>
              
              {expandedSection === 'problem' && (
                <div className="mt-2 pl-4 border-l border-dark-border">
                  <p className="text-sm text-gray-400">{businessIdea.problemStatement}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    <span className="text-white font-medium">Público-alvo:</span> {businessIdea.targetAudience}
                  </p>
                </div>
              )}
            </div>
            
            {/* Solução */}
            <div>
              <button 
                className="flex items-center justify-between w-full text-left"
                onClick={() => toggleSection('solution')}
              >
                <span className="font-medium text-white">Solução</span>
                {expandedSection === 'solution' ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>
              
              {expandedSection === 'solution' && (
                <div className="mt-2 pl-4 border-l border-dark-border">
                  <p className="text-sm text-gray-400">{businessIdea.solutionDescription}</p>
                  <p className="text-sm text-white font-medium mt-2">Proposta de Valor:</p>
                  <p className="text-sm text-gray-400 italic">"{businessIdea.valueProposition}"</p>
                  
                  <p className="text-sm text-white font-medium mt-2">Diferenciais:</p>
                  <ul className="text-sm text-gray-400 list-disc pl-5 space-y-1">
                    {businessIdea.uniqueSellingPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Mercado */}
            <div>
              <button 
                className="flex items-center justify-between w-full text-left"
                onClick={() => toggleSection('market')}
              >
                <span className="font-medium text-white">Mercado</span>
                {expandedSection === 'market' ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>
              
              {expandedSection === 'market' && (
                <div className="mt-2 pl-4 border-l border-dark-border">
                  <p className="text-sm text-gray-400">{businessIdea.marketSize}</p>
                  
                  <p className="text-sm text-white font-medium mt-2">Concorrentes:</p>
                  <ul className="text-sm text-gray-400 list-disc pl-5 space-y-1">
                    {businessIdea.competitors.map((competitor, index) => (
                      <li key={index}>{competitor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Modelo de Negócio */}
            <div>
              <button 
                className="flex items-center justify-between w-full text-left"
                onClick={() => toggleSection('business-model')}
              >
                <span className="font-medium text-white">Modelo de Negócio</span>
                {expandedSection === 'business-model' ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>
              
              {expandedSection === 'business-model' && (
                <div className="mt-2 pl-4 border-l border-dark-border">
                  <p className="text-sm text-gray-400">{businessIdea.businessModel}</p>
                  
                  <p className="text-sm text-white font-medium mt-2">Fontes de Receita:</p>
                  <ul className="text-sm text-gray-400 list-disc pl-5 space-y-1">
                    {businessIdea.revenueStreams.map((stream, index) => (
                      <li key={index}>{stream}</li>
                    ))}
                  </ul>
                  
                  <p className="text-sm text-white font-medium mt-2">Estrutura de Custos:</p>
                  <ul className="text-sm text-gray-400 list-disc pl-5 space-y-1">
                    {businessIdea.costStructure.map((cost, index) => (
                      <li key={index}>{cost}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* MVP */}
            <div>
              <button 
                className="flex items-center justify-between w-full text-left"
                onClick={() => toggleSection('mvp')}
              >
                <span className="font-medium text-white">MVP (Produto Mínimo Viável)</span>
                {expandedSection === 'mvp' ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>
              
              {expandedSection === 'mvp' && (
                <div className="mt-2 pl-4 border-l border-dark-border">
                  <p className="text-sm text-white font-medium">Funcionalidades Essenciais:</p>
                  <ul className="text-sm text-gray-400 list-disc pl-5 space-y-1">
                    {businessIdea.mvpFeatures.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Renderizar progresso de validação
  const renderValidationProgress = () => {
    const steps: ValidationStep[] = ['problem', 'solution', 'market', 'business-model', 'mvp', 'feedback'];
    
    return (
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <h4 className="font-medium text-white">Progresso da Validação</h4>
          <span className="text-sm text-gray-400">
            {steps.filter(step => businessIdea.validationSteps[step].completed).length}/{steps.length} etapas
          </span>
        </div>
        
        <div className="grid grid-cols-6 gap-2">
          {steps.map((step) => {
            const isActive = activeStep === step;
            const isCompleted = businessIdea.validationSteps[step].completed;
            const score = businessIdea.validationSteps[step].score;
            
            return (
              <button
                key={step}
                className={`p-2 rounded-md text-center transition-all ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : isCompleted 
                      ? 'bg-primary/20 text-white' 
                      : 'bg-dark-card text-gray-400'
                }`}
                onClick={() => setActiveStep(step)}
              >
                <div className="text-xs font-medium truncate">
                  {step === 'problem' && 'Problema'}
                  {step === 'solution' && 'Solução'}
                  {step === 'market' && 'Mercado'}
                  {step === 'business-model' && 'Modelo'}
                  {step === 'mvp' && 'MVP'}
                  {step === 'feedback' && 'Feedback'}
                </div>
                {isCompleted && (
                  <div className="text-xs mt-1">
                    {score}/100
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar etapa atual de validação
  const renderCurrentValidationStep = () => {
    const currentStepData = validationQuestions[activeStep];
    const currentValidation = businessIdea.validationSteps[activeStep];
    
    return (
      <Card className="bg-dark-background border-dark-border p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-white flex items-center">
            {activeStep === 'problem' && <HelpCircle size={18} className="text-primary mr-2" />}
            {activeStep === 'solution' && <Lightbulb size={18} className="text-primary mr-2" />}
            {activeStep === 'market' && <Users size={18} className="text-primary mr-2" />}
            {activeStep === 'business-model' && <DollarSign size={18} className="text-primary mr-2" />}
            {activeStep === 'mvp' && <Zap size={18} className="text-primary mr-2" />}
            {activeStep === 'feedback' && <BarChart2 size={18} className="text-primary mr-2" />}
            {currentStepData.title}
          </h4>
          
          {currentValidation.completed && (
            <div className="flex items-center">
              <span className={`text-sm font-medium ${
                currentValidation.score >= 80 ? 'text-green-500' : 
                currentValidation.score >= 60 ? 'text-amber-500' : 'text-red-500'
              }`}>
                Score: {currentValidation.score}/100
              </span>
            </div>
          )}
        </div>
        
        <div className="bg-dark-card rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-white">Questão {currentQuestion + 1} de {currentStepData.questions.length}</h5>
            <div className="flex items-center space-x-1">
              {[...Array(currentStepData.questions.length)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i === currentQuestion ? 'bg-primary' : 'bg-gray-600'
                  }`}
                ></div>
              ))}
            </div>
          </div>
          
          <p className="text-white">{currentStepData.questions[currentQuestion]}</p>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <textarea 
              className="w-full bg-dark-background border border-dark-border rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              placeholder="Digite sua resposta aqui..."
              rows={3}
            ></textarea>
          </div>
          
          <div className="mt-4 flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={prevQuestion}
              disabled={currentQuestion === 0 && activeStep === 'problem'}
            >
              Anterior
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={nextQuestion}
            >
              {currentQuestion < currentStepData.questions.length - 1 ? 'Próxima' : 'Concluir Etapa'}
            </Button>
          </div>
        </div>
        
        {currentValidation.completed && (
          <div className="bg-primary/10 rounded-lg p-3">
            <div className="flex items-start">
              <CheckCircle size={16} className="text-primary mt-0.5 mr-2" />
              <div>
                <div className="text-sm font-medium text-white">Feedback da Validação</div>
                <p className="text-xs text-gray-200 mt-1">
                  {currentValidation.feedback}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  };

  // Renderizar ferramentas de validação
  const renderValidationTools = () => {
    return (
      <Card className="bg-dark-background border-dark-border p-4">
        <h4 className="font-medium text-white mb-4">Ferramentas de Validação</h4>
        
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-between"
            size="sm"
          >
            <div className="flex items-center">
              <FileText size={16} className="mr-2" />
              <span>Criar Pesquisa de Mercado</span>
            </div>
            <ExternalLink size={14} />
          </Button>
          
          <Button 
            variant="outline"
            className="w-full flex items-center justify-between"
            size="sm"
          >
            <div className="flex items-center">
              <Users size={16} className="mr-2" />
              <span>Definir Persona de Cliente</span>
            </div>
            <ExternalLink size={14} />
          </Button>
          
          <Button 
            variant="outline"
            className="w-full flex items-center justify-between"
            size="sm"
          >
            <div className="flex items-center">
              <BarChart2 size={16} className="mr-2" />
              <span>Analisar Concorrência</span>
            </div>
            <ExternalLink size={14} />
          </Button>
          
          <Button 
            variant="outline"
            className="w-full flex items-center justify-between"
            size="sm"
          >
            <div className="flex items-center">
              <Send size={16} className="mr-2" />
              <span>Distribuir Questionário</span>
            </div>
            <ExternalLink size={14} />
          </Button>
        </div>
        
        <div className="mt-6 bg-dark-card rounded-lg p-4">
          <h5 className="font-medium text-white mb-2">Insights de Validação</h5>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Potencial da Ideia</span>
              <div className="flex items-center">
                <ThumbsUp size={14} className="text-green-500 mr-1" />
                <span className="text-sm text-white">Alto</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Validação do Problema</span>
              <div className="flex items-center">
                <ThumbsUp size={14} className="text-green-500 mr-1" />
                <span className="text-sm text-white">Forte</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Modelo de Negócio</span>
              <div className="flex items-center">
                <ThumbsDown size={14} className="text-amber-500 mr-1" />
                <span className="text-sm text-white">Precisa Refinamento</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Escalabilidade</span>
              <div className="flex items-center">
                <ThumbsUp size={14} className="text-green-500 mr-1" />
                <span className="text-sm text-white">Boa</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Button variant="default" size="sm" className="w-full">
              Ver Relatório Completo
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="bg-dark-card border-dark-border rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Validador de Ideias</h3>
            <p className="text-gray-400 text-sm">
              Valide metodicamente sua ideia de negócio antes de investir tempo e recursos
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <FileText size={16} className="mr-2" />
              <span>Salvar Progresso</span>
            </Button>
            <Button variant="default" size="sm">
              <Lightbulb size={16} className="mr-2" />
              <span>Nova Ideia</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Resumo da Ideia */}
            {renderIdeaSummary()}
            
            {/* Progresso de Validação */}
            {renderValidationProgress()}
            
            {/* Etapa Atual de Validação */}
            {renderCurrentValidationStep()}
          </div>
          
          <div>
            {/* Ferramentas de Validação */}
            {renderValidationTools()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaValidator;
