package output

import (
	"context"
)

// Generic Repository interface
type Repository[T any] interface {
	FindByID(ctx context.Context, id string) (T, error)
	FindAll(ctx context.Context, filter map[string]interface{}) ([]T, error)
	Save(ctx context.Context, entity T) error
	Update(ctx context.Context, entity T) error
	Delete(ctx context.Context, id string) error
}

// AssetRepository extends the generic Repository
type AssetRepository interface {
	Repository[interface{}] // Replace with proper Asset type
	FindBySymbol(ctx context.Context, userID string, symbol string) (interface{}, error)
	UpdatePrice(ctx context.Context, symbol string, price float64) error
}

// GoalRepository extends the generic Repository
type GoalRepository interface {
	Repository[interface{}] // Replace with proper Goal type
	FindByUserID(ctx context.Context, userID string) ([]interface{}, error)
	FindByCategory(ctx context.Context, userID string, category string) ([]interface{}, error)
	FindActive(ctx context.Context, userID string) ([]interface{}, error)
	UpdateProgress(ctx context.Context, goalID string, progress float64) error
}
