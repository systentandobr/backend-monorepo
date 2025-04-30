package entity

import (
	"time"

	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/pkg/common/errors"
)

// MarketAnalysis represents a marketanalysis in the system
type MarketAnalysis struct {
	ID          string    `json:"id" bson:"_id"`
	Name        string    `json:"name" bson:"name"`
	Description string    `json:"description" bson:"description"`
	CreatedAt   time.Time `json:"createdAt" bson:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" bson:"updated_at"`
}

// Validate checks if the entity data is valid
func (e *MarketAnalysis) Validate() error {
	if e.Name == "" {
		return errors.NewValidationError("name is required", nil, nil)
	}
	
	return nil
}

// BeforeSave prepares the entity before saving
func (e *MarketAnalysis) BeforeSave() {
	now := time.Now()
	
	if e.CreatedAt.IsZero() {
		e.CreatedAt = now
	}
	
	e.UpdatedAt = now
}

// NewMarketAnalysis creates a new MarketAnalysis instance
func NewMarketAnalysis(name, description string) *MarketAnalysis {
	return &MarketAnalysis{
		Name:        name,
		Description: description,
	}
}
