package factory

import (
    "github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/domain/notification/service"
    "github.com/systentandobr/backend-monorepo/golang/invest-tracker/pkg/common/logger"
    "github.com/systentandobr/toolkit/go/shared/infrastructure/persistence/mongodb"
)

// NotificationFactory manages notification domain components
type NotificationFactory struct {}

// NewNotificationFactory creates a new notification factory
func NewNotificationFactory(logger logger.Logger) *NotificationFactory {
    return &NotificationFactory{}
}

// Bootstrap initializes domain components
func (f *NotificationFactory) Bootstrap() {
    client, err := mongodb.GetClient()
    if err != nil {
        logger.Error("Failed to get MongoDB client", "error", err)
        return
    }
    f.client = client
}

// RegisterRoutes registers domain routes
func (f *NotificationFactory) RegisterRoutes(router interface{}) {}

// GetNotificationService returns the notification service
func (f *NotificationFactory) GetNotificationService() service.NotificationService {
    return nil
}
