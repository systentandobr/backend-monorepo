package factory

import (
    "github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/logger"
    "github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/infrastructure/database/mongodb"
)

// NotificationFactory manages notification domain components
type NotificationFactory struct {}

// NewNotificationFactory creates a new notification factory
func NewNotificationFactory(client *mongodb.Client, logger logger.Logger) *NotificationFactory {
    return &NotificationFactory{}
}

// Bootstrap initializes domain components
func (f *NotificationFactory) Bootstrap() {}

// RegisterRoutes registers domain routes
func (f *NotificationFactory) RegisterRoutes(router interface{}) {}

// GetNotificationService returns the notification service
func (f *NotificationFactory) GetNotificationService() interface{} {
    return nil
}
