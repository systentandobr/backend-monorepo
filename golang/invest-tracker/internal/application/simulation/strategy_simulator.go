// internal/application/simulation/strategy_simulator.go
package simulation

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/systentandobr/invest-tracker/internal/domain/analysis/entity"
	"github.com/systentandobr/invest-tracker/internal/domain/analysis/strategy"
	assetEntity "github.com/systentandobr/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/invest-tracker/internal/domain/asset/repository"
	"github.com/systentandobr/invest-tracker/internal/domain/asset/valueobject"
	simEntity "github.com/systentandobr/invest-tracker/internal/domain/simulation/entity"
	"github.com/systentandobr/invest-tracker/pkg/common/logger"
)

// StrategySimulator é o serviço para simular estratégias de investimento
type StrategySimulator struct {
	assetRepo        repository.AssetRepository
	priceHistoryRepo repository.PriceHistoryRepository
	strategies       map[entity.InvestmentStrategy]strategy.InvestmentStrategyService
	logger           logger.Logger
	mutex            sync.RWMutex
}

// NewStrategySimulator cria uma nova instância do simulador
func NewStrategySimulator(
	assetRepo repository.AssetRepository,
	priceHistoryRepo repository.PriceHistoryRepository,
	log logger.Logger,
) *StrategySimulator {
	return &StrategySimulator{
		assetRepo:        assetRepo,
		priceHistoryRepo: priceHistoryRepo,
		strategies:       make(map[entity.InvestmentStrategy]strategy.InvestmentStrategyService),
		logger:           log,
	}
}

// RegisterStrategy registra uma estratégia no simulador
func (s *StrategySimulator) RegisterStrategy(strategyService strategy.InvestmentStrategyService) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	strategyType := strategyService.GetType()
	s.strategies[strategyType] = strategyService
	s.logger.Info("Estratégia registrada", 
		logger.String("strategy", string(strategyType)),
		logger.String("name", strategyService.GetName()))
}

// GetAvailableStrategies retorna todas as estratégias disponíveis
func (s *StrategySimulator) GetAvailableStrategies() []strategy.InvestmentStrategyService {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	result := make([]strategy.InvestmentStrategyService, 0, len(s.strategies))
	for _, strat := range s.strategies {
		result = append(result, strat)
	}
	return result
}

// SimulateStrategy simula uma estratégia específica em um ativo
func (s *StrategySimulator) SimulateStrategy(
	ctx context.Context,
	strategyType entity.InvestmentStrategy,
	assetSymbol string,
	assetType assetEntity.AssetType,
	initialInvestment float64,
	timeHorizon int, // em dias
) (*simEntity.Simulation, error) {
	// Verificar se a estratégia existe
	s.mutex.RLock()
	strategyService, exists := s.strategies[strategyType]
	s.mutex.RUnlock()

	if !exists {
		return nil, fmt.Errorf("estratégia não encontrada: %s", string(strategyType))
	}

	// Buscar o ativo
	asset, err := s.assetRepo.GetBySymbol(ctx, assetSymbol, assetType)
	if err != nil {
		return nil, fmt.Errorf("ativo não encontrado: %w", err)
	}

	// Verificar se a estratégia é aplicável ao ativo
	if !strategyService.IsAssetSuitable(asset) {
		return nil, fmt.Errorf("a estratégia %s não é aplicável ao ativo %s", 
			strategyService.GetName(), assetSymbol)
	}

	// Buscar histórico de preços
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -timeHorizon)
	priceHistory, err := s.priceHistoryRepo.GetPriceHistory(
		ctx, 
		asset.GetID(), 
		valueobject.TimeframeDaily, 
		&startDate, 
		&endDate,
	)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar histórico de preços: %w", err)
	}

	if len(priceHistory.Data) < 2 {
		return nil, fmt.Errorf("histórico de preços insuficiente para simulação")
	}

	// Obter parâmetros da estratégia
	scenarios, stratTimeHorizon := strategyService.GetSimulationParameters(asset)

	// Usar os parâmetros da estratégia se o horizonte de tempo não foi especificado
	if timeHorizon <= 0 {
		timeHorizon = stratTimeHorizon
	}

	// Criar simulação
	entryPrice := asset.GetCurrentPrice()
	targetPrice := entryPrice * 1.2 // 20% de lucro como alvo padrão
	var stopLoss *float64
	stopLossValue := entryPrice * 0.9 // 10% de perda como stop loss padrão
	stopLoss = &stopLossValue

	simulation := simEntity.NewSimulation(
		fmt.Sprintf("Simulação %s - %s", strategyService.GetName(), assetSymbol),
		asset,
		strategyType,
		initialInvestment,
		entryPrice,
		targetPrice,
		stopLoss,
		timeHorizon,
		scenarios,
	)

	// Iniciar simulação
	simulation.Start()

	// Executar simulação para cada cenário
	for _, scenarioChange := range scenarios {
		// Calcular preço final baseado no cenário
		finalPrice := entryPrice * (1 + scenarioChange/100)
		
		// Calcular valor final do investimento
		finalAmount := (initialInvestment / entryPrice) * finalPrice
		
		// Adicionar resultado do cenário
		simulation.AddResult(scenarioChange, finalAmount, finalPrice)
	}

	// Simulação concluída
	simulation.Complete()

	return simulation, nil
}

