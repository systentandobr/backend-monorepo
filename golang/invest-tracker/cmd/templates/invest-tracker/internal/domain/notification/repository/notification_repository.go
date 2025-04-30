package repository

import (
	"context"

	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/domain/notification/entity"
)

// NotificationRepository defines the interface for Notification data access
type NotificationRepository interface {
	// FindByID retrieves a Notification by its ID
	FindByID(ctx context.Context, id string) (*entity.Notification, error)
	
	// FindAll retrieves all notifications based on optional filter
	FindAll(ctx context.Context, filter map[string]interface{}) ([]*entity.Notification, error)
	
	// Create stores a new Notification
	Create(ctx context.Context, notification *entity.Notification) error
	
	// Update modifies an existing Notification
	Update(ctx context.Context, notification *entity.Notification) error
	
	// Delete removes a Notification by its ID
	Delete(ctx context.Context, id string) error
}

// Common error types for repositories
var (
	ErrNotificationNotFound = fmt.Errorf("notification not found")
	ErrNotificationDuplicate = fmt.Errorf("notification already exists")
)
