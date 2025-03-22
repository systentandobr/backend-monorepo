package repository

import (
	"context"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/entity"
)

type AssetRepository interface {
	// Basic CRUD
	GetByID(ctx context.Context, id string) (entity.Asset, error)
	GetBySymbol(ctx context.Context, symbol string, assetType entity.AssetType) (entity.Asset, error)
	GetAll(ctx context.Context, filter map[string]interface{}) ([]entity.Asset, error)
	GetByType(ctx context.Context, assetType entity.AssetType) ([]entity.Asset, error)
	Save(ctx context.Context, asset entity.Asset) error
	Update(ctx context.Context, asset entity.Asset) error
	
	// Specialized queries
	GetFavorites(ctx context.Context) ([]entity.Asset, error)
	UpdatePrice(ctx context.Context, id string, price float64) error
	Search(ctx context.Context, query string, types []entity.AssetType) ([]entity.Asset, error)
}

// Common error types
var (
	ErrAssetNotFound = NewRepositoryError("asset not found")
	ErrDuplicateAsset = NewRepositoryError("asset already exists")
)

type RepositoryError struct {
	Message string
}

func (e RepositoryError) Error() string {
	return e.Message
}

func NewRepositoryError(message string) RepositoryError {
	return RepositoryError{Message: message}
}
