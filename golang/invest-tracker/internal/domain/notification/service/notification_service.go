package service

import (
	"context"

	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/domain/analysis/entity"
	notificationEntity "github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/domain/notification/entity"
)

// NotificationService defines the interface for notification business logic
type NotificationService interface {
	// CreateNotification creates a new notification
	CreateNotification(ctx context.Context, title, message, type_ string, data map[string]interface{}) (*notificationEntity.Notification, error)
	
	// GetNotification retrieves a notification by its ID
	GetNotification(ctx context.Context, id string) (*notificationEntity.Notification, error)
	
	// GetAllNotifications retrieves all notifications based on optional filter
	GetAllNotifications(ctx context.Context, filter map[string]interface{}) ([]*notificationEntity.Notification, error)
	
	// MarkAsRead marks a notification as read
	MarkAsRead(ctx context.Context, id string) error
	
	// DeleteNotification removes a notification by its ID
	DeleteNotification(ctx context.Context, id string) error
	
	// NotifyOpportunity sends a notification about an investment opportunity
	NotifyOpportunity(ctx context.Context, opportunity *entity.InvestmentOpportunity) error
}
