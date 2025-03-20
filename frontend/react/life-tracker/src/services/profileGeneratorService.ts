import { AnswersType } from '@/config/onboarding';
import { UserProfile } from '@/hooks/useOnboarding';

class ProfileGeneratorService {
  private static instance: ProfileGeneratorService
  static getInstance() {
    if (!ProfileGeneratorService.instance) {
      ProfileGeneratorService.instance = new ProfileGeneratorService();
    }
    return ProfileGeneratorService.instance;
  }
  /**
   * Gera um perfil do usuário com base nas respostas fornecidas
   * Na implementação final, isso pode ser uma chamada API para um serviço de ML/AI
   */
  async generateProfile(answers: AnswersType): Promise<UserProfile> {
    // Simula uma chamada de API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Lógica simplificada para gerar um perfil baseado nas respostas
        const profile: UserProfile = {
          personalType: this.determinePersonalityType(answers),
          financialProfile: this.determineFinancialProfile(answers),
          entrepreneurType: this.determineEntrepreneurType(answers),
          recommendedFocus: this.generateRecommendedFocus(answers),
          suggestedHabits: this.generateSuggestedHabits(answers),
          suggestedInvestments: this.generateSuggestedInvestments(answers),
          suggestedBusinessOpportunities: this.generateBusinessOpportunities(answers), 
          strengths: this.identifyStrengths(answers),
          weaknesses: this.identifyWeaknesses(answers),
          recommendations: {
            personal: this.generatePersonalRecommendations(answers),
            financial: this.generateFinancialRecommendations(answers),
            career: this.generateCareerRecommendations(answers),
          }
        };
        
        resolve(profile);
      }, 2000); // Simula um tempo de processamento
    });
  }

  private determineFinancialProfile(answers: AnswersType): string {
    if (answers.riskTolerance === 'conservative') {
      return 'Conservador';
    } else if (answers.riskTolerance === 'moderate') {
      return 'Moderado';
    } else if (answers.riskTolerance === 'aggressive') {
      return 'Agressivo';
    } else if (answers.financialGoals?.includes('wealth-building')) {
      return 'Acumulador de Patrimônio';
    } else if (answers.financialGoals?.includes('passive-income')) {
      return 'Gerador de Renda Passiva';
    } else {
      return 'Equilibrado';
    }
  }
  
  private determineEntrepreneurType(answers: AnswersType): string {
    if (answers.entrepreneurProfile === 'visionary') {
      return 'Visionário';
    } else if (answers.entrepreneurProfile === 'builder') {
      return 'Construtor';
    } else if (answers.entrepreneurProfile === 'specialist') {
      return 'Especialista';
    } else if (answers.entrepreneurProfile === 'opportunist') {
      return 'Oportunista';
    } else {
      return 'Empreendedor em Desenvolvimento';
    }
  }
  
  private generateRecommendedFocus(answers: AnswersType): string[] {
    const focus: string[] = [];
    
    if (answers.personalInterests?.includes('health')) {
      focus.push('Saúde e Bem-estar');
    }
    
    if (answers.personalInterests?.includes('finances')) {
      focus.push('Educação Financeira');
    }
    
    if (answers.personalInterests?.includes('career')) {
      focus.push('Desenvolvimento Profissional');
    }
    
    if (answers.personalInterests?.includes('business')) {
      focus.push('Empreendedorismo');
    }
    
    if (answers.concentration === 'low-focus') {
      focus.push('Melhoria de Foco');
    }
    
    if (focus.length === 0) {
      focus.push('Autoconhecimento', 'Produtividade');
    }
    
    return focus.slice(0, 4); // Limita a 4 itens no máximo
  }
  
  private generateSuggestedHabits(answers: AnswersType): {name: string, category: string, frequency: string}[] {
    const habits: {name: string, category: string, frequency: string}[] = [];
    
    // Hábitos baseados no nível de energia
    if (answers.energy === 'low-energy') {
      habits.push({
        name: 'Exercício Físico Matinal',
        category: 'Bem-estar',
        frequency: '3-5 vezes por semana'
      });
    }
    
    // Hábitos baseados na concentração
    if (answers.concentration === 'low-focus' || answers.concentration === 'medium-focus') {
      habits.push({
        name: 'Meditação de Foco',
        category: 'Bem-estar',
        frequency: 'Diariamente por 10 minutos'
      });
    }
    
    // Hábitos financeiros
    if (answers.financialGoals?.includes('wealth-building')) {
      habits.push({
        name: 'Revisão de Investimentos',
        category: 'Finanças',
        frequency: 'Semanalmente'
      });
    }
    
    // Hábitos de aprendizado
    if (answers.learningAreas?.includes('finance')) {
      habits.push({
        name: 'Estudo de Finanças',
        category: 'Educação',
        frequency: '3 vezes por semana'
      });
    }
    
    // Hábitos empreendedores
    if (answers.businessInterests?.length) {
      habits.push({
        name: 'Networking Empreendedor',
        category: 'Empreendimento',
        frequency: 'Quinzenalmente'
      });
    }
    
    // Adiciona hábitos genéricos se necessário
    if (habits.length < 3) {
      habits.push({
        name: 'Leitura para Desenvolvimento',
        category: 'Educação',
        frequency: '20 minutos diários'
      });
      
      habits.push({
        name: 'Planejamento Semanal',
        category: 'Produtividade',
        frequency: 'Todo domingo'
      });
    }
    
    return habits;
  }
  
  private generateSuggestedInvestments(answers: AnswersType): {type: string, allocation: number, risk: string}[] {
    const investments: {type: string, allocation: number, risk: string}[] = [];
    
    // Define proporções baseadas no perfil de risco
    if (answers.riskTolerance === 'conservative') {
      investments.push(
        { type: 'Renda Fixa', allocation: 60, risk: 'Baixo' },
        { type: 'Fundos Imobiliários', allocation: 20, risk: 'Médio' },
        { type: 'Ações', allocation: 10, risk: 'Alto' },
        { type: 'Reserva de Emergência', allocation: 10, risk: 'Baixo' }
      );
    } else if (answers.riskTolerance === 'moderate') {
      investments.push(
        { type: 'Renda Fixa', allocation: 40, risk: 'Baixo' },
        { type: 'Fundos Imobiliários', allocation: 25, risk: 'Médio' },
        { type: 'Ações', allocation: 25, risk: 'Alto' },
        { type: 'Investimentos Alternativos', allocation: 10, risk: 'Alto' }
      );
    } else { // Agressivo ou não especificado
      investments.push(
        { type: 'Ações', allocation: 50, risk: 'Alto' },
        { type: 'Fundos Imobiliários', allocation: 20, risk: 'Médio' },
        { type: 'Renda Fixa', allocation: 15, risk: 'Baixo' },
        { type: 'Investimentos Internacionais', allocation: 15, risk: 'Alto' }
      );
    }
    
    return investments;
  }
  
  private generateBusinessOpportunities(answers: AnswersType): {name: string, investmentLevel: string, timeRequired: string}[] {
    if (!answers.businessInterests?.length) {
      return [];
    }
    
    const opportunities: {name: string, investmentLevel: string, timeRequired: string}[] = [];
    
    // Verifica interesse em tecnologia
    if (answers.businessInterests.includes('tech')) {
      opportunities.push({
        name: 'Software as a Service (SaaS)',
        investmentLevel: 'Médio',
        timeRequired: 'Alto'
      });
    }
    
    // Verifica interesse em e-commerce
    if (answers.businessInterests.includes('ecommerce')) {
      opportunities.push({
        name: 'Dropshipping de Produtos Especializados',
        investmentLevel: 'Baixo',
        timeRequired: 'Médio'
      });
    }
    
    // Verifica interesse em criação de conteúdo
    if (answers.businessInterests.includes('content')) {
      opportunities.push({
        name: 'Marketing de Conteúdo para Nicho Específico',
        investmentLevel: 'Baixo',
        timeRequired: 'Alto'
      });
    }
    
    // Adiciona oportunidades genéricas se necessário
    if (opportunities.length < 2 && answers.timeAvailability && answers.timeAvailability < 15) {
      opportunities.push({
        name: 'Consultoria Online',
        investmentLevel: 'Baixo',
        timeRequired: 'Flexível'
      });
    }
    
    if (opportunities.length < 2 && answers.investmentCapacity === 'high' || answers.investmentCapacity === 'very-high') {
      opportunities.push({
        name: 'Franquia de Pequeno Porte',
        investmentLevel: 'Alto',
        timeRequired: 'Médio'
      });
    }
    
    return opportunities;
  }

  private determinePersonalityType(answers: AnswersType): string {
    // Determinação simplificada do tipo de personalidade
    if (answers.entrepreneurProfile === 'visionary') {
      return 'Visionário Estratégico';
    } else if (answers.entrepreneurProfile === 'builder') {
      return 'Construtor Sistemático';
    } else if (answers.energy === 'high-energy' && answers.lifestyle === 'very-satisfied') {
      return 'Entusiasta Energético';
    } else if (answers.concentration === 'high-focus') {
      return 'Analista Focado';
    } else {
      return 'Adaptador Versátil';
    }
  }

  private identifyStrengths(answers: AnswersType): string[] {
    const strengths: string[] = [];
    
    if (answers.concentration === 'high-focus') {
      strengths.push('Alta capacidade de concentração');
    }
    
    if (answers.energy === 'high-energy') {
      strengths.push('Altos níveis de energia ao longo do dia');
    }
    
    if (answers.financialGoals?.includes('wealth-building')) {
      strengths.push('Orientação para construção de patrimônio a longo prazo');
    }
    
    if (answers.monthlySavings && answers.monthlyIncome) {
      const savingsRate = (answers.monthlySavings / answers.monthlyIncome) * 100;
      if (savingsRate > 20) {
        strengths.push('Excelente taxa de poupança mensal');
      }
    }
    
    if (strengths.length === 0) {
      strengths.push('Adaptabilidade a diferentes situações');
    }
    
    return strengths;
  }

  private identifyWeaknesses(answers: AnswersType): string[] {
    const weaknesses: string[] = [];
    
    if (answers.concentration === 'low-focus') {
      weaknesses.push('Dificuldade em manter foco por longos períodos');
    }
    
    if (answers.energy === 'low-energy') {
      weaknesses.push('Tendência a perder energia ao longo do dia');
    }
    
    if (answers.lifestyle === 'not-satisfied') {
      weaknesses.push('Insatisfação com o estilo de vida atual');
    }
    
    if (answers.monthlySavings && answers.monthlyIncome) {
      const savingsRate = (answers.monthlySavings / answers.monthlyIncome) * 100;
      if (savingsRate < 10) {
        weaknesses.push('Taxa de poupança mensal abaixo do ideal');
      }
    }
    
    if (weaknesses.length === 0) {
      weaknesses.push('Possível dificuldade em estabelecer prioridades claras');
    }
    
    return weaknesses;
  }

  private generatePersonalRecommendations(answers: AnswersType): string[] {
    const recommendations: string[] = [];
    
    // Recomendações baseadas nos interesses pessoais
    if (answers.personalInterests?.includes('health')) {
      recommendations.push('Estabeleça uma rotina de exercícios de 30 minutos por dia, 5 vezes por semana');
    }
    
    // Recomendações baseadas no nível de concentração
    if (answers.concentration === 'low-focus' || answers.concentration === 'medium-focus') {
      recommendations.push('Experimente técnicas de Pomodoro (25 minutos de foco seguidos de 5 minutos de pausa) para melhorar sua concentração');
    }
    
    // Recomendações baseadas no nível de energia
    if (answers.energy === 'low-energy') {
      recommendations.push('Considere ajustar sua alimentação e incluir pequenas pausas ativas durante o dia para manter os níveis de energia');
    }
    
    // Recomendações baseadas na rotina de sono
    if (answers.wakeupTime && answers.sleepTime) {
      const wakeHour = parseInt(answers.wakeupTime.split(':')[0]);
      const sleepHour = parseInt(answers.sleepTime.split(':')[0]);
      const sleepDuration = (24 - sleepHour + wakeHour) % 24;
      
      if (sleepDuration < 7) {
        recommendations.push('Tente aumentar seu tempo de sono para pelo menos 7 horas por noite para melhorar sua saúde e produtividade');
      }
    }
    
    // Recomendações baseadas nas áreas de aprendizado
    if (answers.learningAreas?.length) {
      const learningArea = answers.learningAreas[0];
      recommendations.push(`Dedique 30 minutos diários para estudos em ${this.mapLearningArea(learningArea)}`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Defina metas SMART (Específicas, Mensuráveis, Atingíveis, Relevantes e Temporais) para suas principais áreas de interesse');
    }
    
    return recommendations;
  }

  private mapLearningArea(area: string): string {
    const areaMap: {[key: string]: string} = {
      'finance': 'finanças e investimentos',
      'tech': 'tecnologia e programação',
      'business': 'empreendedorismo e gestão',
      'marketing': 'marketing e vendas',
      'health': 'saúde e bem-estar',
      'leadership': 'liderança e comunicação',
      'languages': 'idiomas',
      'creativity': 'criatividade e arte'
    };
    
    return areaMap[area] || area;
  }

  private generateFinancialRecommendations(answers: AnswersType): string[] {
    const recommendations: string[] = [];
    
    // Recomendações baseadas nos objetivos financeiros
    if (answers.financialGoals?.includes('wealth-building')) {
      recommendations.push('Considere aumentar sua exposição a investimentos de crescimento a longo prazo, como ações e fundos indexados');
    }
    
    if (answers.financialGoals?.includes('passive-income')) {
      recommendations.push('Diversifique suas fontes de renda passiva através de dividendos, aluguéis e juros compostos');
    }
    
    if (answers.financialGoals?.includes('debt-reduction')) {
      recommendations.push('Priorize o pagamento de dívidas com taxas de juros mais altas primeiro');
    }
    
    // Recomendações baseadas na tolerância a risco
    if (answers.riskTolerance === 'conservative') {
      recommendations.push('Mantenha um portfólio mais conservador com títulos de renda fixa, mas inclua uma pequena alocação em ativos de crescimento');
    } else if (answers.riskTolerance === 'aggressive') {
      recommendations.push('Aproveite sua tolerância a risco para buscar retornos mais altos, mas mantenha uma reserva de emergência sólida');
    }
    
    // Recomendações baseadas no horizonte de investimento
    if (answers.investmentHorizon === 'long-term') {
      recommendations.push('Aproveite o poder dos juros compostos: considere reinvestir dividendos e juros para maximizar seu crescimento patrimonial');
    }
    
    // Recomendações baseadas na capacidade de poupança
    if (answers.monthlySavings && answers.monthlyIncome) {
      const savingsRate = (answers.monthlySavings / answers.monthlyIncome) * 100;
      
      if (savingsRate < 15) {
        recommendations.push(`Tente aumentar gradualmente sua taxa de poupança mensal de ${savingsRate.toFixed(1)}% para pelo menos 15%`);
      } else if (savingsRate >= 15 && savingsRate < 25) {
        recommendations.push(`Sua taxa de poupança de ${savingsRate.toFixed(1)}% é boa, mas considere aumentar para 25% para acelerar seus objetivos financeiros`);
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Estabeleça um orçamento detalhado e acompanhe seus gastos regularmente para otimizar suas finanças');
    }
    
    return recommendations;
  }

  private generateCareerRecommendations(answers: AnswersType): string[] {
    const recommendations: string[] = [];
    
    // Recomendações baseadas nos interesses de negócios
    if (answers.businessInterests?.length) {
      const businessArea = answers.businessInterests[0];
      recommendations.push(`Explore oportunidades no setor de ${this.mapBusinessArea(businessArea)} que se alinhem com seu perfil empreendedor`);
    }
    
    // Recomendações baseadas no perfil empreendedor
    if (answers.entrepreneurProfile === 'visionary') {
      recommendations.push('Dedique tempo para atividades criativas e estratégicas que alimentem sua visão de longo prazo');
    } else if (answers.entrepreneurProfile === 'builder') {
      recommendations.push('Foque em desenvolver sistemas e processos que permitam escalabilidade em seus empreendimentos');
    } else if (answers.entrepreneurProfile === 'specialist') {
      recommendations.push('Invista no aprofundamento de sua expertise técnica e considere formas de monetizá-la através de consultorias ou criação de conteúdo');
    } else if (answers.entrepreneurProfile === 'opportunist') {
      recommendations.push('Mantenha-se atualizado sobre tendências de mercado e estabeleça uma rede de contatos para identificar oportunidades emergentes');
    }
    
    // Recomendações baseadas na disponibilidade de tempo
    if (answers.timeAvailability && answers.timeAvailability < 10) {
      recommendations.push('Comece com projetos paralelos que possam ser gerenciados com sua disponibilidade atual de tempo');
    } else if (answers.timeAvailability && answers.timeAvailability >= 30) {
      recommendations.push('Com sua significativa disponibilidade de tempo, considere iniciar projetos mais ambiciosos ou acelerar o crescimento de iniciativas existentes');
    }
    
    // Recomendações baseadas em objetivos de vida
    if (answers.lifeGoals?.includes('own-business')) {
      recommendations.push('Desenvolva um plano de negócios detalhado para sua ideia empreendedora e valide-a com potenciais clientes antes de investir recursos significativos');
    }
    
    if (answers.lifeGoals?.includes('career-growth')) {
      recommendations.push('Identifique as habilidades mais valorizadas em sua área e crie um plano de desenvolvimento profissional focado nelas');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Busque equilíbrio entre crescimento profissional e qualidade de vida, alinhando suas atividades com seus valores fundamentais');
    }
    
    return recommendations;
  }

  private mapBusinessArea(area: string): string {
    const areaMap: {[key: string]: string} = {
      'tech': 'tecnologia e SaaS',
      'ecommerce': 'e-commerce',
      'content': 'criação de conteúdo',
      'services': 'serviços e consultoria',
      'education': 'educação e treinamentos',
      'real-estate': 'negócios imobiliários',
      'physical': 'produtos físicos',
      'franchise': 'franquias'
    };
    
    return areaMap[area] || area;
  }


}
export const profileGeneratorService = ProfileGeneratorService.getInstance();
