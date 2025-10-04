package factory

import (
    "github.com/gin-gonic/gin"
    "github.com/systentandobr/invest-tracker/internal/adapter/controller"
    "github.com/systentandobr/invest-tracker/pkg/common/logger"
    "github.com/systentandobr/toolkit/go/shared/infrastructure/persistence/mongodb"
)

// SimulationFactory manages simulation domain components
type SimulationFactory struct {
    client interface{}
    logger logger.Logger
}

// NewSimulationFactory creates a new simulation factory
func NewSimulationFactory(logger logger.Logger) *SimulationFactory {
    return &SimulationFactory{
        logger: logger,
    }
}

// Bootstrap initializes domain components
func (f *SimulationFactory) Bootstrap() {
    client, err := mongodb.GetClient()
    if err != nil {
        f.logger.Error("Failed to get MongoDB client", logger.Error(err))
        return
    }
    f.client = client
}

// RegisterRoutes registers domain routes
func (f *SimulationFactory) RegisterRoutes(router interface{}) {
    if ginRouter, ok := router.(*gin.RouterGroup); ok {
        controller := controller.NewSimulationController(f.logger)
        controller.RegisterRoutes(ginRouter)
    }
}
