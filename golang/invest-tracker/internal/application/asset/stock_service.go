package asset

import (
	"context"

	"github.com/systentandobr/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/invest-tracker/internal/domain/asset/repository"
	"github.com/systentandobr/invest-tracker/internal/domain/asset/service"
	"github.com/systentandobr/invest-tracker/pkg/common/errors"
	"github.com/systentandobr/invest-tracker/pkg/common/logger"
)

// StockServiceImpl implements service.StockService
type StockServiceImpl struct {
	AssetServiceImpl
}

// NewStockService creates a new stock service
func NewStockService(
	assetRepo repository.AssetRepository,
	priceHistoryRepo repository.PriceHistoryRepository,
	logger logger.Logger,
) service.StockService {
	return &StockServiceImpl{
		AssetServiceImpl: AssetServiceImpl{
			assetRepo:        assetRepo,
			priceHistoryRepo: priceHistoryRepo,
			logger:           logger,
		},
	}
}

// CreateStock creates a new stock
func (s *StockServiceImpl) CreateStock(
	ctx context.Context,
	symbol, name, company, sector string,
	currentPrice, dividendYield, priceToEarnings, marketCap float64,
) (*entity.Stock, error) {
	s.logger.Debug("Creating new stock", 
		logger.String("symbol", symbol),
		logger.String("name", name))
	
	stock := entity.NewStock(symbol, name, company, sector, currentPrice, dividendYield, priceToEarnings, marketCap)
	
	if err := s.assetRepo.Save(ctx, stock); err != nil {
		if err == repository.ErrDuplicateAsset {
			return nil, errors.NewValidationError("Stock already exists", nil, err)
		}
		return nil, errors.NewInternalError("Failed to save stock", err)
	}
	
	return stock, nil
}

// UpdateStockFundamentals updates a stock's fundamental data
func (s *StockServiceImpl) UpdateStockFundamentals(
	ctx context.Context,
	id string,
	dividendYield, priceToEarnings, marketCap float64,
) error {
	s.logger.Debug("Updating stock fundamentals", logger.String("id", id))
	
	asset, err := s.assetRepo.GetByID(ctx, id)
	if err != nil {
		if err == repository.ErrAssetNotFound {
			return errors.NewNotFoundError("Stock not found", err)
		}
		return errors.NewInternalError("Failed to get stock", err)
	}
	
	stock, ok := asset.(*entity.Stock)
	if !ok {
		return errors.NewValidationError("Asset is not a stock", nil, nil)
	}
	
	stock.DividendYield = dividendYield
	stock.PriceToEarnings = priceToEarnings
	stock.MarketCap = marketCap
	
	if err := s.assetRepo.Update(ctx, stock); err != nil {
		return errors.NewInternalError("Failed to update stock fundamentals", err)
	}
	
	return nil
}
