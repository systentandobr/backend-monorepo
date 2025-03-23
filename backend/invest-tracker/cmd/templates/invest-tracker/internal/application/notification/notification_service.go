package service

import (
	"context"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/notification/entity"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/notification/repository"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/errors"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/logger"
)

// NotificationServiceImpl implements NotificationService interface
type NotificationServiceImpl struct {
	repo   repository.NotificationRepository
	logger logger.Logger
}

// NewNotificationService creates a new instance of NotificationService
func NewNotificationService(repo repository.NotificationRepository, logger logger.Logger) NotificationService {
	return &NotificationServiceImpl{
		repo:   repo,
		logger: logger,
	}
}

// GetNotification retrieves a Notification by its ID
func (s *NotificationServiceImpl) GetNotification(ctx context.Context, id string) (*entity.Notification, error) {
	s.logger.Debug("Getting Notification by ID", logger.String("id", id))
	
	notification, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrNotificationNotFound {
			return nil, errors.NewNotFoundError("Notification not found", err)
		}
		return nil, errors.NewInternalError("Failed to get Notification", err)
	}
	
	return notification, nil
}

// GetAllnotifications retrieves all notifications
func (s *NotificationServiceImpl) GetAllnotifications(ctx context.Context, filter map[string]interface{}) ([]*entity.Notification, error) {
	s.logger.Debug("Getting all notifications")
	
	notifications, err := s.repo.FindAll(ctx, filter)
	if err != nil {
		return nil, errors.NewInternalError("Failed to get notifications", err)
	}
	
	return notifications, nil
}

// CreateNotification creates a new Notification
func (s *NotificationServiceImpl) CreateNotification(ctx context.Context, name, description string) (*entity.Notification, error) {
	s.logger.Debug("Creating new Notification", logger.String("name", name))
	
	notification := entity.NewNotification(name, description)
	
	if err := notification.Validate(); err != nil {
		return nil, err
	}
	
	if err := s.repo.Create(ctx, notification); err != nil {
		if err == repository.ErrNotificationDuplicate {
			return nil, errors.NewValidationError("Notification with this name already exists", nil, err)
		}
		return nil, errors.NewInternalError("Failed to create Notification", err)
	}
	
	return notification, nil
}

// UpdateNotification updates an existing Notification
func (s *NotificationServiceImpl) UpdateNotification(ctx context.Context, id, name, description string) (*entity.Notification, error) {
	s.logger.Debug("Updating Notification", logger.String("id", id))
	
	notification, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrNotificationNotFound {
			return nil, errors.NewNotFoundError("Notification not found", err)
		}
		return nil, errors.NewInternalError("Failed to get Notification for update", err)
	}
	
	notification.Name = name
	notification.Description = description
	
	if err := notification.Validate(); err != nil {
		return nil, err
	}
	
	if err := s.repo.Update(ctx, notification); err != nil {
		return nil, errors.NewInternalError("Failed to update Notification", err)
	}
	
	return notification, nil
}

// DeleteNotification removes a Notification by its ID
func (s *NotificationServiceImpl) DeleteNotification(ctx context.Context, id string) error {
	s.logger.Debug("Deleting Notification", logger.String("id", id))
	
	if err := s.repo.Delete(ctx, id); err != nil {
		if err == repository.ErrNotificationNotFound {
			return errors.NewNotFoundError("Notification not found", err)
		}
		return errors.NewInternalError("Failed to delete Notification", err)
	}
	
	return nil
}
