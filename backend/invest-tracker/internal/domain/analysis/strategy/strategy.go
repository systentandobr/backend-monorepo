// internal/domain/analysis/strategy/strategy.go
package strategy

import (
	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/analysis/entity"
	assetEntity "github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/valueobject"
)

// InvestmentStrategyService define a interface para diferentes estratégias de investimento
type InvestmentStrategyService interface {
	// Retorna o tipo da estratégia
	GetType() entity.InvestmentStrategy
	
	// Retorna o nome da estratégia
	GetName() string
	
	// Retorna a descrição da estratégia
	GetDescription() string
	
	// Verifica se um ativo é adequado para a estratégia
	IsAssetSuitable(asset assetEntity.Asset) bool
	
	// Analisa um ativo e retorna oportunidades de investimento
	AnalyzeAsset(asset assetEntity.Asset, priceHistory valueobject.PriceHistory) (*entity.InvestmentOpportunity, error)
	
	// Verifica se é hora de vender um ativo
	ShouldSell(asset assetEntity.Asset, entryPrice float64, priceHistory valueobject.PriceHistory) (bool, entity.OpportunityType, string, error)
	
	// Retorna parâmetros para simulação
	GetSimulationParameters(asset assetEntity.Asset) (scenarios []float64, timeHorizon int)
}