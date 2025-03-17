'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  HelpCircle, 
  Calculator, 
  Calendar, 
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface InvestmentCalculatorProps {
  className?: string;
}

interface CalculatorFields {
  initialInvestment: number;
  monthlyContribution: number;
  annualInterestRate: number;
  investmentPeriod: number;
  taxRate: number;
  inflationRate: number;
  compoundingFrequency: 'monthly' | 'quarterly' | 'annually';
}

interface CalculationResult {
  finalAmount: number;
  totalInvested: number;
  totalInterest: number;
  afterInflation: number;
  afterTax: number;
  monthlyBreakdown: Array<{
    month: number;
    balance: number;
    invested: number;
    interest: number;
  }>;
}

export const InvestmentCalculator: React.FC<InvestmentCalculatorProps> = ({
  className
}) => {
  const [formData, setFormData] = useState<CalculatorFields>({
    initialInvestment: 5000,
    monthlyContribution: 500,
    annualInterestRate: 10,
    investmentPeriod: 5,
    taxRate: 15,
    inflationRate: 4,
    compoundingFrequency: 'monthly'
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [activeFactor, setActiveFactor] = useState<'interest' | 'time' | 'contribution'>('interest');

  // Handler for input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'compoundingFrequency' ? value : parseFloat(value)
    }));
  };

  // Calculate investment results
  const calculateInvestment = () => {
    const {
      initialInvestment,
      monthlyContribution,
      annualInterestRate,
      investmentPeriod,
      taxRate,
      inflationRate,
      compoundingFrequency
    } = formData;

    // Convert annual rates to monthly
    const monthlyRate = annualInterestRate / 100 / 12;
    const monthlyInflation = inflationRate / 100 / 12;
    const totalMonths = investmentPeriod * 12;
    
    let balance = initialInvestment;
    let totalInvested = initialInvestment;
    let totalInterest = 0;
    
    const monthlyBreakdown = [];

    // Calculate monthly compounding
    for (let month = 1; month <= totalMonths; month++) {
      const monthlyInterest = balance * monthlyRate;
      balance += monthlyInterest + monthlyContribution;
      totalInvested += monthlyContribution;
      totalInterest += monthlyInterest;

      monthlyBreakdown.push({
        month,
        balance,
        invested: totalInvested,
        interest: totalInterest
      });
    }

    // Calculate tax impact
    const taxAmount = totalInterest * (taxRate / 100);
    const afterTax = balance - taxAmount;
    
    // Calculate inflation impact
    const inflationFactor = Math.pow(1 + monthlyInflation, totalMonths);
    const afterInflation = balance / inflationFactor;

    setResult({
      finalAmount: balance,
      totalInvested,
      totalInterest,
      afterTax,
      afterInflation,
      monthlyBreakdown
    });
  };

  // Calculate on form data change
  useEffect(() => {
    calculateInvestment();
  }, [formData]);

  // Format currency numbers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className={cn("grid gap-6 lg:grid-cols-12", className)}>
      {/* Input Form Section */}
      <Card className="p-6 bg-dark-card border-dark-border lg:col-span-5">
        <h3 className="text-xl font-bold mb-4 text-white">Parâmetros da Simulação</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Investimento Inicial
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <input
                type="number"
                name="initialInvestment"
                value={formData.initialInvestment}
                onChange={handleInputChange}
                className="w-full bg-dark-background border border-dark-border rounded-lg p-3 pl-10 text-white focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Aporte Mensal
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <input
                type="number"
                name="monthlyContribution"
                value={formData.monthlyContribution}
                onChange={handleInputChange}
                className="w-full bg-dark-background border border-dark-border rounded-lg p-3 pl-10 text-white focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Taxa de Juros Anual (%)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              <input
                type="number"
                name="annualInterestRate"
                value={formData.annualInterestRate}
                onChange={handleInputChange}
                className="w-full bg-dark-background border border-dark-border rounded-lg p-3 pl-10 text-white focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Período de Investimento (anos)
            </label>
            <input
              type="number"
              name="investmentPeriod"
              value={formData.investmentPeriod}
              onChange={handleInputChange}
              className="w-full bg-dark-background border border-dark-border rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary"
              min="1"
              max="50"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Taxa de Imposto (%)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                <input
                  type="number"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleInputChange}
                  className="w-full bg-dark-background border border-dark-border rounded-lg p-3 pl-10 text-white focus:border-primary focus:ring-1 focus:ring-primary"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Inflação Anual (%)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                <input
                  type="number"
                  name="inflationRate"
                  value={formData.inflationRate}
                  onChange={handleInputChange}
                  className="w-full bg-dark-background border border-dark-border rounded-lg p-3 pl-10 text-white focus:border-primary focus:ring-1 focus:ring-primary"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Frequência de Capitalização
            </label>
            <select
              name="compoundingFrequency"
              value={formData.compoundingFrequency}
              onChange={handleInputChange}
              className="w-full bg-dark-background border border-dark-border rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="monthly">Mensal</option>
              <option value="quarterly">Trimestral</option>
              <option value="annually">Anual</option>
            </select>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={calculateInvestment}
              className="w-full flex items-center justify-center gap-2"
              size="lg"
            >
              <Calculator size={18} />
              <span>Calcular Investimento</span>
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Results Section */}
      {result && (
        <div className="lg:col-span-7 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-dark-card border-dark-border p-4">
              <div className="flex flex-col h-full">
                <div className="text-sm text-gray-400 mb-1">Montante Final</div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(result.finalAmount)}
                </div>
                <div className="mt-auto pt-2 flex justify-between text-xs">
                  <span className="text-gray-400">Após impostos:</span>
                  <span className="text-white">{formatCurrency(result.afterTax)}</span>
                </div>
              </div>
            </Card>
            
            <Card className="bg-dark-card border-dark-border p-4">
              <div className="flex flex-col h-full">
                <div className="text-sm text-gray-400 mb-1">Total Investido</div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(result.totalInvested)}
                </div>
                <div className="mt-auto pt-2 flex justify-between text-xs">
                  <span className="text-gray-400">Juros ganhos:</span>
                  <span className="text-primary">{formatCurrency(result.totalInterest)}</span>
                </div>
              </div>
            </Card>
            
            <Card className="bg-dark-card border-dark-border p-4">
              <div className="flex flex-col h-full">
                <div className="text-sm text-gray-400 mb-1">Valor Real</div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(result.afterInflation)}
                </div>
                <div className="mt-auto pt-2 flex justify-between text-xs">
                  <span className="text-gray-400">Ajustado à inflação</span>
                  <span className="text-white">{formatCurrency(result.afterInflation)}</span>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Impact Factors */}
          <Card className="bg-dark-card border-dark-border p-6">
            <h4 className="text-lg font-bold mb-4 text-white">Fatores de Impacto</h4>
            
            <div className="flex border-b border-dark-border mb-4">
              <button
                onClick={() => setActiveFactor('interest')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeFactor === 'interest'
                    ? 'border-primary text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Taxa de Juros
              </button>
              <button
                onClick={() => setActiveFactor('time')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeFactor === 'time'
                    ? 'border-primary text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Tempo
              </button>
              <button
                onClick={() => setActiveFactor('contribution')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeFactor === 'contribution'
                    ? 'border-primary text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Aportes
              </button>
            </div>
            
            {activeFactor === 'interest' && (
              <div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[5, 10, 15].map(rate => (
                    <Card 
                      key={rate}
                      className={`p-3 cursor-pointer transition-all ${
                        formData.annualInterestRate === rate
                          ? 'bg-primary/20 border-primary'
                          : 'bg-dark-background border-dark-border hover:border-gray-600'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, annualInterestRate: rate }))}
                    >
                      <div className="text-center">
                        <div className="text-xl font-bold">{rate}%</div>
                        <div className="text-xs text-gray-400">ao ano</div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <p className="text-sm text-gray-400">
                  A taxa de juros é o principal fator de crescimento do seu investimento a longo prazo. 
                  Um aumento de apenas 1% pode resultar em ganhos significativamente maiores após muitos anos.
                </p>
              </div>
            )}
            
            {activeFactor === 'time' && (
              <div>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[1, 5, 10, 20].map(period => (
                    <Card 
                      key={period}
                      className={`p-3 cursor-pointer transition-all ${
                        formData.investmentPeriod === period
                          ? 'bg-primary/20 border-primary'
                          : 'bg-dark-background border-dark-border hover:border-gray-600'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, investmentPeriod: period }))}
                    >
                      <div className="text-center">
                        <div className="text-xl font-bold">{period}</div>
                        <div className="text-xs text-gray-400">
                          {period === 1 ? 'ano' : 'anos'}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <p className="text-sm text-gray-400">
                  O tempo é seu maior aliado nos investimentos. Quanto mais cedo você começar e mais 
                  tempo deixar o dinheiro investido, maior será o efeito dos juros compostos.
                </p>
              </div>
            )}
            
            {activeFactor === 'contribution' && (
              <div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[200, 500, 1000].map(amount => (
                    <Card 
                      key={amount}
                      className={`p-3 cursor-pointer transition-all ${
                        formData.monthlyContribution === amount
                          ? 'bg-primary/20 border-primary'
                          : 'bg-dark-background border-dark-border hover:border-gray-600'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, monthlyContribution: amount }))}
                    >
                      <div className="text-center">
                        <div className="text-xl font-bold">R$ {amount}</div>
                        <div className="text-xs text-gray-400">por mês</div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <p className="text-sm text-gray-400">
                  Aportes mensais regulares são fundamentais para o crescimento consistente do seu patrimônio.
                  Mesmo pequenas contribuições mensais fazem grande diferença no longo prazo.
                </p>
              </div>
            )}
          </Card>
          
          {/* Breakdown Charts will go here */}
          <Card className="bg-dark-card border-dark-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white">Composição do Resultado</h4>
              <Button variant="outline" size="sm">
                <RefreshCw size={16} className="mr-2" />
                <span>Recalcular</span>
              </Button>
            </div>
            
            <div className="h-64 bg-dark-background rounded-lg border border-dark-border flex items-center justify-center">
              <p className="text-gray-400">Gráfico de composição do patrimônio</p>
              {/* This is where we'd add a chart showing the breakdown of principal vs interest */}
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                <span className="text-sm text-gray-400">Principal: {formatCurrency(result.totalInvested)}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-accent rounded-full mr-2"></div>
                <span className="text-sm text-gray-400">Juros: {formatCurrency(result.totalInterest)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InvestmentCalculator;
