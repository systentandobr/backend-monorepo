package service

import (
	"context"

	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/domain/notification/entity"
)

// NotificationService defines the interface for Notification business logic
type NotificationService interface {
	// GetNotification retrieves a Notification by its ID
	GetNotification(ctx context.Context, id string) (*entity.Notification, error)
	
	// GetAllnotifications retrieves all notifications based on optional filter
	GetAllnotifications(ctx context.Context, filter map[string]interface{}) ([]*entity.Notification, error)
	
	// CreateNotification creates a new Notification
	CreateNotification(ctx context.Context, name, description string) (*entity.Notification, error)
	
	// UpdateNotification updates an existing Notification
	UpdateNotification(ctx context.Context, id, name, description string) (*entity.Notification, error)
	
	// DeleteNotification removes a Notification by its ID
	DeleteNotification(ctx context.Context, id string) error
}
