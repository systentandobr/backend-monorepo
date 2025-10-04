package analysis

import (
	"context"
	"time"

	"github.com/systentandobr/invest-tracker/internal/domain/analysis/entity"
	"github.com/systentandobr/invest-tracker/internal/domain/analysis/repository"
	"github.com/systentandobr/invest-tracker/internal/domain/analysis/strategy"
	assetEntity "github.com/systentandobr/invest-tracker/internal/domain/asset/entity"
	assetRepository "github.com/systentandobr/invest-tracker/internal/domain/asset/repository"
	"github.com/systentandobr/invest-tracker/internal/domain/asset/valueobject"
	"github.com/systentandobr/invest-tracker/pkg/common/errors"
	"github.com/systentandobr/invest-tracker/pkg/common/logger"
)

// MarketAnalysisServiceImpl implements the MarketAnalysisService interface
type MarketAnalysisServiceImpl struct {
	marketAnalysisRepo repository.MarketAnalysisRepository
	assetRepo          assetRepository.AssetRepository
	priceHistoryRepo   assetRepository.PriceHistoryRepository
	strategies         map[entity.InvestmentStrategy]strategy.InvestmentStrategyService
	logger             logger.Logger
}

// NewMarketAnalysisService creates a new MarketAnalysisService instance
func NewMarketAnalysisService(
	marketAnalysisRepo repository.MarketAnalysisRepository,
	assetRepo assetRepository.AssetRepository,
	priceHistoryRepo assetRepository.PriceHistoryRepository,
	logger logger.Logger,
) *MarketAnalysisServiceImpl {
	service := &MarketAnalysisServiceImpl{
		marketAnalysisRepo: marketAnalysisRepo,
		assetRepo:          assetRepo,
		priceHistoryRepo:   priceHistoryRepo,
		strategies:         make(map[entity.InvestmentStrategy]strategy.InvestmentStrategyService),
		logger:             logger,
	}

	// Register default strategies
	service.RegisterStrategy(strategy.NewValueInvestmentStrategy())
	service.RegisterStrategy(strategy.NewMomentumInvestmentStrategy())

	return service
}

// RegisterStrategy registers a new investment strategy
func (s *MarketAnalysisServiceImpl) RegisterStrategy(strategyService strategy.InvestmentStrategyService) {
	s.strategies[strategyService.GetType()] = strategyService
	s.logger.Info("Strategy registered", 
		logger.String("type", string(strategyService.GetType())),
		logger.String("name", strategyService.GetName()))
}

// GetMarketAnalysis retrieves a market analysis by ID
func (s *MarketAnalysisServiceImpl) GetMarketAnalysis(ctx context.Context, id string) (*entity.MarketAnalysis, error) {
	s.logger.Debug("Getting market analysis", logger.String("id", id))
	
	analysis, err := s.marketAnalysisRepo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrMarketAnalysisNotFound {
			return nil, errors.NewNotFoundError("Market analysis not found", err)
		}
		return nil, errors.NewInternalError("Failed to get market analysis", err)
	}
	
	return analysis, nil
}

// GetAllMarketAnalyses retrieves all market analyses with optional filtering
func (s *MarketAnalysisServiceImpl) GetAllMarketAnalyses(ctx context.Context, filter map[string]interface{}) ([]*entity.MarketAnalysis, error) {
	s.logger.Debug("Getting all market analyses", logger.Any("filter", filter))
	
	analyses, err := s.marketAnalysisRepo.FindAll(ctx, filter)
	if err != nil {
		return nil, errors.NewInternalError("Failed to get market analyses", err)
	}
	
	return analyses, nil
}

// CreateMarketAnalysis creates a new market analysis
func (s *MarketAnalysisServiceImpl) CreateMarketAnalysis(ctx context.Context, name, description string) (*entity.MarketAnalysis, error) {
	s.logger.Debug("Creating market analysis", logger.String("name", name))
	
	analysis := entity.NewMarketAnalysis(name, description)
	
	if err := analysis.Validate(); err != nil {
		return nil, err
	}
	
	if err := s.marketAnalysisRepo.Create(ctx, analysis); err != nil {
		if err == repository.ErrMarketAnalysisDuplicate {
			return nil, errors.NewDuplicatedError("Market analysis with this name already exists", err)
		}
		return nil, errors.NewInternalError("Failed to create market analysis", err)
	}
	
	return analysis, nil
}

