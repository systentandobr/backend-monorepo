package analysis

import (
	"context"
	"time"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/analysis/entity"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/analysis/repository"
	assetEntity "github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/entity"
	assetRepository "github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/repository"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/errors"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/logger"
)

// OpportunityServiceImpl implements the OpportunityService interface
type OpportunityServiceImpl struct {
	opportunityRepo   repository.OpportunityRepository
	assetRepo         assetRepository.AssetRepository
	priceHistoryRepo  assetRepository.PriceHistoryRepository
	marketAnalysisSvc *MarketAnalysisServiceImpl
	logger            logger.Logger
}

// NewOpportunityService creates a new OpportunityService instance
func NewOpportunityService(
	opportunityRepo repository.OpportunityRepository,
	assetRepo assetRepository.AssetRepository,
	priceHistoryRepo assetRepository.PriceHistoryRepository,
	marketAnalysisSvc *MarketAnalysisServiceImpl,
	logger logger.Logger,
) *OpportunityServiceImpl {
	return &OpportunityServiceImpl{
		opportunityRepo:   opportunityRepo,
		assetRepo:         assetRepo,
		priceHistoryRepo:  priceHistoryRepo,
		marketAnalysisSvc: marketAnalysisSvc,
		logger:            logger,
	}
}

// GetOpportunity retrieves an opportunity by ID
func (s *OpportunityServiceImpl) GetOpportunity(ctx context.Context, id string) (*entity.InvestmentOpportunity, error) {
	s.logger.Debug("Getting opportunity", logger.String("id", id))
	
	opportunity, err := s.opportunityRepo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrOpportunityNotFound {
			return nil, errors.NewNotFoundError("Investment opportunity not found", err)
		}
		return nil, errors.NewInternalError("Failed to get investment opportunity", err)
	}
	
	// Check if opportunity is expired
	if opportunity.IsExpired() {
		if !opportunity.Expired {
			// Update expired flag in database
			opportunity.MarkAsExpired()
			if err := s.opportunityRepo.Update(ctx, opportunity); err != nil {
				s.logger.Warn("Failed to mark opportunity as expired", 
					logger.String("id", id),
					logger.Error(err))
			}
		}
	}
	
	return opportunity, nil
}

// GetAllOpportunities retrieves all opportunities with optional filtering
func (s *OpportunityServiceImpl) GetAllOpportunities(ctx context.Context, filter map[string]interface{}) ([]*entity.InvestmentOpportunity, error) {
	s.logger.Debug("Getting all opportunities", logger.Any("filter", filter))
	
	opportunities, err := s.opportunityRepo.FindAll(ctx, filter)
	if err != nil {
		return nil, errors.NewInternalError("Failed to get investment opportunities", err)
	}
	
	// Check for expired opportunities
	for _, opp := range opportunities {
		if opp.IsExpired() && !opp.Expired {
			opp.MarkAsExpired()
			if err := s.opportunityRepo.Update(ctx, opp); err != nil {
				s.logger.Warn("Failed to mark opportunity as expired", 
					logger.String("id", opp.ID),
					logger.Error(err))
			}
		}
	}
	
	return opportunities, nil
}

// GetActiveOpportunities retrieves all non-expired opportunities
func (s *OpportunityServiceImpl) GetActiveOpportunities(ctx context.Context) ([]*entity.InvestmentOpportunity, error) {
	s.logger.Debug("Getting active opportunities")
	
	filter := map[string]interface{}{
		"expired": false,
		"expires_at": map[string]interface{}{
			"$gt": time.Now(),
		},
	}
	
	return s.GetAllOpportunities(ctx, filter)
}

// CreateOpportunity creates a new investment opportunity
func (s *OpportunityServiceImpl) CreateOpportunity(ctx context.Context, 
	assetID string, 
	opportunityType entity.OpportunityType,
	reason string,
	potentialReturn float64,
	riskLevel entity.RiskLevel,
	strategy entity.InvestmentStrategy,
) (*entity.InvestmentOpportunity, error) {
	s.logger.Debug("Creating opportunity", 
		logger.String("assetID", assetID),
		logger.String("type", string(opportunityType)))
	
	// Get asset
	asset, err := s.assetRepo.GetByID(ctx, assetID)
	if err != nil {
		return nil, errors.NewNotFoundError("Asset not found", err)
	}
	
	// Create opportunity
	opportunity := entity.NewInvestmentOpportunity(
		asset,
		opportunityType,
		reason,
		potentialReturn,
		riskLevel,
		strategy,
	)
	
	// Save opportunity
	if err := s.opportunityRepo.Create(ctx, opportunity); err != nil {
		return nil, errors.NewInternalError("Failed to create investment opportunity", err)
	}
	
	return opportunity, nil
}

