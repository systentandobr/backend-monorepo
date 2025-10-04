package repository

import (
	"context"
	"fmt"

	"github.com/systentandobr/invest-tracker/internal/domain/analysis/entity"
)

// OpportunityRepository defines the interface for investment opportunity data access
type OpportunityRepository interface {
	// FindByID retrieves an opportunity by its ID
	FindByID(ctx context.Context, id string) (*entity.InvestmentOpportunity, error)
	
	// FindAll retrieves all opportunities based on optional filter
	FindAll(ctx context.Context, filter map[string]interface{}) ([]*entity.InvestmentOpportunity, error)
	
	// Create stores a new opportunity
	Create(ctx context.Context, opportunity *entity.InvestmentOpportunity) error
	
	// Update modifies an existing opportunity
	Update(ctx context.Context, opportunity *entity.InvestmentOpportunity) error
	
	// Delete removes an opportunity by its ID
	Delete(ctx context.Context, id string) error
}

// Common error types
var (
	ErrOpportunityNotFound = fmt.Errorf("opportunity not found")
	ErrOpportunityDuplicate = fmt.Errorf("opportunity already exists")
)
