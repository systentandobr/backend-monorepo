package service

import (
	"context"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/analysis/entity"
)

// MarketAnalysisService defines the interface for MarketAnalysis business logic
type MarketAnalysisService interface {
	// GetMarketAnalysis retrieves a MarketAnalysis by its ID
	GetMarketAnalysis(ctx context.Context, id string) (*entity.MarketAnalysis, error)
	
	// GetAllmarketanalysiss retrieves all marketanalysiss based on optional filter
	GetAllmarketanalysiss(ctx context.Context, filter map[string]interface{}) ([]*entity.MarketAnalysis, error)
	
	// CreateMarketAnalysis creates a new MarketAnalysis
	CreateMarketAnalysis(ctx context.Context, name, description string) (*entity.MarketAnalysis, error)
	
	// UpdateMarketAnalysis updates an existing MarketAnalysis
	UpdateMarketAnalysis(ctx context.Context, id, name, description string) (*entity.MarketAnalysis, error)
	
	// DeleteMarketAnalysis removes a MarketAnalysis by its ID
	DeleteMarketAnalysis(ctx context.Context, id string) error
}
