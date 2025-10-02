package factory

import (
    "github.com/gin-gonic/gin"
    "github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/adapter/controller"
    "github.com/systentandobr/backend-monorepo/golang/invest-tracker/pkg/common/logger"
    "github.com/systentandobr/toolkit/go/shared/infrastructure/persistence/mongodb"
)

// AssetFactory manages asset domain components
type AssetFactory struct {
    client interface{}
    logger logger.Logger
    controller *controller.AssetController
}

// NewAssetFactory creates a new asset factory
func NewAssetFactory(logger logger.Logger) *AssetFactory {
    return &AssetFactory{
        logger: logger,
        controller: controller.NewAssetController(logger),
    }
}

// Bootstrap initializes domain components
func (f *AssetFactory) Bootstrap() {
    client, err := mongodb.GetClient()
    if err != nil {
        f.logger.Error("Failed to get MongoDB client", logger.Error(err))
        return
    }
    f.client = client
}

// RegisterRoutes registers domain routes
func (f *AssetFactory) RegisterRoutes(router interface{}) {
    if ginRouter, ok := router.(*gin.RouterGroup); ok {
        f.controller.RegisterRoutes(ginRouter)
    }
}

// GetStockService returns the stock service
func (f *AssetFactory) GetStockService() interface{} {
    return nil
}
