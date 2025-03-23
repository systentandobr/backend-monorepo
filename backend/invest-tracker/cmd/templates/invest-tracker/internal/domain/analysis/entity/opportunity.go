package entity

import (
	"time"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/errors"
)

// Opportunity represents a opportunity in the system
type Opportunity struct {
	ID          string    `json:"id" bson:"_id"`
	Name        string    `json:"name" bson:"name"`
	Description string    `json:"description" bson:"description"`
	CreatedAt   time.Time `json:"createdAt" bson:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" bson:"updated_at"`
}

// Validate checks if the entity data is valid
func (e *Opportunity) Validate() error {
	if e.Name == "" {
		return errors.NewValidationError("name is required", nil, nil)
	}
	
	return nil
}

// BeforeSave prepares the entity before saving
func (e *Opportunity) BeforeSave() {
	now := time.Now()
	
	if e.CreatedAt.IsZero() {
		e.CreatedAt = now
	}
	
	e.UpdatedAt = now
}

// NewOpportunity creates a new Opportunity instance
func NewOpportunity(name, description string) *Opportunity {
	return &Opportunity{
		Name:        name,
		Description: description,
	}
}