// DeleteOpportunity deletes an opportunity by ID
func (s *OpportunityServiceImpl) DeleteOpportunity(ctx context.Context, id string) error {
	s.logger.Debug("Deleting opportunity", logger.String("id", id))
	
	if err := s.opportunityRepo.Delete(ctx, id); err != nil {
		if err == repository.ErrOpportunityNotFound {
			return errors.NewNotFoundError("Investment opportunity not found", err)
		}
		return errors.NewInternalError("Failed to delete investment opportunity", err)
	}
	
	return nil
}

// MarkAsExpired marks an opportunity as expired
func (s *OpportunityServiceImpl) MarkAsExpired(ctx context.Context, id string) error {
	s.logger.Debug("Marking opportunity as expired", logger.String("id", id))
	
	opportunity, err := s.opportunityRepo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrOpportunityNotFound {
			return errors.NewNotFoundError("Investment opportunity not found", err)
		}
		return errors.NewInternalError("Failed to get investment opportunity", err)
	}
	
	opportunity.MarkAsExpired()
	
	if err := s.opportunityRepo.Update(ctx, opportunity); err != nil {
		return errors.NewInternalError("Failed to mark opportunity as expired", err)
	}
	
	return nil
}

// DetectOpportunities detects new investment opportunities
func (s *OpportunityServiceImpl) DetectOpportunities(ctx context.Context, assetType assetEntity.AssetType) ([]*entity.InvestmentOpportunity, error) {
	s.logger.Info("Detecting opportunities", logger.String("assetType", string(assetType)))
	
	// Use market analysis service to analyze assets
	opportunities, err := s.marketAnalysisSvc.AnalyzeMarket(ctx, assetType)
	if err != nil {
		return nil, errors.NewInternalError("Failed to analyze market", err)
	}
	
	// Save new opportunities
	savedOpportunities := make([]*entity.InvestmentOpportunity, 0, len(opportunities))
	
	for _, opp := range opportunities {
		if err := s.opportunityRepo.Create(ctx, opp); err != nil {
			s.logger.Warn("Failed to save opportunity", 
				logger.String("assetID", opp.Asset.GetID()),
				logger.Error(err))
			continue
		}
		
		savedOpportunities = append(savedOpportunities, opp)
	}
	
	s.logger.Info("Opportunity detection completed", 
		logger.Int("opportunitiesFound", len(opportunities)),
		logger.Int("opportunitiesSaved", len(savedOpportunities)))
	
	return savedOpportunities, nil
}

// FilterOpportunitiesByStrategy filters opportunities by strategy type
func (s *OpportunityServiceImpl) FilterOpportunitiesByStrategy(ctx context.Context, strategyType entity.InvestmentStrategy) ([]*entity.InvestmentOpportunity, error) {
	s.logger.Debug("Filtering opportunities by strategy", logger.String("strategy", string(strategyType)))
	
	filter := map[string]interface{}{
		"strategy": strategyType,
		"expired": false,
	}
	
	return s.GetAllOpportunities(ctx, filter)
}

// FilterOpportunitiesByRiskLevel filters opportunities by risk level
func (s *OpportunityServiceImpl) FilterOpportunitiesByRiskLevel(ctx context.Context, riskLevel entity.RiskLevel) ([]*entity.InvestmentOpportunity, error) {
	s.logger.Debug("Filtering opportunities by risk level", logger.String("riskLevel", string(riskLevel)))
	
	filter := map[string]interface{}{
		"risk_level": riskLevel,
		"expired": false,
	}
	
	return s.GetAllOpportunities(ctx, filter)
}

// GetOpportunitiesForAsset gets all opportunities for a specific asset
func (s *OpportunityServiceImpl) GetOpportunitiesForAsset(ctx context.Context, assetID string) ([]*entity.InvestmentOpportunity, error) {
	s.logger.Debug("Getting opportunities for asset", logger.String("assetID", assetID))
	
	filter := map[string]interface{}{
		"asset._id": assetID,
		"expired": false,
	}
	
	return s.GetAllOpportunities(ctx, filter)
}
