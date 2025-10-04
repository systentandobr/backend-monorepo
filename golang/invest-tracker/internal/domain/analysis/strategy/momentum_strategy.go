package strategy

import (
	"github.com/systentandobr/invest-tracker/internal/domain/analysis/entity"
	assetEntity "github.com/systentandobr/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/invest-tracker/internal/domain/asset/valueobject"
)

// MomentumInvestmentStrategy implements the Momentum Investment strategy
type MomentumInvestmentStrategy struct{}

// NewMomentumInvestmentStrategy creates a new instance of the strategy
func NewMomentumInvestmentStrategy() *MomentumInvestmentStrategy {
	return &MomentumInvestmentStrategy{}
}

// GetType returns the strategy type
func (s *MomentumInvestmentStrategy) GetType() entity.InvestmentStrategy {
	return entity.StrategyMomentum
}

// GetName returns the strategy name
func (s *MomentumInvestmentStrategy) GetName() string {
	return "Momentum Investment"
}

// GetDescription returns the strategy description
func (s *MomentumInvestmentStrategy) GetDescription() string {
	return "Focuses on assets that have shown significant price appreciation"
}

// IsAssetSuitable checks if an asset is suitable for this strategy
func (s *MomentumInvestmentStrategy) IsAssetSuitable(asset assetEntity.Asset) bool {
	return true
}

// AnalyzeAsset analyzes an asset and returns investment opportunities
func (s *MomentumInvestmentStrategy) AnalyzeAsset(asset assetEntity.Asset, priceHistory valueobject.PriceHistory) (*entity.InvestmentOpportunity, error) {
	// Simplified implementation
	return nil, nil
}

// ShouldSell checks if an asset should be sold
func (s *MomentumInvestmentStrategy) ShouldSell(asset assetEntity.Asset, entryPrice float64, priceHistory valueobject.PriceHistory) (bool, entity.OpportunityType, string, error) {
	return false, entity.OpportunityHold, "Momentum still intact", nil
}

// GetSimulationParameters returns parameters for simulation
func (s *MomentumInvestmentStrategy) GetSimulationParameters(asset assetEntity.Asset) ([]float64, int) {
	scenarios := []float64{-25, -15, -5, 5, 15, 25, 35}
	timeHorizon := 90 // 90 days default
	return scenarios, timeHorizon
}
