package strategy

import (
	"github.com/systentandobr/invest-tracker/internal/domain/analysis/entity"
	assetEntity "github.com/systentandobr/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/invest-tracker/internal/domain/asset/valueobject"
)

// InvestmentStrategyService defines the interface for different investment strategies
type InvestmentStrategyService interface {
	// Returns the strategy type
	GetType() entity.InvestmentStrategy
	
	// Returns the strategy name
	GetName() string
	
	// Returns the strategy description
	GetDescription() string
	
	// Checks if an asset is suitable for this strategy
	IsAssetSuitable(asset assetEntity.Asset) bool
	
	// Analyzes an asset and returns investment opportunities
	AnalyzeAsset(asset assetEntity.Asset, priceHistory valueobject.PriceHistory) (*entity.InvestmentOpportunity, error)
	
	// Checks if an asset should be sold 
	ShouldSell(asset assetEntity.Asset, entryPrice float64, priceHistory valueobject.PriceHistory) (bool, entity.OpportunityType, string, error)
	
	// Returns parameters for simulation
	GetSimulationParameters(asset assetEntity.Asset) (scenarios []float64, timeHorizon int)
}
