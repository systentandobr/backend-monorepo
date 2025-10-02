package service

import (
	"context"

	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/domain/analysis/entity"
	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/domain/analysis/repository"
	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/pkg/common/errors"
	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/pkg/common/logger"
)

// MarketAnalysisServiceImpl implements MarketAnalysisService interface
type MarketAnalysisServiceImpl struct {
	repo   repository.MarketAnalysisRepository
	logger logger.Logger
}

// NewMarketAnalysisService creates a new instance of MarketAnalysisService
func NewMarketAnalysisService(repo repository.MarketAnalysisRepository, logger logger.Logger) MarketAnalysisService {
	return &MarketAnalysisServiceImpl{
		repo:   repo,
		logger: logger,
	}
}

// GetMarketAnalysis retrieves a MarketAnalysis by its ID
func (s *MarketAnalysisServiceImpl) GetMarketAnalysis(ctx context.Context, id string) (*entity.MarketAnalysis, error) {
	s.logger.Debug("Getting MarketAnalysis by ID", logger.String("id", id))
	
	marketanalysis, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrMarketAnalysisNotFound {
			return nil, errors.NewNotFoundError("MarketAnalysis not found", err)
		}
		return nil, errors.NewInternalError("Failed to get MarketAnalysis", err)
	}
	
	return marketanalysis, nil
}

// GetAllmarketanalysiss retrieves all marketanalysiss
func (s *MarketAnalysisServiceImpl) GetAllmarketanalysiss(ctx context.Context, filter map[string]interface{}) ([]*entity.MarketAnalysis, error) {
	s.logger.Debug("Getting all marketanalysiss")
	
	marketanalysiss, err := s.repo.FindAll(ctx, filter)
	if err != nil {
		return nil, errors.NewInternalError("Failed to get marketanalysiss", err)
	}
	
	return marketanalysiss, nil
}

// CreateMarketAnalysis creates a new MarketAnalysis
func (s *MarketAnalysisServiceImpl) CreateMarketAnalysis(ctx context.Context, name, description string) (*entity.MarketAnalysis, error) {
	s.logger.Debug("Creating new MarketAnalysis", logger.String("name", name))
	
	marketanalysis := entity.NewMarketAnalysis(name, description)
	
	if err := marketanalysis.Validate(); err != nil {
		return nil, err
	}
	
	if err := s.repo.Create(ctx, marketanalysis); err != nil {
		if err == repository.ErrMarketAnalysisDuplicate {
			return nil, errors.NewValidationError("MarketAnalysis with this name already exists", nil, err)
		}
		return nil, errors.NewInternalError("Failed to create MarketAnalysis", err)
	}
	
	return marketanalysis, nil
}

// UpdateMarketAnalysis updates an existing MarketAnalysis
func (s *MarketAnalysisServiceImpl) UpdateMarketAnalysis(ctx context.Context, id, name, description string) (*entity.MarketAnalysis, error) {
	s.logger.Debug("Updating MarketAnalysis", logger.String("id", id))
	
	marketanalysis, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrMarketAnalysisNotFound {
			return nil, errors.NewNotFoundError("MarketAnalysis not found", err)
		}
		return nil, errors.NewInternalError("Failed to get MarketAnalysis for update", err)
	}
	
	marketanalysis.Name = name
	marketanalysis.Description = description
	
	if err := marketanalysis.Validate(); err != nil {
		return nil, err
	}
	
	if err := s.repo.Update(ctx, marketanalysis); err != nil {
		return nil, errors.NewInternalError("Failed to update MarketAnalysis", err)
	}
	
	return marketanalysis, nil
}

// DeleteMarketAnalysis removes a MarketAnalysis by its ID
func (s *MarketAnalysisServiceImpl) DeleteMarketAnalysis(ctx context.Context, id string) error {
	s.logger.Debug("Deleting MarketAnalysis", logger.String("id", id))
	
	if err := s.repo.Delete(ctx, id); err != nil {
		if err == repository.ErrMarketAnalysisNotFound {
			return errors.NewNotFoundError("MarketAnalysis not found", err)
		}
		return errors.NewInternalError("Failed to delete MarketAnalysis", err)
	}
	
	return nil
}
