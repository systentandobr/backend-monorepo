// internal/domain/analysis/strategy/momentum_strategy.go
package strategy

import (
	"fmt"
	"math"
	"strings"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/analysis/entity"
	assetEntity "github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/valueobject"
)

// MomentumStrategy implementa a estratégia de investimento baseada em momentum
type MomentumStrategy struct{}

// NewMomentumStrategy cria uma nova instância da estratégia
func NewMomentumStrategy() *MomentumStrategy {
	return &MomentumStrategy{}
}

// GetType retorna o tipo da estratégia
func (s *MomentumStrategy) GetType() entity.InvestmentStrategy {
	return entity.StrategyMomentum
}

// GetName retorna o nome da estratégia
func (s *MomentumStrategy) GetName() string {
	return "Momentum"
}

// GetDescription retorna a descrição da estratégia
func (s *MomentumStrategy) GetDescription() string {
	return "Estratégia que busca capitalizar sobre a tendência de continuidade dos preços, " +
		"comprando ativos que estão em alta e vendendo quando o momentum perder força."
}

// IsAssetSuitable verifica se um ativo é adequado para esta estratégia
func (s *MomentumStrategy) IsAssetSuitable(asset assetEntity.Asset) bool {
	// A estratégia de momentum pode ser aplicada a qualquer tipo de ativo
	return true
}

// AnalyzeAsset analisa um ativo e identifica oportunidades de investimento
func (s *MomentumStrategy) AnalyzeAsset(
	asset assetEntity.Asset,
	priceHistory valueobject.PriceHistory,
) (*entity.InvestmentOpportunity, error) {
	if len(priceHistory.Data) < 30 {
		return nil, nil // Dados insuficientes para análise
	}

	// Calcular momentum de curto e longo prazo
	shortTermChange := s.calculateRecentPerformance(priceHistory, 14) // 14 dias
	longTermChange := s.calculateRecentPerformance(priceHistory, 90)  // 90 dias

	// Calcular volatilidade
	volatility := s.calculateVolatility(priceHistory, 30)

	// Avaliar a oportunidade
	score := 0
	reasons := []string{}

	// Forte momentum de curto prazo
	if shortTermChange > 5 {
		score++
		reasons = append(reasons, fmt.Sprintf("Forte momentum de 14 dias (+%.2f%%)", shortTermChange))
	}

	// Forte momentum de longo prazo
	if longTermChange > 15 {
		score++
		reasons = append(reasons, fmt.Sprintf("Forte momentum de 90 dias (+%.2f%%)", longTermChange))
	}

	// Volume crescente
	if s.hasRisingVolume(priceHistory, 14) {
		score++
		reasons = append(reasons, "Volume de negociação crescente")
	}

	// Ativo próximo da máxima histórica
	if s.isNearAllTimeHigh(priceHistory) {
		score++
		reasons = append(reasons, "Preço próximo da máxima histórica")
	}

	// Criar oportunidade se o score for bom
	if score >= 2 {
		reason := "Oportunidade Momentum: " + strings.Join(reasons, ", ")

		// Determinar nível de risco baseado no tipo de ativo e volatilidade
		riskLevel := entity.RiskMedium
		if asset.GetType() == assetEntity.AssetTypeCrypto || volatility > 3.0 {
			riskLevel = entity.RiskHigh
		}

		// Estimar retorno potencial baseado no momentum recente
		potentialReturn := math.Max(shortTermChange*1.5, 10.0)

		return entity.NewInvestmentOpportunity(
			asset,
			entity.OpportunityBuy,
			reason,
			potentialReturn,
			riskLevel,
			entity.StrategyMomentum,
		), nil
	}

	return nil, nil
}

// ShouldSell verifica se é hora de vender um ativo
func (s *MomentumStrategy) ShouldSell(
	asset assetEntity.Asset,
	entryPrice float64,
	priceHistory valueobject.PriceHistory,
) (bool, entity.OpportunityType, string, error) {
	if len(priceHistory.Data) < 14 {
		return false, entity.OpportunityHold, "Dados insuficientes para análise", nil
	}

	currentPrice := asset.GetCurrentPrice()
	percentGain := ((currentPrice - entryPrice) / entryPrice) * 100

	// Realizar lucro se ganho significativo
	if percentGain > 20 {
		return true, entity.OpportunitySell, "Lucro alvo de 20% atingido", nil
	}

	// Calcular momentum recente
	recentChange := s.calculateRecentPerformance(priceHistory, 7)

	// Vender se o momentum estiver revertendo
	if recentChange < -5 {
		return true, entity.OpportunitySell, "Reversão de momentum detectada", nil
	}

	// Vender se o preço cair abaixo da média móvel
	sma, err := s.calculateSMA(priceHistory, 14)
	if err == nil && len(sma) > 0 && currentPrice < sma[len(sma)-1] {
		return true, entity.OpportunitySell, "Preço abaixo da média móvel de 14 dias", nil
	}

	return false, entity.OpportunityHold, "Momentum ainda intacto", nil
}

