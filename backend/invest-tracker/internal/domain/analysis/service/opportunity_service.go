package service

import (
	"context"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/analysis/entity"
	assetEntity "github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/entity"
)

// OpportunityService defines the interface for opportunity business logic
type OpportunityService interface {
	// GetOpportunity retrieves an opportunity by its ID
	GetOpportunity(ctx context.Context, id string) (*entity.InvestmentOpportunity, error)
	
	// GetAllOpportunities retrieves all opportunities based on optional filter
	GetAllOpportunities(ctx context.Context, filter map[string]interface{}) ([]*entity.InvestmentOpportunity, error)
	
	// GetActiveOpportunities retrieves all non-expired opportunities
	GetActiveOpportunities(ctx context.Context) ([]*entity.InvestmentOpportunity, error)
	
	// CreateOpportunity creates a new investment opportunity
	CreateOpportunity(ctx context.Context, 
		assetID string, 
		opportunityType entity.OpportunityType,
		reason string,
		potentialReturn float64,
		riskLevel entity.RiskLevel,
		strategy entity.InvestmentStrategy,
	) (*entity.InvestmentOpportunity, error)
	
	// DeleteOpportunity removes an opportunity by its ID
	DeleteOpportunity(ctx context.Context, id string) error
	
	// DetectOpportunities detects new investment opportunities
	DetectOpportunities(ctx context.Context, assetType assetEntity.AssetType) ([]*entity.InvestmentOpportunity, error)
}
