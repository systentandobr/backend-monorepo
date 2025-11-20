package entity

import (
	"time"
)

// Portfolio represents a user's investment portfolio
type Portfolio struct {
	ID                      string          `json:"id" bson:"_id"`
	UserID                  string          `json:"userId" bson:"user_id"`
	TotalValue              float64         `json:"totalValue" bson:"total_value"`
	TotalInvested           float64         `json:"totalInvested" bson:"total_invested"`
	TotalProfitLoss         float64         `json:"totalProfitLoss" bson:"total_profit_loss"`
	TotalProfitLossPercentage float64       `json:"totalProfitLossPercentage" bson:"total_profit_loss_percentage"`
	Assets                  []PortfolioAsset `json:"assets" bson:"assets"`
	LastUpdated             time.Time       `json:"lastUpdated" bson:"last_updated"`
}

// NewPortfolio creates a new portfolio instance
func NewPortfolio(userID string) *Portfolio {
	return &Portfolio{
		UserID:      userID,
		TotalValue:  0,
		TotalInvested: 0,
		TotalProfitLoss: 0,
		TotalProfitLossPercentage: 0,
		Assets:      []PortfolioAsset{},
		LastUpdated: time.Now(),
	}
}
