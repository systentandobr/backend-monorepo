package output

import (
	"context"
	
	"github.com/systentandobr/life-tracker/internal/domain/entity/business"
)

// BusinessIdeaRepository defines the operations for BusinessIdea persistence
type BusinessIdeaRepository interface {
	Repository[business.BusinessIdea]
	FindByUserID(ctx context.Context, userID string) ([]business.BusinessIdea, error)
}