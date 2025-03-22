#!/bin/bash
# 04_create_domain_layer.sh - Cria os componentes da camada de domínio

# Verifica parâmetros
if [ $# -lt 2 ]; then
  echo "Uso: $0 <base_dir> <import_path>"
  exit 1
fi

BASE_DIR=$1
IMPORT_PATH=$2

echo "Criando camada de domínio em: $BASE_DIR"
cd "$BASE_DIR" || exit 1

# Asset entity
ASSET_FILE="internal/domain/asset/entity/asset.go"
mkdir -p "$(dirname "$ASSET_FILE")"
cat > "$ASSET_FILE" << 'EOF'
package entity

import "time"

type AssetType string

const (
	AssetTypeStock  AssetType = "stock"
	AssetTypeREIT   AssetType = "reit"
	AssetTypeCrypto AssetType = "crypto"
)

type Asset interface {
	GetID() string
	GetSymbol() string
	GetName() string
	GetType() AssetType
	GetCurrentPrice() float64
	GetPreviousClose() float64
	GetChangePercentage() float64
	GetLastUpdated() time.Time
	SetCurrentPrice(price float64)
	IsFavorite() bool
	SetFavorite(favorite bool)
}

type BaseAsset struct {
	ID               string    `json:"id" bson:"_id"`
	Symbol           string    `json:"symbol" bson:"symbol"`
	Name             string    `json:"name" bson:"name"`
	Type             AssetType `json:"type" bson:"type"`
	CurrentPrice     float64   `json:"currentPrice" bson:"current_price"`
	PreviousClose    float64   `json:"previousClose" bson:"previous_close"`
	ChangePercentage float64   `json:"changePercentage" bson:"change_percentage"`
	Volume           float64   `json:"volume" bson:"volume"`
	LastUpdated      time.Time `json:"lastUpdated" bson:"last_updated"`
	Favorite         bool      `json:"isFavorite" bson:"is_favorite"`
}

func (a *BaseAsset) GetID() string               { return a.ID }
func (a *BaseAsset) GetSymbol() string           { return a.Symbol }
func (a *BaseAsset) GetName() string             { return a.Name }
func (a *BaseAsset) GetType() AssetType          { return a.Type }
func (a *BaseAsset) GetCurrentPrice() float64    { return a.CurrentPrice }
func (a *BaseAsset) GetPreviousClose() float64   { return a.PreviousClose }
func (a *BaseAsset) GetChangePercentage() float64 { return a.ChangePercentage }
func (a *BaseAsset) GetLastUpdated() time.Time   { return a.LastUpdated }
func (a *BaseAsset) SetCurrentPrice(price float64) { 
	a.PreviousClose = a.CurrentPrice
	a.CurrentPrice = price
	a.ChangePercentage = ((price - a.PreviousClose) / a.PreviousClose) * 100
	a.LastUpdated = time.Now()
}
func (a *BaseAsset) IsFavorite() bool           { return a.Favorite }
func (a *BaseAsset) SetFavorite(favorite bool)  { a.Favorite = favorite }

type Stock struct {
	BaseAsset
	Company         string  `json:"company" bson:"company"`
	Sector          string  `json:"sector" bson:"sector"`
	DividendYield   float64 `json:"dividendYield" bson:"dividend_yield"`
	PriceToEarnings float64 `json:"priceToEarnings" bson:"price_to_earnings"`
	MarketCap       float64 `json:"marketCap" bson:"market_cap"`
}

type REIT struct {
	BaseAsset
	Segment       string  `json:"segment" bson:"segment"`
	DividendYield float64 `json:"dividendYield" bson:"dividend_yield"`
	PropertyCount int     `json:"propertyCount" bson:"property_count"`
	PVP           float64 `json:"pvp" bson:"pvp"`
	LastDividend  float64 `json:"lastDividend" bson:"last_dividend"`
}

type Cryptocurrency struct {
	BaseAsset
	MarketCap         float64     `json:"marketCap" bson:"market_cap"`
	CirculatingSupply float64     `json:"circulatingSupply" bson:"circulating_supply"`
	MaxSupply         *float64    `json:"maxSupply,omitempty" bson:"max_supply,omitempty"`
	AllTimeHigh       float64     `json:"allTimeHigh,omitempty" bson:"all_time_high,omitempty"`
	AllTimeHighDate   *time.Time  `json:"allTimeHighDate,omitempty" bson:"all_time_high_date,omitempty"`
}

func NewStock(symbol, name, company, sector string, currentPrice, dividendYield, priceToEarnings, marketCap float64) *Stock {
	return &Stock{
		BaseAsset: BaseAsset{
			ID:               "stock-" + symbol,
			Symbol:           symbol,
			Name:             name,
			Type:             AssetTypeStock,
			CurrentPrice:     currentPrice,
			PreviousClose:    currentPrice,
			ChangePercentage: 0,
			LastUpdated:      time.Now(),
		},
		Company:         company,
		Sector:          sector,
		DividendYield:   dividendYield,
		PriceToEarnings: priceToEarnings,
		MarketCap:       marketCap,
	}
}

func NewREIT(symbol, name, segment string, currentPrice, dividendYield, pvp, lastDividend float64, propertyCount int) *REIT {
	return &REIT{
		BaseAsset: BaseAsset{
			ID:               "reit-" + symbol,
			Symbol:           symbol,
			Name:             name,
			Type:             AssetTypeREIT,
			CurrentPrice:     currentPrice,
			PreviousClose:    currentPrice,
			ChangePercentage: 0,
			LastUpdated:      time.Now(),
		},
		Segment:       segment,
		DividendYield: dividendYield,
		PropertyCount: propertyCount,
		PVP:           pvp,
		LastDividend:  lastDividend,
	}
}

func NewCryptocurrency(symbol, name string, currentPrice, marketCap, circulatingSupply float64, maxSupply *float64) *Cryptocurrency {
	return &Cryptocurrency{
		BaseAsset: BaseAsset{
			ID:               "crypto-" + symbol,
			Symbol:           symbol,
			Name:             name,
			Type:             AssetTypeCrypto,
			CurrentPrice:     currentPrice,
			PreviousClose:    currentPrice,
			ChangePercentage: 0,
			LastUpdated:      time.Now(),
		},
		MarketCap:         marketCap,
		CirculatingSupply: circulatingSupply,
		MaxSupply:         maxSupply,
	}
}
EOF

# Price history value object
PRICE_HISTORY_FILE="internal/domain/asset/valueobject/price_history.go"
mkdir -p "$(dirname "$PRICE_HISTORY_FILE")"
cat > "$PRICE_HISTORY_FILE" << 'EOF'
package valueobject

import "time"

type Timeframe string

const (
	TimeframeDaily   Timeframe = "daily"
	TimeframeWeekly  Timeframe = "weekly"
	TimeframeMonthly Timeframe = "monthly"
	TimeframeYearly  Timeframe = "yearly"
)

type PricePoint struct {
	Timestamp time.Time `json:"timestamp" bson:"timestamp"`
	Open      float64   `json:"open" bson:"open"`
	High      float64   `json:"high" bson:"high"`
	Low       float64   `json:"low" bson:"low"`
	Close     float64   `json:"close" bson:"close"`
	Volume    float64   `json:"volume" bson:"volume"`
}

type PriceHistory struct {
	AssetID     string      `json:"assetId" bson:"asset_id"`
	AssetSymbol string      `json:"assetSymbol" bson:"asset_symbol"`
	Timeframe   Timeframe   `json:"timeframe" bson:"timeframe"`
	Data        []PricePoint `json:"data" bson:"data"`
}

func NewPriceHistory(assetID, assetSymbol string, timeframe Timeframe, data []PricePoint) PriceHistory {
	return PriceHistory{
		AssetID:     assetID,
		AssetSymbol: assetSymbol,
		Timeframe:   timeframe,
		Data:        data,
	}
}

var (
	ErrNoDataAvailable = NewValueObjectError("no price data available")
	ErrInsufficientData = NewValueObjectError("insufficient data for calculation")
)

type ValueObjectError struct {
	message string
}

func (e ValueObjectError) Error() string {
	return e.message
}

func NewValueObjectError(message string) ValueObjectError {
	return ValueObjectError{message: message}
}

func (ph *PriceHistory) GetLatestPrice() (float64, error) {
	if len(ph.Data) == 0 {
		return 0, ErrNoDataAvailable
	}
	
	latestPoint := ph.Data[0]
	for _, point := range ph.Data {
		if point.Timestamp.After(latestPoint.Timestamp) {
			latestPoint = point
		}
	}
	
	return latestPoint.Close, nil
}

func (ph *PriceHistory) CalculateSimpleMovingAverage(period int) ([]float64, error) {
	if len(ph.Data) < period {
		return nil, ErrInsufficientData
	}
	
	result := make([]float64, len(ph.Data)-period+1)
	
	for i := 0; i <= len(ph.Data)-period; i++ {
		sum := 0.0
		for j := 0; j < period; j++ {
			sum += ph.Data[i+j].Close
		}
		result[i] = sum / float64(period)
	}
	
	return result, nil
}
EOF

# Asset repository interface
ASSET_REPO_FILE="internal/domain/asset/repository/asset_repository.go"
mkdir -p "$(dirname "$ASSET_REPO_FILE")"
cat > "$ASSET_REPO_FILE" << 'EOF'
package repository

import (
	"context"
	"time"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/valueobject"
)

type AssetRepository interface {
	GetByID(ctx context.Context, id string) (entity.Asset, error)
	GetBySymbol(ctx context.Context, symbol string, assetType entity.AssetType) (entity.Asset, error)
	GetAll(ctx context.Context, filter map[string]interface{}) ([]entity.Asset, error)
	GetByType(ctx context.Context, assetType entity.AssetType) ([]entity.Asset, error)
	GetFavorites(ctx context.Context) ([]entity.Asset, error)
	Save(ctx context.Context, asset entity.Asset) error
	Update(ctx context.Context, asset entity.Asset) error
	SetFavorite(ctx context.Context, id string, favorite bool) error
	UpdatePrice(ctx context.Context, id string, price float64) error
	Search(ctx context.Context, query string, types []entity.AssetType) ([]entity.Asset, error)
}

type PriceHistoryRepository interface {
	GetPriceHistory(
		ctx context.Context, 
		assetID string, 
		timeframe valueobject.Timeframe, 
		startDate *time.Time, 
		endDate *time.Time,
	) (valueobject.PriceHistory, error)
	SavePricePoints(ctx context.Context, assetID string, timeframe valueobject.Timeframe, points []valueobject.PricePoint) error
}

var (
	ErrAssetNotFound      = NewRepositoryError("asset not found")
	ErrDuplicateAsset     = NewRepositoryError("asset already exists")
	ErrRepositoryInternal = NewRepositoryError("internal repository error")
	ErrInvalidAssetType   = NewRepositoryError("invalid asset type")
)

type RepositoryError struct {
	Message string
}

func (e RepositoryError) Error() string {
	return e.Message
}

func NewRepositoryError(message string) RepositoryError {
	return RepositoryError{Message: message}
}
EOF

# Analysis entity
ANALYSIS_ENTITY_FILE="internal/domain/analysis/entity/strategy.go"
mkdir -p "$(dirname "$ANALYSIS_ENTITY_FILE")"
cat > "$ANALYSIS_ENTITY_FILE" << 'EOF'
package entity

import (
	"time"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/entity"
)

type InvestmentStrategy string

const (
	StrategyValue           InvestmentStrategy = "value"
	StrategyGrowth          InvestmentStrategy = "growth"
	StrategyDividend        InvestmentStrategy = "dividend"
	StrategyTrend           InvestmentStrategy = "trend"
	StrategyMomentum        InvestmentStrategy = "momentum"
	StrategyDCA             InvestmentStrategy = "dca"
	StrategySwingTrading    InvestmentStrategy = "swing"
	StrategyDiversification InvestmentStrategy = "diversification"
)

type OpportunityType string

const (
	OpportunityBuy  OpportunityType = "buy"
	OpportunitySell OpportunityType = "sell"
	OpportunityHold OpportunityType = "hold"
)

type RiskLevel string

const (
	RiskLow    RiskLevel = "low"
	RiskMedium RiskLevel = "medium"
	RiskHigh   RiskLevel = "high"
)

type InvestmentOpportunity struct {
	ID              string             `json:"id" bson:"_id"`
	Asset           entity.Asset       `json:"asset" bson:"asset"`
	Type            OpportunityType    `json:"type" bson:"type"`
	Reason          string             `json:"reason" bson:"reason"`
	PotentialReturn float64            `json:"potentialReturn" bson:"potential_return"`
	RiskLevel       RiskLevel          `json:"riskLevel" bson:"risk_level"`
	Strategy        InvestmentStrategy `json:"strategy" bson:"strategy"`
	CreatedAt       time.Time          `json:"createdAt" bson:"created_at"`
	ExpiresAt       time.Time          `json:"expiresAt" bson:"expires_at"`
	Expired         bool               `json:"expired" bson:"expired"`
}

func NewInvestmentOpportunity(
	asset entity.Asset,
	opportunityType OpportunityType,
	reason string,
	potentialReturn float64,
	riskLevel RiskLevel,
	strategy InvestmentStrategy,
) *InvestmentOpportunity {
	now := time.Now()
	expiresAt := now.AddDate(0, 0, 7)
	
	return &InvestmentOpportunity{
		ID:              generateID("opp"),
		Asset:           asset,
		Type:            opportunityType,
		Reason:          reason,
		PotentialReturn: potentialReturn,
		RiskLevel:       riskLevel,
		Strategy:        strategy,
		CreatedAt:       now,
		ExpiresAt:       expiresAt,
		Expired:         false,
	}
}

func (o *InvestmentOpportunity) IsExpired() bool {
	if o.Expired {
		return true
	}
	
	if time.Now().After(o.ExpiresAt) {
		o.Expired = true
		return true
	}
	
	return false
}

func (o *InvestmentOpportunity) MarkAsExpired() {
	o.Expired = true
}

func generateID(prefix string) string {
	timestamp := time.Now().Format("20060102150405")
	rand := randomString(6)
	return prefix + "-" + timestamp + "-" + rand
}

func randomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
		time.Sleep(1 * time.Nanosecond)
	}
	return string(b)
}
EOF

# Investment strategy interface
STRATEGY_FILE="internal/domain/analysis/strategy/strategy.go"
mkdir -p "$(dirname "$STRATEGY_FILE")"
cat > "$STRATEGY_FILE" << 'EOF'
package strategy

import (
	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/analysis/entity"
	assetEntity "github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/valueobject"
)

type InvestmentStrategyService interface {
	GetType() entity.InvestmentStrategy
	GetName() string
	GetDescription() string
	IsAssetSuitable(asset assetEntity.Asset) bool
	AnalyzeAsset(asset assetEntity.Asset, priceHistory valueobject.PriceHistory) (*entity.InvestmentOpportunity, error)
	ShouldSell(asset assetEntity.Asset, entryPrice float64, priceHistory valueobject.PriceHistory) (bool, entity.OpportunityType, string, error)
	GetSimulationParameters(asset assetEntity.Asset) (scenarios []float64, timeHorizon int)
}
EOF

echo "Criado: Entidade Asset"
echo "Criado: Value Object PriceHistory"
echo "Criado: Interface AssetRepository"
echo "Criado: Entidade Analysis"
echo "Criado: Interface InvestmentStrategyService"

echo "Camada de domínio criada com sucesso!"