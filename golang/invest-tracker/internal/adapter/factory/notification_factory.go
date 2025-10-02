package factory

import (
    "github.com/gin-gonic/gin"
    "github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/adapter/controller"
    "github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/domain/notification/service"
    "github.com/systentandobr/backend-monorepo/golang/invest-tracker/pkg/common/logger"
    "github.com/systentandobr/toolkit/go/shared/infrastructure/persistence/mongodb"
)

// NotificationFactory manages notification domain components
type NotificationFactory struct {
    client interface{}
    logger logger.Logger
}

// NewNotificationFactory creates a new notification factory
func NewNotificationFactory(logger logger.Logger) *NotificationFactory {
    return &NotificationFactory{
        logger: logger,
    }
}

// Bootstrap initializes domain components
func (f *NotificationFactory) Bootstrap() {
    client, err := mongodb.GetClient()
    if err != nil {
        f.logger.Error("Failed to get MongoDB client", logger.Error(err))
        return
    }
    f.client = client
}

// RegisterRoutes registers domain routes
func (f *NotificationFactory) RegisterRoutes(router interface{}) {
    if ginRouter, ok := router.(*gin.RouterGroup); ok {
        controller := controller.NewNotificationController(f.logger)
        controller.RegisterRoutes(ginRouter)
    }
}

// GetNotificationService returns the notification service
func (f *NotificationFactory) GetNotificationService() service.NotificationService {
    return nil
}
