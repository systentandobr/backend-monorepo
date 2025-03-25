package factory

import (
    "github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/logger"
    "github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/infrastructure/database/mongodb"
)

// AssetFactory manages asset domain components
type AssetFactory struct {}

// NewAssetFactory creates a new asset factory
func NewAssetFactory(client *mongodb.Client, logger logger.Logger) *AssetFactory {
    return &AssetFactory{}
}

// Bootstrap initializes domain components
func (f *AssetFactory) Bootstrap() {}

// RegisterRoutes registers domain routes
func (f *AssetFactory) RegisterRoutes(router interface{}) {}

// GetStockService returns the stock service
func (f *AssetFactory) GetStockService() interface{} {
    return nil
}
