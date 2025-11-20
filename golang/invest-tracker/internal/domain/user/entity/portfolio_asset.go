package entity

import (
	"time"
)

// PortfolioAsset represents an asset in a user's portfolio
type PortfolioAsset struct {
	ID                   string    `json:"id" bson:"_id"`
	PortfolioID          string    `json:"portfolioId" bson:"portfolio_id"`
	AssetID              string    `json:"assetId" bson:"asset_id"`
	Symbol               string    `json:"symbol" bson:"symbol"`
	Name                 string    `json:"name" bson:"name"`
	Quantity             float64   `json:"quantity" bson:"quantity"`
	AveragePrice         float64   `json:"averagePrice" bson:"average_price"`
	CurrentPrice         float64   `json:"currentPrice" bson:"current_price"`
	TotalValue           float64   `json:"totalValue" bson:"total_value"`
	ProfitLoss           float64   `json:"profitLoss" bson:"profit_loss"`
	ProfitLossPercentage float64   `json:"profitLossPercentage" bson:"profit_loss_percentage"`
	LastUpdated          time.Time `json:"lastUpdated" bson:"last_updated"`
}

// NewPortfolioAsset creates a new portfolio asset instance
func NewPortfolioAsset(portfolioID, assetID, symbol, name string, quantity, averagePrice, currentPrice float64) *PortfolioAsset {
	totalValue := quantity * currentPrice
	profitLoss := totalValue - (quantity * averagePrice)
	profitLossPercentage := 0.0
	if quantity*averagePrice > 0 {
		profitLossPercentage = (profitLoss / (quantity * averagePrice)) * 100
	}

	return &PortfolioAsset{
		PortfolioID:          portfolioID,
		AssetID:              assetID,
		Symbol:               symbol,
		Name:                 name,
		Quantity:             quantity,
		AveragePrice:         averagePrice,
		CurrentPrice:         currentPrice,
		TotalValue:           totalValue,
		ProfitLoss:           profitLoss,
		ProfitLossPercentage: profitLossPercentage,
		LastUpdated:          time.Now(),
	}
}
