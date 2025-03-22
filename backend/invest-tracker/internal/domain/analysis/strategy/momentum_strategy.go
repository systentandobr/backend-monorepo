// internal/domain/analysis/strategy/momentum_strategy.go
package strategy

import (
	"fmt"
	"math"
	"strings"
	"strconv"

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

// calculateVolatility calcula a volatilidade
func (s *MomentumStrategy) calculateVolatility(priceHistory valueobject.PriceHistory, days int) float64 {
	if len(priceHistory.Data) < days {
		return 0
	}

	// Calc