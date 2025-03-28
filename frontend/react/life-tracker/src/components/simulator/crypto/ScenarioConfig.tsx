'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScenarioData } from '../types/investment-types';
import { MinusCircle, PlusCircle } from 'lucide-react';
import StageInput from './StageInput';
import TargetPriceInput from './TargetPriceInput';

interface ScenarioConfigProps {
  scenario: ScenarioData;
  updateScenario: (key: keyof ScenarioData, value: any) => void;
}

const ScenarioConfig: React.FC<ScenarioConfigProps> = ({
  scenario,
  updateScenario
}) => {
  // Adicionar um novo estágio de investimento
  const addStage = () => {
    if (scenario.stagePercentages.length >= 5) return; // Máximo 5 estágios
    
    const lastPercentage = scenario.stagePercentages[scenario.stagePercentages.length - 1] || 0;
    const newPercentage = lastPercentage + 10;
    const newStagePercentages = [...scenario.stagePercentages, newPercentage];
    
    // Distribuir alocações igualmente
    const equalAllocation = 100 / newStagePercentages.length;
    const newStageAllocations = newStagePercentages.map(() => equalAllocation);
    
    updateScenario('stagePercentages', newStagePercentages);
    updateScenario('stageAllocations', newStageAllocations);
  };
  
  // Remover um estágio de investimento
  const removeStage = (index: number) => {
    if (scenario.stagePercentages.length <= 1) return; // Mínimo 1 estágio
    
    const newStagePercentages = scenario.stagePercentages.filter((_, i) => i !== index);
    const newStageAllocations = scenario.stageAllocations.filter((_, i) => i !== index);
    
    // Redistribuir alocações igualmente
    const equalAllocation = 100 / newStagePercentages.length;
    const redistributedAllocations = newStagePercentages.map(() => equalAllocation);
    
    updateScenario('stagePercentages', newStagePercentages);
    updateScenario('stageAllocations', redistributedAllocations);
  };
  
  // Adicionar um novo preço-alvo
  const addTargetPrice = () => {
    if (scenario.targetPrices.length >= 5) return; // Máximo 5 preços-alvo
    
    const lastPrice = scenario.targetPrices[scenario.targetPrices.length - 1] || 0;
    const newPrice = lastPrice * 1.1; // 10% acima do último
    const newTargetPrices = [...scenario.targetPrices, newPrice];
    
    updateScenario('targetPrices', newTargetPrices);
  };
  
  // Remover um preço-alvo
  const removeTargetPrice = (index: number) => {
    if (scenario.targetPrices.length <= 1) return; // Mínimo 1 preço-alvo
    
    const newTargetPrices = scenario.targetPrices.filter((_, i) => i !== index);
    updateScenario('targetPrices', newTargetPrices);
  };
  
  // Handler para inputs numéricos
  const handleNumberInput = (key: string, value: string, index?: number) => {
    if (value === '' || isNaN(Number(value))) return;
    
    const numValue = parseFloat(value);
    
    if (index !== undefined) {
      // Atualizar arrays
      if (key === 'stagePercentages') {
        const newPercentages = [...scenario.stagePercentages];
        newPercentages[index] = numValue;
        updateScenario('stagePercentages', newPercentages);
      } else if (key === 'stageAllocations') {
        const newAllocations = [...scenario.stageAllocations];
        newAllocations[index] = numValue;
        updateScenario('stageAllocations', newAllocations);
      } else if (key === 'targetPrices') {
        const newPrices = [...scenario.targetPrices];
        newPrices[index] = numValue;
        updateScenario('targetPrices', newPrices);
      }
    } else {
      // Atualizar valores simples
      updateScenario(key as keyof ScenarioData, numValue);
    }
  };
  
  // Calcular a soma das alocações
  const totalAllocation = scenario.stageAllocations.reduce((sum, value) => sum + value, 0);
  const isAllocationValid = Math.abs(totalAllocation - 100) <= 0.01;
  
  return (
    <Card className="bg-dark-background border-dark-border p-4 mb-6">
      <h4 className="font-medium text-white mb-3">Configuração do Cenário</h4>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nome do Cenário</label>
          <input
            type="text"
            value={scenario.name}
            onChange={(e) => updateScenario('name', e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Valor Total a Investir (R$)</label>
          <input
            type="number"
            value={scenario.investmentAmount}
            onChange={(e) => handleNumberInput('investmentAmount', e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Estratégia de Investimento</label>
          <select
            value={scenario.investmentStrategy}
            onChange={(e) => updateScenario('investmentStrategy', e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-white"
          >
            <option value="single">Investimento Único</option>
            <option value="staged">Investimento Escalonado</option>
          </select>
        </div>
        
        {scenario.investmentStrategy === 'staged' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-400">Escalonamento</label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addStage}
                disabled={scenario.stagePercentages.length >= 5}
              >
                <PlusCircle size={14} className="mr-1" />
                <span>Adicionar Estágio</span>
              </Button>
            </div>
            
            <div className="space-y-2">
              {scenario.stagePercentages.map((percentage, i) => (
                <StageInput
                  key={i}
                  index={i}
                  percentage={percentage}
                  allocation={scenario.stageAllocations[i]}
                  onPercentageChange={(value) => handleNumberInput('stagePercentages', value.toString(), i)}
                  onAllocationChange={(value) => handleNumberInput('stageAllocations', value.toString(), i)}
                  onRemove={() => removeStage(i)}
                  canRemove={scenario.stagePercentages.length > 1}
                />
              ))}
            </div>
            
            {/* Validação da soma das alocações */}
            {!isAllocationValid && (
              <div className="text-amber-500 text-sm mt-2">
                A soma das alocações deve ser igual a 100% (atual: {totalAllocation.toFixed(2)}%).
              </div>
            )}
          </div>
        )}
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-400">Preços-Alvo</label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addTargetPrice}
              disabled={scenario.targetPrices.length >= 5}
            >
              <PlusCircle size={14} className="mr-1" />
              <span>Adicionar Preço</span>
            </Button>
          </div>
          
          <div className="space-y-2">
            {scenario.targetPrices.map((price, i) => (
              <TargetPriceInput
                key={i}
                index={i}
                price={price}
                onChange={(value) => handleNumberInput('targetPrices', value.toString(), i)}
                onRemove={() => removeTargetPrice(i)}
                canRemove={scenario.targetPrices.length > 1}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ScenarioConfig;
