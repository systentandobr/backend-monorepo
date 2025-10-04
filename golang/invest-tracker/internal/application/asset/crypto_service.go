package asset

import (
	"context"

	"github.com/systentandobr/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/invest-tracker/internal/domain/asset/repository"
	"github.com/systentandobr/invest-tracker/internal/domain/asset/service"
	"github.com/systentandobr/invest-tracker/pkg/common/errors"
	"github.com/systentandobr/invest-tracker/pkg/common/logger"
)

// CryptoServiceImpl implements service.CryptoService
type CryptoServiceImpl struct {
	AssetServiceImpl
}

// NewCryptoService creates a new cryptocurrency service
func NewCryptoService(
	assetRepo repository.AssetRepository,
	priceHistoryRepo repository.PriceHistoryRepository,
	logger logger.Logger,
) service.CryptoService {
	return &CryptoServiceImpl{
		AssetServiceImpl: AssetServiceImpl{
			assetRepo:        assetRepo,
			priceHistoryRepo: priceHistoryRepo,
			logger:           logger,
		},
	}
}

// CreateCrypto creates a new cryptocurrency
func (s *CryptoServiceImpl) CreateCrypto(
	ctx context.Context,
	symbol, name string,
	currentPrice, marketCap, circulatingSupply float64,
	maxSupply *float64,
) (*entity.Cryptocurrency, error) {
	s.logger.Debug("Creating new cryptocurrency", 
		logger.String("symbol", symbol),
		logger.String("name", name))
	
	crypto := entity.NewCryptocurrency(symbol, name, currentPrice, marketCap, circulatingSupply, maxSupply)
	
	if err := s.assetRepo.Save(ctx, crypto); err != nil {
		if err == repository.ErrDuplicateAsset {
			return nil, errors.NewValidationError("Cryptocurrency already exists", nil, err)
		}
		return nil, errors.NewInternalError("Failed to save cryptocurrency", err)
	}
	
	return crypto, nil
}

// UpdateCryptoMarketData updates a cryptocurrency's market data
func (s *CryptoServiceImpl) UpdateCryptoMarketData(
	ctx context.Context,
	id string,
	marketCap, circulatingSupply float64,
	maxSupply *float64,
) error {
	s.logger.Debug("Updating cryptocurrency market data", logger.String("id", id))
	
	asset, err := s.assetRepo.GetByID(ctx, id)
	if err != nil {
		if err == repository.ErrAssetNotFound {
			return errors.NewNotFoundError("Cryptocurrency not found", err)
		}
		return errors.NewInternalError("Failed to get cryptocurrency", err)
	}
	
	crypto, ok := asset.(*entity.Cryptocurrency)
	if !ok {
		return errors.NewValidationError("Asset is not a cryptocurrency", nil, nil)
	}
	
	crypto.MarketCap = marketCap
	crypto.CirculatingSupply = circulatingSupply
	crypto.MaxSupply = maxSupply
	
	if err := s.assetRepo.Update(ctx, crypto); err != nil {
		return errors.NewInternalError("Failed to update cryptocurrency market data", err)
	}
	
	return nil
}
