package notification

import (
	"context"
	"fmt"

	"github.com/systentandobr/invest-tracker/internal/domain/analysis/entity"
	notificationEntity "github.com/systentandobr/invest-tracker/internal/domain/notification/entity"
	"github.com/systentandobr/invest-tracker/internal/domain/notification/repository"
	"github.com/systentandobr/invest-tracker/internal/domain/notification/service"
	"github.com/systentandobr/invest-tracker/pkg/common/errors"
	"github.com/systentandobr/invest-tracker/pkg/common/logger"
)

// NotificationServiceImpl implements service.NotificationService
type NotificationServiceImpl struct {
	repo   repository.NotificationRepository
	logger logger.Logger
}

// NewNotificationService creates a new notification service
func NewNotificationService(repo repository.NotificationRepository, logger logger.Logger) service.NotificationService {
	return &NotificationServiceImpl{
		repo:   repo,
		logger: logger,
	}
}

// CreateNotification creates a new notification
func (s *NotificationServiceImpl) CreateNotification(
	ctx context.Context, 
	title, 
	message, 
	type_ string, 
	data map[string]interface{},
) (*notificationEntity.Notification, error) {
	s.logger.Debug("Creating new notification", logger.String("title", title))
	
	notification := notificationEntity.NewNotification(title, message, type_, data)
	
	if err := s.repo.Create(ctx, notification); err != nil {
		return nil, errors.NewInternalError("Failed to create notification", err)
	}
	
	return notification, nil
}

// GetNotification retrieves a notification by ID
func (s *NotificationServiceImpl) GetNotification(ctx context.Context, id string) (*notificationEntity.Notification, error) {
	s.logger.Debug("Getting notification by ID", logger.String("id", id))
	
	notification, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrNotificationNotFound {
			return nil, errors.NewNotFoundError("Notification not found", err)
		}
		return nil, errors.NewInternalError("Failed to get notification", err)
	}
	
	return notification, nil
}

// GetAllNotifications retrieves all notifications with optional filtering
func (s *NotificationServiceImpl) GetAllNotifications(
	ctx context.Context, 
	filter map[string]interface{},
) ([]*notificationEntity.Notification, error) {
	s.logger.Debug("Getting all notifications")
	
	notifications, err := s.repo.FindAll(ctx, filter)
	if err != nil {
		return nil, errors.NewInternalError("Failed to get notifications", err)
	}
	
	return notifications, nil
}

// MarkAsRead marks a notification as read
func (s *NotificationServiceImpl) MarkAsRead(ctx context.Context, id string) error {
	s.logger.Debug("Marking notification as read", logger.String("id", id))
	
	notification, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrNotificationNotFound {
			return errors.NewNotFoundError("Notification not found", err)
		}
		return errors.NewInternalError("Failed to get notification", err)
	}
	
	notification.MarkAsRead()
	
	if err := s.repo.Update(ctx, notification); err != nil {
		return errors.NewInternalError("Failed to update notification", err)
	}
	
	return nil
}

// DeleteNotification deletes a notification
func (s *NotificationServiceImpl) DeleteNotification(ctx context.Context, id string) error {
	s.logger.Debug("Deleting notification", logger.String("id", id))
	
	if err := s.repo.Delete(ctx, id); err != nil {
		if err == repository.ErrNotificationNotFound {
			return errors.NewNotFoundError("Notification not found", err)
		}
		return errors.NewInternalError("Failed to delete notification", err)
	}
	
	return nil
}

// NotifyOpportunity sends a notification about an investment opportunity
func (s *NotificationServiceImpl) NotifyOpportunity(ctx context.Context, opportunity *entity.InvestmentOpportunity) error {
	if opportunity == nil {
		return errors.NewValidationError("Opportunity cannot be nil", nil, nil)
	}
	
	asset := opportunity.Asset
	title := fmt.Sprintf("%s Opportunity: %s", opportunity.Strategy, asset.GetSymbol())
	message := fmt.Sprintf("%s (%s) - %s. Potential return: %.2f%%", 
		asset.GetSymbol(), 
		asset.GetName(),
		opportunity.Reason,
		opportunity.PotentialReturn)
	
	data := map[string]interface{}{
		"opportunityId": opportunity.ID,
		"assetId":       asset.GetID(),
		"assetSymbol":   asset.GetSymbol(),
		"assetType":     asset.GetType(),
		"strategy":      opportunity.Strategy,
		"type":          opportunity.Type,
		"riskLevel":     opportunity.RiskLevel,
		"createdAt":     opportunity.CreatedAt,
		"expiresAt":     opportunity.ExpiresAt,
	}
	
	_, err := s.CreateNotification(ctx, title, message, "investment_opportunity", data)
	if err != nil {
		return errors.NewInternalError("Failed to create opportunity notification", err)
	}
	
	s.logger.Info("Investment opportunity notification created", 
		logger.String("asset", asset.GetSymbol()),
		logger.String("strategy", string(opportunity.Strategy)))
	
	return nil
}