// GetSimulationParameters retorna parâmetros para simulação
func (s *MomentumStrategy) GetSimulationParameters(asset assetEntity.Asset) ([]float64, int) {
	// Estratégia de momentum tipicamente tem horizonte de tempo mais curto
	scenarios := []float64{-25, -15, -5, 5, 15, 25, 35}

	// O horizonte de tempo depende do tipo de ativo
	timeHorizon := 90 // 90 dias padrão
	if asset.GetType() == assetEntity.AssetTypeCrypto {
		timeHorizon = 30 // Mais curto para cripto
	}

	return scenarios, timeHorizon
}

// Funções auxiliares

// calculateRecentPerformance calcula o desempenho recente
func (s *MomentumStrategy) calculateRecentPerformance(priceHistory valueobject.PriceHistory, days int) float64 {
	if len(priceHistory.Data) < days {
		return 0
	}

	// Assumindo que os dados estão ordenados por tempo, mais recente por último
	current := priceHistory.Data[len(priceHistory.Data)-1].Close
	past := priceHistory.Data[len(priceHistory.Data)-days].Close

	return ((current - past) / past) * 100
}

// calculateVolatility calcula a volatilidade baseada no desvio padrão das mudanças percentuais
func (s *MomentumStrategy) calculateVolatility(priceHistory valueobject.PriceHistory, days int) float64 {
	if len(priceHistory.Data) < days {
		return 0
	}

	// Limitar ao número de dias especificado
	startIdx := len(priceHistory.Data) - days
	if startIdx < 0 {
		startIdx = 0
	}

	// Calcular as mudanças percentuais diárias
	changes := make([]float64, 0, days-1)
	for i := startIdx + 1; i < len(priceHistory.Data); i++ {
		prev := priceHistory.Data[i-1].Close
		curr := priceHistory.Data[i].Close
		dailyChange := ((curr - prev) / prev) * 100
		changes = append(changes, dailyChange)
	}

	// Calcular a média das mudanças
	var sum float64
	for _, change := range changes {
		sum += change
	}
	mean := sum / float64(len(changes))

	// Calcular o desvio padrão
	var sumSquares float64
	for _, change := range changes {
		diff := change - mean
		sumSquares += diff * diff
	}
	variance := sumSquares / float64(len(changes))
	
	return math.Sqrt(variance)
}

// hasRisingVolume verifica se o volume de negociação está aumentando
func (s *MomentumStrategy) hasRisingVolume(priceHistory valueobject.PriceHistory, days int) bool {
	if len(priceHistory.Data) < days*2 {
		return false
	}

	// Calcular volume médio no período recente vs. período anterior
	recentVolumeSum := 0.0
	previousVolumeSum := 0.0

	for i := 0; i < days; i++ {
		recentIdx := len(priceHistory.Data) - 1 - i
		previousIdx := recentIdx - days

		if recentIdx >= 0 && previousIdx >= 0 {
			recentVolumeSum += priceHistory.Data[recentIdx].Volume
			previousVolumeSum += priceHistory.Data[previousIdx].Volume
		}
	}

	recentAvgVolume := recentVolumeSum / float64(days)
	previousAvgVolume := previousVolumeSum / float64(days)

	// Verificar se o volume recente é pelo menos 20% maior
	return recentAvgVolume > (previousAvgVolume * 1.2)
}

// isNearAllTimeHigh verifica se o preço está próximo da máxima histórica
func (s *MomentumStrategy) isNearAllTimeHigh(priceHistory valueobject.PriceHistory) bool {
	if len(priceHistory.Data) < 2 {
		return false
	}

	// Encontrar o preço máximo no histórico
	maxPrice := 0.0
	for _, point := range priceHistory.Data {
		if point.High > maxPrice {
			maxPrice = point.High
		}
	}

	// Verificar se o preço atual está a pelo menos 90% do máximo histórico
	currentPrice := priceHistory.Data[len(priceHistory.Data)-1].Close
	return currentPrice >= (maxPrice * 0.9)
}

// calculateSMA calcula a média móvel simples
func (s *MomentumStrategy) calculateSMA(priceHistory valueobject.PriceHistory, period int) ([]float64, error) {
	if len(priceHistory.Data) < period {
		return nil, fmt.Errorf("dados insuficientes para calcular SMA de %d períodos", period)
	}

	sma := make([]float64, 0, len(priceHistory.Data)-period+1)
	
	// Calcular SMA para cada janela de tempo
	for i := period - 1; i < len(priceHistory.Data); i++ {
		var sum float64
		for j := 0; j < period; j++ {
			sum += priceHistory.Data[i-j].Close
		}
		sma = append(sma, sum/float64(period))
	}
	
	return sma, nil
}