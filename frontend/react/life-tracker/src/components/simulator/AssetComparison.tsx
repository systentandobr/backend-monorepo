'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  PieChart, 
  BarChart2, 
  Search,
  Plus,
  XCircle,
  ArrowUpDown,
  Info,
  Calendar,
  DollarSign
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface AssetComparisonProps {
  className?: string;
}

// Tipos de assets
type AssetType = 'stock' | 'reit' | 'etf' | 'crypto' | 'fixed-income';

// Interface para dados de ativos
interface AssetData {
  id: string;
  ticker: string;
  name: string;
  type: AssetType;
  currentPrice: number;
  change1d: number;
  change1m: number;
  change1y: number;
  volatility: number;
  dividendYield?: number;
  sector?: string;
  riskLevel: 'low' | 'medium' | 'high';
  historicalReturns: number[];
}

export const AssetComparison: React.FC<AssetComparisonProps> = ({
  className
}) => {
  // Estado para ativos selecionados
  const [selectedAssets, setSelectedAssets] = useState<string[]>(['PETR4', 'VALE3', 'ITUB4']);
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [timeFrame, setTimeFrame] = useState<'1y' | '3y' | '5y' | 'max'>('5y');
  
  // Dados de amostra para os ativos
  const assetData: Record<string, AssetData> = {
    'PETR4': {
      id: 'petr4',
      ticker: 'PETR4',
      name: 'Petrobras PN',
      type: 'stock',
      currentPrice: 36.25,
      change1d: 2.5,
      change1m: 7.8,
      change1y: 15.3,
      volatility: 32.5,
      dividendYield: 15.7,
      sector: 'Petróleo e Gás',
      riskLevel: 'high',
      historicalReturns: [12.5, 18.7, -23.4, 42.1, 15.3]
    },
    'VALE3': {
      id: 'vale3',
      ticker: 'VALE3',
      name: 'Vale ON',
      type: 'stock',
      currentPrice: 68.79,
      change1d: -1.2,
      change1m: 3.4,
      change1y: -5.2,
      volatility: 28.3,
      dividendYield: 9.2,
      sector: 'Mineração',
      riskLevel: 'high',
      historicalReturns: [9.8, -5.2, 14.7, 32.1, -5.2]
    },
    'ITUB4': {
      id: 'itub4',
      ticker: 'ITUB4',
      name: 'Itaú Unibanco PN',
      type: 'stock',
      currentPrice: 32.45,
      change1d: 0.8,
      change1m: 4.2,
      change1y: 24.7,
      volatility: 22.1,
      dividendYield: 5.3,
      sector: 'Financeiro',
      riskLevel: 'medium',
      historicalReturns: [15.3, 22.7, 8.4, 9.1, 24.7]
    },
    'KNRI11': {
      id: 'knri11',
      ticker: 'KNRI11',
      name: 'Kinea Renda Imobiliária',
      type: 'reit',
      currentPrice: 104.89,
      change1d: 0.7,
      change1m: 2.1,
      change1y: 8.5,
      volatility: 18.7,
      dividendYield: 8.2,
      sector: 'Fundos Imobiliários',
      riskLevel: 'medium',
      historicalReturns: [12.5, 8.4, 9.2, 7.5, 8.5]
    },
    'BOVA11': {
      id: 'bova11',
      ticker: 'BOVA11',
      name: 'iShares Ibovespa',
      type: 'etf',
      currentPrice: 108.35,
      change1d: 0.5,
      change1m: 3.8,
      change1y: 12.4,
      volatility: 24.5,
      dividendYield: 3.5,
      sector: 'ETF',
      riskLevel: 'medium',
      historicalReturns: [13.2, 15.7, -8.4, 21.5, 12.4]
    },
    'IVVB11': {
      id: 'ivvb11',
      ticker: 'IVVB11',
      name: 'iShares S&P 500',
      type: 'etf',
      currentPrice: 262.14,
      change1d: 1.2,
      change1m: 5.3,
      change1y: 18.7,
      volatility: 20.1,
      dividendYield: 1.8,
      sector: 'ETF',
      riskLevel: 'medium',
      historicalReturns: [16.8, 22.3, 15.7, 11.2, 18.7]
    },
    'BTC': {
      id: 'btc',
      ticker: 'BTC',
      name: 'Bitcoin',
      type: 'crypto',
      currentPrice: 182450.00,
      change1d: -1.2,
      change1m: 15.4,
      change1y: 68.3,
      volatility: 65.8,
      riskLevel: 'high',
      historicalReturns: [65.3, -72.5, 302.4, -32.5, 68.3]
    },
    'TESOURO-IPCA': {
      id: 'tesouro-ipca',
      ticker: 'TESOURO-IPCA+',
      name: 'Tesouro IPCA+ 2035',
      type: 'fixed-income',
      currentPrice: 1000.00, // Valor de referência
      change1d: 0.1,
      change1m: 0.8,
      change1y: 9.5,
      volatility: 8.2,
      dividendYield: 5.7, // IPCA + taxa
      sector: 'Títulos Públicos',
      riskLevel: 'low',
      historicalReturns: [10.2, 9.8, 12.4, 8.7, 9.5]
    }
  };

  // Lista de todos os ativos disponíveis
  const availableAssets = Object.values(assetData);
  
  // Ativos selecionados com dados completos
  const selectedAssetsData = selectedAssets
    .map(ticker => assetData[ticker])
    .filter(Boolean);

  // Adicionar um ativo à comparação
  const addAsset = (ticker: string) => {
    if (selectedAssets.length < 5 && !selectedAssets.includes(ticker)) {
      setSelectedAssets([...selectedAssets, ticker]);
    }
    setShowAssetSelector(false);
  };

  // Remover um ativo da comparação
  const removeAsset = (ticker: string) => {
    setSelectedAssets(selectedAssets.filter(t => t !== ticker));
  };

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      maximumFractionDigits: 2
    }).format(value);
  };

  // Formatar valores percentuais
  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Obter cor baseada na variação (positiva/negativa)
  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  // Obter cor baseada no nível de risco
  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-amber-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="bg-dark-card border-dark-border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Comparação de Ativos</h3>
            <p className="text-gray-400 text-sm">
              Compare o desempenho histórico e métricas de diferentes ativos
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-md shadow-sm">
              {['1y', '3y', '5y', 'max'].map((period) => (
                <Button
                  key={period}
                  variant="outline"
                  size="sm"
                  onClick={() => setTimeFrame(period as any)}
                  className={cn(
                    "rounded-none first:rounded-l-md last:rounded-r-md",
                    timeFrame === period ? "bg-primary text-white border-primary" : ""
                  )}
                >
                  {period === '1y' && '1 Ano'}
                  {period === '3y' && '3 Anos'}
                  {period === '5y' && '5 Anos'}
                  {period === 'max' && 'Máx'}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAssetSelector(!showAssetSelector)}
              disabled={selectedAssets.length >= 5}
            >
              <Plus size={16} className="mr-2" />
              <span>Adicionar</span>
            </Button>
          </div>
        </div>
        
        {/* Seletor de ativos */}
        {showAssetSelector && (
          <Card className="bg-dark-background border-dark-border p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-white">Selecionar Ativo</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAssetSelector(false)}
              >
                <XCircle size={16} />
              </Button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar por ticker ou nome..."
                className="w-full bg-dark-card border border-dark-border rounded-lg p-2 pl-9 text-white"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
              {availableAssets
                .filter(asset => !selectedAssets.includes(asset.ticker))
                .map(asset => (
                  <Card 
                    key={asset.id}
                    className="bg-dark-card border-dark-border hover:border-gray-600 p-3 cursor-pointer transition-all"
                    onClick={() => addAsset(asset.ticker)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{asset.ticker}</div>
                        <div className="text-xs text-gray-400">{asset.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white">{formatCurrency(asset.currentPrice)}</div>
                        <div className={getChangeColor(asset.change1d)}>
                          {formatPercent(asset.change1d)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </Card>
        )}
        
        {/* Lista de ativos selecionados */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="pb-3 text-left text-gray-400 font-medium">Ativo</th>
                <th className="pb-3 text-right text-gray-400 font-medium">Preço</th>
                <th className="pb-3 text-right text-gray-400 font-medium flex items-center justify-end">
                  Variação 24h
                  <ArrowUpDown size={14} className="ml-1" />
                </th>
                <th className="pb-3 text-right text-gray-400 font-medium">Variação 1m</th>
                <th className="pb-3 text-right text-gray-400 font-medium">Variação 1a</th>
                <th className="pb-3 text-right text-gray-400 font-medium">Volatilidade</th>
                <th className="pb-3 text-right text-gray-400 font-medium">Div. Yield</th>
                <th className="pb-3 text-right text-gray-400 font-medium">Risco</th>
                <th className="pb-3 text-right text-gray-400 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {selectedAssetsData.map(asset => (
                <tr key={asset.id} className="border-b border-dark-border/50 hover:bg-dark-background/30">
                  <td className="py-4">
                    <div className="flex items-center">
                      <div className="mr-3">
                        {asset.type === 'stock' && <BarChart2 className="text-blue-500" size={20} />}
                        {asset.type === 'reit' && <PieChart className="text-green-500" size={20} />}
                        {asset.type === 'etf' && <BarChart2 className="text-purple-500" size={20} />}
                        {asset.type === 'crypto' && <TrendingUp className="text-amber-500" size={20} />}
                        {asset.type === 'fixed-income' && <DollarSign className="text-teal-500" size={20} />}
                      </div>
                      <div>
                        <div className="font-medium text-white">{asset.ticker}</div>
                        <div className="text-xs text-gray-400">{asset.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-right font-medium text-white">
                    {formatCurrency(asset.currentPrice)}
                  </td>
                  <td className={`py-4 text-right font-medium ${getChangeColor(asset.change1d)}`}>
                    {formatPercent(asset.change1d)}
                  </td>
                  <td className={`py-4 text-right font-medium ${getChangeColor(asset.change1m)}`}>
                    {formatPercent(asset.change1m)}
                  </td>
                  <td className={`py-4 text-right font-medium ${getChangeColor(asset.change1y)}`}>
                    {formatPercent(asset.change1y)}
                  </td>
                  <td className="py-4 text-right text-white">
                    {asset.volatility.toFixed(1)}%
                  </td>
                  <td className="py-4 text-right text-white">
                    {asset.dividendYield ? `${asset.dividendYield.toFixed(2)}%` : '-'}
                  </td>
                  <td className={`py-4 text-right font-medium ${getRiskColor(asset.riskLevel)}`}>
                    {asset.riskLevel === 'low' && 'Baixo'}
                    {asset.riskLevel === 'medium' && 'Médio'}
                    {asset.riskLevel === 'high' && 'Alto'}
                  </td>
                  <td className="py-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeAsset(asset.ticker)}
                      className="text-gray-400 hover:text-white hover:bg-transparent"
                    >
                      <XCircle size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {selectedAssetsData.length === 0 && (
          <div className="text-center py-10">
            <div className="text-gray-500 mb-3">
              <BarChart2 size={40} className="mx-auto" />
            </div>
            <h4 className="text-white font-medium mb-2">Nenhum ativo selecionado</h4>
            <p className="text-gray-400 text-sm mb-4">
              Adicione ativos para começar a comparação
            </p>
            <Button onClick={() => setShowAssetSelector(true)}>
              <Plus size={16} className="mr-2" />
              <span>Adicionar Ativos</span>
            </Button>
          </div>
        )}
      </div>
      
      {selectedAssetsData.length > 0 && (
        <div className="bg-dark-card border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Desempenho Histórico</h3>
            <div className="flex items-center">
              <Button variant="outline" size="sm" className="mr-2">
                <Calendar size={16} className="mr-2" />
                <span>Personalizar Período</span>
              </Button>
              <Button variant="outline" size="sm">
                <Info size={16} className="mr-2" />
                <span>Métricas</span>
              </Button>
            </div>
          </div>
          
          {/* Chart placeholder */}
          <div className="h-80 bg-dark-background rounded-lg border border-dark-border p-4 mb-6 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp size={32} className="text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">Gráfico de desempenho histórico dos ativos selecionados</p>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4">
            {selectedAssetsData.map((asset, index) => {
              // Cores diferentes para cada ativo
              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
              
              return (
                <div key={asset.id} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></div>
                  <span className="text-xs text-gray-400">{asset.ticker}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {selectedAssetsData.length > 0 && (
        <div className="bg-dark-card border-dark-border rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Análise Comparativa</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-dark-background border-dark-border p-4">
              <h4 className="font-medium text-white mb-3">Retorno Histórico Anual</h4>
              
              <div className="h-60 bg-dark-card rounded-lg border border-dark-border p-4 flex items-center justify-center mb-3">
                <p className="text-gray-400 text-sm">Gráfico de barras com retornos anuais</p>
              </div>
              
              <p className="text-xs text-gray-400">
                Comparação dos retornos anuais históricos para o período selecionado.
                Retornos passados não garantem resultados futuros.
              </p>
            </Card>
            
            <Card className="bg-dark-background border-dark-border p-4">
              <h4 className="font-medium text-white mb-3">Matriz de Correlação</h4>
              
              <div className="h-60 bg-dark-card rounded-lg border border-dark-border p-4 flex items-center justify-center mb-3">
                <p className="text-gray-400 text-sm">Matriz de correlação entre ativos</p>
              </div>
              
              <p className="text-xs text-gray-400">
                A correlação mede o grau de relacionamento entre os ativos.
                Valores próximos de 0 indicam baixa correlação, ideal para diversificação.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetComparison;
