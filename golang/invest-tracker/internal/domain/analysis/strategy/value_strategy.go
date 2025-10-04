package strategy

import (
	"github.com/systentandobr/invest-tracker/internal/domain/analysis/entity"
	assetEntity "github.com/systentandobr/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/invest-tracker/internal/domain/asset/valueobject"
)

// ValueInvestmentStrategy implements the Value Investment strategy
type ValueInvestmentStrategy struct{}

// NewValueInvestmentStrategy creates a new instance of the strategy
func NewValueInvestmentStrategy() *ValueInvestmentStrategy {
	return &ValueInvestmentStrategy{}
}

// GetType returns the strategy type
func (s *ValueInvestmentStrategy) GetType() entity.InvestmentStrategy {
	return entity.StrategyValue
}

// GetName returns the strategy name
func (s *ValueInvestmentStrategy) GetName() string {
	return "Value Investment"
}

// GetDescription returns the strategy description
func (s *ValueInvestmentStrategy) GetDescription() string {
	return "Focuses on stocks trading below their intrinsic value"
}

// IsAssetSuitable checks if an asset is suitable for this strategy
func (s *ValueInvestmentStrategy) IsAssetSuitable(asset assetEntity.Asset) bool {
	return asset.GetType() == assetEntity.AssetTypeStock || asset.GetType() == assetEntity.AssetTypeREIT
}

// AnalyzeAsset analyzes an asset and returns investment opportunities
func (s *ValueInvestmentStrategy) AnalyzeAsset(asset assetEntity.Asset, priceHistory valueobject.PriceHistory) (*entity.InvestmentOpportunity, error) {
	// Simplified implementation
	return nil, nil
}

// ShouldSell checks if an asset should be sold
func (s *ValueInvestmentStrategy) ShouldSell(asset assetEntity.Asset, entryPrice float64, priceHistory valueobject.PriceHistory) (bool, entity.OpportunityType, string, error) {
	return false, entity.OpportunityHold, "Asset still appears reasonably valued", nil
}

// GetSimulationParameters returns parameters for simulation
func (s *ValueInvestmentStrategy) GetSimulationParameters(asset assetEntity.Asset) ([]float64, int) {
	scenarios := []float64{-20, -10, -5, 0, 5, 10, 15, 20, 30}
	timeHorizon := 1080 // 3 years in days
	return scenarios, timeHorizon
}
