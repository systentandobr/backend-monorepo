package repository

import (
	"context"
	"fmt"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/notification/entity"
)

// NotificationRepository defines the interface for notification data access
type NotificationRepository interface {
	// FindByID retrieves a notification by its ID
	FindByID(ctx context.Context, id string) (*entity.Notification, error)
	
	// FindAll retrieves all notifications based on optional filter
	FindAll(ctx context.Context, filter map[string]interface{}) ([]*entity.Notification, error)
	
	// Create stores a new notification
	Create(ctx context.Context, notification *entity.Notification) error
	
	// Update modifies an existing notification
	Update(ctx context.Context, notification *entity.Notification) error
	
	// Delete removes a notification by its ID
	Delete(ctx context.Context, id string) error
	
	// MarkAllAsRead marks all notifications as read
	MarkAllAsRead(ctx context.Context) error
	
	// CountUnread counts unread notifications
	CountUnread(ctx context.Context) (int, error)
}

// Common error types for repositories
var (
	ErrNotificationNotFound   = fmt.Errorf("notification not found")
	ErrNotificationDuplicate  = fmt.Errorf("notification already exists")
	ErrNotificationRepository = fmt.Errorf("notification repository error")
)
