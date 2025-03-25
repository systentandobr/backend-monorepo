package service

import (
	"context"
    "time"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/valueobject"
)

// AssetService defines the interface for asset business logic
type AssetService interface {
	// GetAssetByID retrieves an asset by its ID
	GetAssetByID(ctx context.Context, id string) (entity.Asset, error)
	
	// GetAssetBySymbol retrieves an asset by its symbol and type
	GetAssetBySymbol(ctx context.Context, symbol string, assetType entity.AssetType) (entity.Asset, error)
	
	// GetAllAssets retrieves all assets with optional filtering
	GetAllAssets(ctx context.Context, filter map[string]interface{}) ([]entity.Asset, error)
	
	// GetAssetsByType retrieves assets of a specific type
	GetAssetsByType(ctx context.Context, assetType entity.AssetType) ([]entity.Asset, error)
	
	// GetFavoriteAssets retrieves favorite assets
	GetFavoriteAssets(ctx context.Context) ([]entity.Asset, error)
	
	// SaveAsset creates a new asset
	SaveAsset(ctx context.Context, asset entity.Asset) error
	
	// UpdateAsset updates an existing asset
	UpdateAsset(ctx context.Context, asset entity.Asset) error
	
	// SetFavorite marks/unmarks an asset as favorite
	SetFavorite(ctx context.Context, id string, favorite bool) error
	
	// UpdatePrice updates an asset's price
	UpdatePrice(ctx context.Context, id string, price float64) error
	
	// SearchAssets searches for assets based on query text
	SearchAssets(ctx context.Context, query string, types []entity.AssetType) ([]entity.Asset, error)
	
	// GetPriceHistory gets the price history for an asset
	GetPriceHistory(ctx context.Context, assetID string, timeframe valueobject.Timeframe, startDate, endDate *time.Time) (valueobject.PriceHistory, error)
	
	// SavePricePoints saves price points for an asset
	SavePricePoints(ctx context.Context, assetID string, timeframe valueobject.Timeframe, points []valueobject.PricePoint) error
}

// StockService extends AssetService with stock-specific operations
type StockService interface {
	AssetService
	
	// CreateStock creates a new stock
	CreateStock(ctx context.Context, symbol, name, company, sector string, currentPrice, dividendYield, priceToEarnings, marketCap float64) (*entity.Stock, error)
	
	// UpdateStockFundamentals updates a stock's fundamental data
	UpdateStockFundamentals(ctx context.Context, id string, dividendYield, priceToEarnings, marketCap float64) error
}

// REITService extends AssetService with REIT-specific operations
type REITService interface {
	AssetService
	
	// CreateREIT creates a new REIT
	CreateREIT(ctx context.Context, symbol, name, segment string, currentPrice, dividendYield, pvp, lastDividend float64, propertyCount int) (*entity.REIT, error)
	
	// UpdateREITFundamentals updates a REIT's fundamental data
	UpdateREITFundamentals(ctx context.Context, id string, dividendYield, pvp, lastDividend float64, propertyCount int) error
}

// CryptoService extends AssetService with cryptocurrency-specific operations
type CryptoService interface {
	AssetService
	
	// CreateCrypto creates a new cryptocurrency
	CreateCrypto(ctx context.Context, symbol, name string, currentPrice, marketCap, circulatingSupply float64, maxSupply *float64) (*entity.Cryptocurrency, error)
	
	// UpdateCryptoMarketData updates a cryptocurrency's market data
	UpdateCryptoMarketData(ctx context.Context, id string, marketCap, circulatingSupply float64, maxSupply *float64) error
}
