# Componentes do Simulador de Investimentos

Este diretório contém componentes React para criar simulações e análises de investimentos, com foco em criptomoedas.

## Componentes Principais

### Formulário de Simulação
- `CryptoInvestmentScenarios`: Componente principal para criação de simulações de investimento em criptomoedas.

### Análise de Cenários
- `ScenarioAnalyzer`: Componente básico de análise de cenários.
- `EnhancedScenarioAnalyzer`: Versão aprimorada com análises mais detalhadas e projeções mensais.

### Projeção Mensal
- `MonthlyProjectionTable`: Tabela detalhada mostrando resultados mês a mês para diferentes preços-alvo.

## Como Usar

### Instalação

Certifique-se de que as dependências necessárias estão instaladas:

```bash
npm install zustand uuid
# ou usando yarn
yarn add zustand uuid
```

### Importação Básica

```tsx
import { 
  CryptoInvestmentScenarios, 
  EnhancedScenarioAnalyzer 
} from '@/components/simulator';

export default function SimulatorPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Simulador de Investimentos</h1>
      
      {/* Formulário de simulação */}
      <CryptoInvestmentScenarios />
      
      {/* Análise de cenários com projeção mensal */}
      <EnhancedScenarioAnalyzer />
    </div>
  );
}
```

## Arquitetura

Os componentes utilizam uma arquitetura baseada em estado global gerenciado pelo Zustand:

1. **Store** (`enhancedSimulationStore.ts`): Armazena e gerencia o estado global da simulação.
2. **Cálculos** (`monthly-projection-calculations.ts`): Contém funções utilitárias para cálculos financeiros.
3. **Componentes de UI**: Organizados de forma modular para facilitar a manutenção.

## Fluxo de Dados

1. O usuário insere dados no formulário `CryptoInvestmentScenarios`
2. Os dados são armazenados no store Zustand
3. O componente `EnhancedScenarioAnalyzer` reage às mudanças no store
4. As projeções mensais são calculadas automaticamente

## Recursos

### Projeção Mensal de Resultados

O componente `MonthlyProjectionTable` exibe uma tabela detalhada mostrando:

- Evolução do investimento mês a mês
- Impacto do pagamento das parcelas do empréstimo
- Lucro ou prejuízo para cada preço-alvo
- Marcos importantes como breakeven e período ideal para venda

### Análise de Cenários

O `EnhancedScenarioAnalyzer` oferece:

- Três cenários (otimista, realista, pessimista)
- Projeções de resultados para cada cenário
- Recomendações personalizadas
- Informações de breakeven e lucratividade

## Personalização

Os componentes aceitam propriedades para personalização:

```tsx
<MonthlyProjectionTable className="mt-8" />
<EnhancedScenarioAnalyzer className="mt-12" />
```

## Extensão

Para adicionar novas funcionalidades:

1. Adicione novos tipos em `monthly-projection-types.ts`
2. Implemente cálculos em `monthly-projection-calculations.ts`
3. Atualize o store conforme necessário
4. Crie ou modifique componentes de UI
