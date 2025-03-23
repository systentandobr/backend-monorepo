package service

import (
	"context"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/analysis/entity"
)

// OpportunityService defines the interface for Opportunity business logic
type OpportunityService interface {
	// GetOpportunity retrieves a Opportunity by its ID
	GetOpportunity(ctx context.Context, id string) (*entity.Opportunity, error)
	
	// GetAllopportunities retrieves all opportunities based on optional filter
	GetAllopportunities(ctx context.Context, filter map[string]interface{}) ([]*entity.Opportunity, error)
	
	// CreateOpportunity creates a new Opportunity
	CreateOpportunity(ctx context.Context, name, description string) (*entity.Opportunity, error)
	
	// UpdateOpportunity updates an existing Opportunity
	UpdateOpportunity(ctx context.Context, id, name, description string) (*entity.Opportunity, error)
	
	// DeleteOpportunity removes a Opportunity by its ID
	DeleteOpportunity(ctx context.Context, id string) error
}
