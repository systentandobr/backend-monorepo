package repository

import (
	"context"
	"fmt"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/analysis/entity"
)

// MarketAnalysisRepository defines the interface for MarketAnalysis data access
type MarketAnalysisRepository interface {
	// FindByID retrieves a MarketAnalysis by its ID
	FindByID(ctx context.Context, id string) (*entity.MarketAnalysis, error)
	
	// FindAll retrieves all market analyses based on optional filter
	FindAll(ctx context.Context, filter map[string]interface{}) ([]*entity.MarketAnalysis, error)
	
	// Create stores a new MarketAnalysis
	Create(ctx context.Context, marketanalysis *entity.MarketAnalysis) error
	
	// Update modifies an existing MarketAnalysis
	Update(ctx context.Context, marketanalysis *entity.MarketAnalysis) error
	
	// Delete removes a MarketAnalysis by its ID
	Delete(ctx context.Context, id string) error
}

// Common error types for repositories
var (
	ErrMarketAnalysisNotFound = fmt.Errorf("marketanalysis not found")
	ErrMarketAnalysisDuplicate = fmt.Errorf("marketanalysis already exists")
)