// BacktestStrategy faz um backtesting da estratégia em dados históricos
func (s *StrategySimulator) BacktestStrategy(
	ctx context.Context,
	strategyType entity.InvestmentStrategy,
	assetSymbol string,
	assetType assetEntity.AssetType,
	initialInvestment float64,
	startDate, endDate time.Time,
) (*simEntity.BacktestResult, error) {
	// Verificar se a estratégia existe
	s.mutex.RLock()
	strategyService, exists := s.strategies[strategyType]
	s.mutex.RUnlock()

	if !exists {
		return nil, fmt.Errorf("estratégia não encontrada: %s", string(strategyType))
	}

	// Buscar o ativo
	asset, err := s.assetRepo.GetBySymbol(ctx, assetSymbol, assetType)
	if err != nil {
		return nil, fmt.Errorf("ativo não encontrado: %w", err)
	}

	// Verificar se a estratégia é aplicável ao ativo
	if !strategyService.IsAssetSuitable(asset) {
		return nil, fmt.Errorf("a estratégia %s não é aplicável ao ativo %s", 
			strategyService.GetName(), assetSymbol)
	}

	// Buscar histórico de preços
	priceHistory, err := s.priceHistoryRepo.GetPriceHistory(
		ctx, 
		asset.GetID(), 
		valueobject.TimeframeDaily, 
		&startDate, 
		&endDate,
	)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar histórico de preços: %w", err)
	}

	if len(priceHistory.Data) < 30 {
		return nil, fmt.Errorf("histórico de preços insuficiente para backtesting (mínimo 30 pontos)")
	}

	// Criar resultado de backtesting
	result := &simEntity.BacktestResult{
		Asset:             asset,
		Strategy:          strategyType,
		StrategyName:      strategyService.GetName(),
		InitialInvestment: initialInvestment,
		StartDate:         startDate,
		EndDate:           endDate,
		Trades:            make([]simEntity.Trade, 0),
		Statistics:        simEntity.BacktestStatistics{},
	}

	// Simular operações com a estratégia
	cash := initialInvestment
	assetUnits := 0.0
	inPosition := false
	entryPrice := 0.0
	entryIndex := 0

	// Para cada ponto no histórico, simular uma decisão da estratégia
	for i := 30; i < len(priceHistory.Data); i++ { // Começar após 30 pontos para ter dados suficientes
		currentPoint := priceHistory.Data[i]
		currentPrice := currentPoint.Close
		
		// Atualizar temporariamente o preço do ativo para a simulação
		asset.SetCurrentPrice(currentPrice)
		
		// Preparar o histórico para a análise (apenas os pontos até o momento atual)
		historicalData := priceHistory.Data[:i+1]
		tempHistory := valueobject.PriceHistory{
			AssetID:     priceHistory.AssetID,
			AssetSymbol: priceHistory.AssetSymbol,
			Timeframe:   priceHistory.Timeframe,
			Data:        historicalData,
		}
		
		if !inPosition {
			// Analisar se devemos comprar
			opportunity, err := strategyService.AnalyzeAsset(asset, tempHistory)
			if err == nil && opportunity != nil && opportunity.Type == entity.OpportunityBuy {
				// Comprar
				entryPrice = currentPrice
				entryIndex = i
				assetUnits = cash / currentPrice
				cash = 0
				inPosition = true
				
				// Registrar compra
				trade := simEntity.Trade{
					Type:       simEntity.TradeBuy,
					Price:      currentPrice,
					Units:      assetUnits,
					Value:      assetUnits * currentPrice,
					Date:       currentPoint.Timestamp,
					ProfitLoss: 0,
					Reason:     opportunity.Reason,
				}
				result.Trades = append(result.Trades, trade)
			}
		} else {
			// Já estamos em posição, verificar se devemos vender
			shouldSell, opportunityType, reason, err := strategyService.ShouldSell(
				asset, entryPrice, tempHistory)
			
			if err == nil && shouldSell {
				// Vender
				cash = assetUnits * currentPrice
				profitLoss := cash - (assetUnits * entryPrice)
				profitLossPerc := (profitLoss / (assetUnits * entryPrice)) * 100
				
				// Registrar venda
				trade := simEntity.Trade{
					Type:       simEntity.TradeSell,
					Price:      currentPrice,
					Units:      assetUnits,
					Value:      cash,
					Date:       currentPoint.Timestamp,
					ProfitLoss: profitLoss,
					ProfitLossPercentage: profitLossPerc,
					DaysHeld:   int(currentPoint.Timestamp.Sub(priceHistory.Data[entryIndex].Timestamp).Hours() / 24),
					Reason:     reason,
				}
				result.Trades = append(result.Trades, trade)
				
				// Atualizar estatísticas
				result.Statistics.TotalTrades++
				if profitLoss > 0 {
					result.Statistics.WinningTrades++
				} else {
					result.Statistics.LosingTrades++
				}
				
				result.Statistics.TotalProfit += profitLoss
				
				if profitLoss > result.Statistics.BiggestWin {
					result.Statistics.BiggestWin = profitLoss
				}
				
				if profitLoss < result.Statistics.BiggestLoss {
					result.Statistics.BiggestLoss = profitLoss
				}
				
				// Resetar posição
				assetUnits = 0
				inPosition = false
			}
		}
	}
	
	// Se ainda estamos em posição no final, simular venda ao último preço
	if inPosition {
		lastPrice := priceHistory.Data[len(priceHistory.Data)-1].Close
		lastDate := priceHistory.Data[len(priceHistory.Data)-1].Timestamp
		
		cash = assetUnits * lastPrice
		profitLoss := cash - (assetUnits * entryPrice)
		profitLossPerc := (profitLoss / (assetUnits * entryPrice)) * 100
		
		// Registrar venda final
		trade := simEntity.Trade{
			Type:       simEntity.TradeSell,
			Price:      lastPrice,
			Units:      assetUnits,
			Value:      cash,
			Date:       lastDate,
			ProfitLoss: profitLoss,
			ProfitLossPercentage: profitLossPerc,
			DaysHeld:   int(lastDate.Sub(priceHistory.Data[entryIndex].Timestamp).Hours() / 24),
			Reason:     "Fim do período de simulação",
		}
		result.Trades = append(result.Trades, trade)
		
		// Atualizar estatísticas
		result.Statistics.TotalTrades++
		if profitLoss > 0 {
			result.Statistics.WinningTrades++
		} else {
			result.Statistics.LosingTrades++
		}
		
		result.Statistics.TotalProfit += profitLoss
		
		if profitLoss > result.Statistics.BiggestWin {
			result.Statistics.BiggestWin = profitLoss
		}
		
		if profitLoss < result.Statistics.BiggestLoss {
			result.Statistics.BiggestLoss = profitLoss
		}
	}
	
	// Calcular estatísticas finais
	result.Statistics.FinalValue = cash
	result.Statistics.ProfitLossPercentage = ((cash - initialInvestment) / initialInvestment) * 100
	
	if result.Statistics.TotalTrades > 0 {
		result.Statistics.WinRate = float64(result.Statistics.WinningTrades) / float64(result.Statistics.TotalTrades) * 100
		
		// Calcular drawdown
		maxValue := initialInvestment
		maxDrawdown := 0.0
		
		currentValue := initialInvestment
		for _, trade := range result.Trades {
			if trade.Type == simEntity.TradeBuy {
				currentValue -= trade.Value
			} else {
				currentValue += trade.Value
			}
			
			if currentValue > maxValue {
				maxValue = currentValue
			}
			
			drawdown := (maxValue - currentValue) / maxValue * 100
			if drawdown > maxDrawdown {
				maxDrawdown = drawdown
			}
		}
		
		result.Statistics.MaxDrawdown = maxDrawdown
	}
	
	return result, nil
}

// CompareStrategies compara múltiplas estratégias no mesmo ativo
func (s *StrategySimulator) CompareStrategies(
	ctx context.Context,
	strategyTypes []entity.InvestmentStrategy,
	assetSymbol string,
	assetType assetEntity.AssetType,
	initialInvestment float64,
	startDate, endDate time.Time,
) (map[entity.InvestmentStrategy]*simEntity.BacktestResult, error) {
	results := make(map[entity.InvestmentStrategy]*simEntity.BacktestResult)
	
	for _, stratType := range strategyTypes {
		result, err := s.BacktestStrategy(
			ctx,
			stratType,
			assetSymbol,
			assetType,
			initialInvestment,
			startDate,
			endDate,
		)
		
		if err != nil {
			s.logger.Warn("Erro ao executar backtesting para estratégia",
				logger.String("strategy", string(stratType)),
				logger.String("asset", assetSymbol),
				logger.Error(err))
			continue
		}
		
		results[stratType] = result
	}
	
	if len(results) == 0 {
		return nil, fmt.Errorf("nenhuma estratégia pôde ser testada com sucesso")
	}
	
	return results, nil
}