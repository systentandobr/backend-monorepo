package service

import (
	"context"

	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/domain/analysis/entity"
	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/domain/analysis/repository"
	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/pkg/common/errors"
	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/pkg/common/logger"
)

// OpportunityServiceImpl implements OpportunityService interface
type OpportunityServiceImpl struct {
	repo   repository.OpportunityRepository
	logger logger.Logger
}

// NewOpportunityService creates a new instance of OpportunityService
func NewOpportunityService(repo repository.OpportunityRepository, logger logger.Logger) OpportunityService {
	return &OpportunityServiceImpl{
		repo:   repo,
		logger: logger,
	}
}

// GetOpportunity retrieves a Opportunity by its ID
func (s *OpportunityServiceImpl) GetOpportunity(ctx context.Context, id string) (*entity.Opportunity, error) {
	s.logger.Debug("Getting Opportunity by ID", logger.String("id", id))
	
	opportunity, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrOpportunityNotFound {
			return nil, errors.NewNotFoundError("Opportunity not found", err)
		}
		return nil, errors.NewInternalError("Failed to get Opportunity", err)
	}
	
	return opportunity, nil
}

// GetAllopportunities retrieves all opportunities
func (s *OpportunityServiceImpl) GetAllopportunities(ctx context.Context, filter map[string]interface{}) ([]*entity.Opportunity, error) {
	s.logger.Debug("Getting all opportunities")
	
	opportunities, err := s.repo.FindAll(ctx, filter)
	if err != nil {
		return nil, errors.NewInternalError("Failed to get opportunities", err)
	}
	
	return opportunities, nil
}

// CreateOpportunity creates a new Opportunity
func (s *OpportunityServiceImpl) CreateOpportunity(ctx context.Context, name, description string) (*entity.Opportunity, error) {
	s.logger.Debug("Creating new Opportunity", logger.String("name", name))
	
	opportunity := entity.NewOpportunity(name, description)
	
	if err := opportunity.Validate(); err != nil {
		return nil, err
	}
	
	if err := s.repo.Create(ctx, opportunity); err != nil {
		if err == repository.ErrOpportunityDuplicate {
			return nil, errors.NewValidationError("Opportunity with this name already exists", nil, err)
		}
		return nil, errors.NewInternalError("Failed to create Opportunity", err)
	}
	
	return opportunity, nil
}

// UpdateOpportunity updates an existing Opportunity
func (s *OpportunityServiceImpl) UpdateOpportunity(ctx context.Context, id, name, description string) (*entity.Opportunity, error) {
	s.logger.Debug("Updating Opportunity", logger.String("id", id))
	
	opportunity, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrOpportunityNotFound {
			return nil, errors.NewNotFoundError("Opportunity not found", err)
		}
		return nil, errors.NewInternalError("Failed to get Opportunity for update", err)
	}
	
	opportunity.Name = name
	opportunity.Description = description
	
	if err := opportunity.Validate(); err != nil {
		return nil, err
	}
	
	if err := s.repo.Update(ctx, opportunity); err != nil {
		return nil, errors.NewInternalError("Failed to update Opportunity", err)
	}
	
	return opportunity, nil
}

// DeleteOpportunity removes a Opportunity by its ID
func (s *OpportunityServiceImpl) DeleteOpportunity(ctx context.Context, id string) error {
	s.logger.Debug("Deleting Opportunity", logger.String("id", id))
	
	if err := s.repo.Delete(ctx, id); err != nil {
		if err == repository.ErrOpportunityNotFound {
			return errors.NewNotFoundError("Opportunity not found", err)
		}
		return errors.NewInternalError("Failed to delete Opportunity", err)
	}
	
	return nil
}
