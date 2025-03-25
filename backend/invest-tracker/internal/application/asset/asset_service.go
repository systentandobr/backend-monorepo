package asset

import (
	"context"
	"time"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/repository"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/service"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/valueobject"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/errors"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/logger"
)

// AssetServiceImpl implements service.AssetService
type AssetServiceImpl struct {
	assetRepo        repository.AssetRepository
	priceHistoryRepo repository.PriceHistoryRepository
	logger           logger.Logger
}

// NewAssetService creates a new asset service
func NewAssetService(
	assetRepo repository.AssetRepository,
	priceHistoryRepo repository.PriceHistoryRepository,
	logger logger.Logger,
) service.AssetService {
	return &AssetServiceImpl{
		assetRepo:        assetRepo,
		priceHistoryRepo: priceHistoryRepo,
		logger:           logger,
	}
}

// GetAssetByID retrieves an asset by its ID
func (s *AssetServiceImpl) GetAssetByID(ctx context.Context, id string) (entity.Asset, error) {
	s.logger.Debug("Getting asset by ID", logger.String("id", id))
	
	asset, err := s.assetRepo.GetByID(ctx, id)
	if err != nil {
		if err == repository.ErrAssetNotFound {
			return nil, errors.NewNotFoundError("Asset not found", err)
		}
		return nil, errors.NewInternalError("Failed to get asset", err)
	}
	
	return asset, nil
}

// GetAssetBySymbol retrieves an asset by its symbol and type
func (s *AssetServiceImpl) GetAssetBySymbol(ctx context.Context, symbol string, assetType entity.AssetType) (entity.Asset, error) {
	s.logger.Debug("Getting asset by symbol", 
		logger.String("symbol", symbol),
		logger.String("type", string(assetType)))
	
	asset, err := s.assetRepo.GetBySymbol(ctx, symbol, assetType)
	if err != nil {
		if err == repository.ErrAssetNotFound {
			return nil, errors.NewNotFoundError("Asset not found", err)
		}
		return nil, errors.NewInternalError("Failed to get asset by symbol", err)
	}
	
	return asset, nil
}

// GetAllAssets retrieves all assets with optional filtering
func (s *AssetServiceImpl) GetAllAssets(ctx context.Context, filter map[string]interface{}) ([]entity.Asset, error) {
	s.logger.Debug("Getting all assets")
	
	assets, err := s.assetRepo.GetAll(ctx, filter)
	if err != nil {
		return nil, errors.NewInternalError("Failed to get assets", err)
	}
	
	return assets, nil
}

// GetAssetsByType retrieves assets of a specific type
func (s *AssetServiceImpl) GetAssetsByType(ctx context.Context, assetType entity.AssetType) ([]entity.Asset, error) {
	s.logger.Debug("Getting assets by type", logger.String("type", string(assetType)))
	
	assets, err := s.assetRepo.GetByType(ctx, assetType)
	if err != nil {
		return nil, errors.NewInternalError("Failed to get assets by type", err)
	}
	
	return assets, nil
}

// GetFavoriteAssets retrieves favorite assets
func (s *AssetServiceImpl) GetFavoriteAssets(ctx context.Context) ([]entity.Asset, error) {
	s.logger.Debug("Getting favorite assets")
	
	assets, err := s.assetRepo.GetFavorites(ctx)
	if err != nil {
		return nil, errors.NewInternalError("Failed to get favorite assets", err)
	}
	
	return assets, nil
}

// SaveAsset creates a new asset
func (s *AssetServiceImpl) SaveAsset(ctx context.Context, asset entity.Asset) error {
	s.logger.Debug("Saving asset", 
		logger.String("symbol", asset.GetSymbol()),
		logger.String("type", string(asset.GetType())))
	
	if err := s.assetRepo.Save(ctx, asset); err != nil {
		if err == repository.ErrDuplicateAsset {
			return errors.NewValidationError("Asset already exists", nil, err)
		}
		return errors.NewInternalError("Failed to save asset", err)
	}
	
	return nil
}

// UpdateAsset updates an existing asset
func (s *AssetServiceImpl) UpdateAsset(ctx context.Context, asset entity.Asset) error {
	s.logger.Debug("Updating asset", 
		logger.String("id", asset.GetID()),
		logger.String("symbol", asset.GetSymbol()))
	
	if err := s.assetRepo.Update(ctx, asset); err != nil {
		if err == repository.ErrAssetNotFound {
			return errors.NewNotFoundError("Asset not found", err)
		}
		return errors.NewInternalError("Failed to update asset", err)
	}
	
	return nil
}

// SetFavorite marks/unmarks an asset as favorite
func (s *AssetServiceImpl) SetFavorite(ctx context.Context, id string, favorite bool) error {
	s.logger.Debug("Setting asset favorite status", 
		logger.String("id", id),
		logger.Bool("favorite", favorite))
	
	if err := s.assetRepo.SetFavorite(ctx, id, favorite); err != nil {
		if err == repository.ErrAssetNotFound {
			return errors.NewNotFoundError("Asset not found", err)
		}
		return errors.NewInternalError("Failed to set favorite status", err)
	}
	
	return nil
}

// UpdatePrice updates an asset's price
func (s *AssetServiceImpl) UpdatePrice(ctx context.Context, id string, price float64) error {
	s.logger.Debug("Updating asset price", 
		logger.String("id", id),
		logger.Float64("price", price))
	
	if err := s.assetRepo.UpdatePrice(ctx, id, price); err != nil {
		if err == repository.ErrAssetNotFound {
			return errors.NewNotFoundError("Asset not found", err)
		}
		return errors.NewInternalError("Failed to update price", err)
	}
	
	return nil
}

// SearchAssets searches for assets based on query text
func (s *AssetServiceImpl) SearchAssets(ctx context.Context, query string, types []entity.AssetType) ([]entity.Asset, error) {
	s.logger.Debug("Searching assets", logger.String("query", query))
	
	assets, err := s.assetRepo.Search(ctx, query, types)
	if err != nil {
		return nil, errors.NewInternalError("Failed to search assets", err)
	}
	
	return assets, nil
}

// GetPriceHistory gets the price history for an asset
func (s *AssetServiceImpl) GetPriceHistory(
	ctx context.Context,
	assetID string,
	timeframe valueobject.Timeframe,
	startDate, endDate *time.Time,
) (valueobject.PriceHistory, error) {
	s.logger.Debug("Getting price history", 
		logger.String("assetID", assetID),
		logger.String("timeframe", string(timeframe)))
	
	history, err := s.priceHistoryRepo.GetPriceHistory(ctx, assetID, timeframe, startDate, endDate)
	if err != nil {
		return valueobject.PriceHistory{}, errors.NewInternalError("Failed to get price history", err)
	}
	
	return history, nil
}

// SavePricePoints saves price points for an asset
func (s *AssetServiceImpl) SavePricePoints(
	ctx context.Context,
	assetID string,
	timeframe valueobject.Timeframe,
	points []valueobject.PricePoint,
) error {
	s.logger.Debug("Saving price points", 
		logger.String("assetID", assetID),
		logger.String("timeframe", string(timeframe)),
		logger.Int("points", len(points)))
	
	if err := s.priceHistoryRepo.SavePricePoints(ctx, assetID, timeframe, points); err != nil {
		return errors.NewInternalError("Failed to save price points", err)
	}
	
	return nil
}
