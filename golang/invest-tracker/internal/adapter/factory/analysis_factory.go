package factory

import (
    "github.com/gin-gonic/gin"
    "github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/adapter/controller"
    "github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/domain/analysis/service"
    "github.com/systentandobr/backend-monorepo/golang/invest-tracker/pkg/common/logger"
    "github.com/systentandobr/toolkit/go/shared/infrastructure/persistence/mongodb"
)

// AnalysisFactory manages analysis domain components
type AnalysisFactory struct {
    client interface{}
    logger logger.Logger
}

// NewAnalysisFactory creates a new analysis factory
func NewAnalysisFactory(logger logger.Logger) *AnalysisFactory {
    return &AnalysisFactory{
        logger: logger,
    }
}

// Bootstrap initializes domain components
func (f *AnalysisFactory) Bootstrap() {
    client, err := mongodb.GetClient()
    if err != nil {
        f.logger.Error("Failed to get MongoDB client", logger.Error(err))
        return
    }
    f.client = client
}

// RegisterRoutes registers domain routes
func (f *AnalysisFactory) RegisterRoutes(router interface{}) {
    if ginRouter, ok := router.(*gin.RouterGroup); ok {
        controller := controller.NewAnalysisController(f.logger)
        controller.RegisterRoutes(ginRouter)
    }
}

// GetMarketAnalysisService returns the market analysis service
func (f *AnalysisFactory) GetMarketAnalysisService() service.MarketAnalysisService {
    return nil
}

// GetOpportunityService returns the opportunity service
func (f *AnalysisFactory) GetOpportunityService() service.OpportunityService {
    return nil
}