// UpdateMarketAnalysis updates an existing market analysis
func (s *MarketAnalysisServiceImpl) UpdateMarketAnalysis(ctx context.Context, id, name, description string) (*entity.MarketAnalysis, error) {
	s.logger.Debug("Updating market analysis", logger.String("id", id))
	
	analysis, err := s.marketAnalysisRepo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrMarketAnalysisNotFound {
			return nil, errors.NewNotFoundError("Market analysis not found", err)
		}
		return nil, errors.NewInternalError("Failed to get market analysis for update", err)
	}
	
	analysis.Name = name
	analysis.Description = description
	
	if err := analysis.Validate(); err != nil {
		return nil, err
	}
	
	if err := s.marketAnalysisRepo.Update(ctx, analysis); err != nil {
		return nil, errors.NewInternalError("Failed to update market analysis", err)
	}
	
	return analysis, nil
}

// DeleteMarketAnalysis deletes a market analysis by ID
func (s *MarketAnalysisServiceImpl) DeleteMarketAnalysis(ctx context.Context, id string) error {
	s.logger.Debug("Deleting market analysis", logger.String("id", id))
	
	if err := s.marketAnalysisRepo.Delete(ctx, id); err != nil {
		if err == repository.ErrMarketAnalysisNotFound {
			return errors.NewNotFoundError("Market analysis not found", err)
		}
		return errors.NewInternalError("Failed to delete market analysis", err)
	}
	
	return nil
}

// AnalyzeAsset analyzes a specific asset using registered strategies
func (s *MarketAnalysisServiceImpl) AnalyzeAsset(ctx context.Context, assetID string) ([]*entity.InvestmentOpportunity, error) {
	s.logger.Debug("Analyzing asset", logger.String("assetID", assetID))
	
	// Get asset details
	asset, err := s.assetRepo.GetByID(ctx, assetID)
	if err != nil {
		return nil, errors.NewNotFoundError("Asset not found", err)
	}
	
	// Get price history
	endDate := time.Now()
	startDate := endDate.AddDate(0, -3, 0) // 3 months of data
	
	priceHistory, err := s.priceHistoryRepo.GetPriceHistory(
		ctx, 
		assetID, 
		valueobject.TimeframeDaily, 
		&startDate, 
		&endDate,
	)
	if err != nil {
		return nil, errors.NewInternalError("Failed to get price history", err)
	}
	
	if len(priceHistory.Data) < 10 {
		return nil, errors.NewValidationError("Insufficient price history data for analysis", nil, nil)
	}
	
	// Apply each registered strategy
	var opportunities []*entity.InvestmentOpportunity
	
	for _, strat := range s.strategies {
		if !strat.IsAssetSuitable(asset) {
			continue
		}
		
		opportunity, err := strat.AnalyzeAsset(asset, priceHistory)
		if err != nil {
			s.logger.Warn("Strategy analysis error", 
				logger.String("strategy", string(strat.GetType())),
				logger.String("asset", assetID),
				logger.Error(err))
			continue
		}
		
		if opportunity != nil {
			opportunities = append(opportunities, opportunity)
		}
	}
	
	return opportunities, nil
}

// AnalyzeMarket performs market analysis on multiple assets
func (s *MarketAnalysisServiceImpl) AnalyzeMarket(ctx context.Context, assetType assetEntity.AssetType) ([]*entity.InvestmentOpportunity, error) {
	s.logger.Info("Starting market analysis", logger.String("assetType", string(assetType)))
	
	// Get assets of the specified type
	assets, err := s.assetRepo.GetByType(ctx, assetType)
	if err != nil {
		return nil, errors.NewInternalError("Failed to get assets", err)
	}
	
	if len(assets) == 0 {
		return nil, errors.NewNotFoundError("No assets found for the specified type", nil)
	}
	
	// Analyze each asset
	var allOpportunities []*entity.InvestmentOpportunity
	
	for _, asset := range assets {
		opportunities, err := s.AnalyzeAsset(ctx, asset.GetID())
		if err != nil {
			s.logger.Warn("Failed to analyze asset", 
				logger.String("assetID", asset.GetID()),
				logger.Error(err))
			continue
		}
		
		allOpportunities = append(allOpportunities, opportunities...)
	}
	
	s.logger.Info("Market analysis completed", 
		logger.Int("assetsAnalyzed", len(assets)),
		logger.Int("opportunitiesFound", len(allOpportunities)))
	
	return allOpportunities, nil
}

// GetAvailableStrategies returns all registered strategies
func (s *MarketAnalysisServiceImpl) GetAvailableStrategies() []strategy.InvestmentStrategyService {
	strategies := make([]strategy.InvestmentStrategyService, 0, len(s.strategies))
	for _, strat := range s.strategies {
		strategies = append(strategies, strat)
	}
	return strategies
}
