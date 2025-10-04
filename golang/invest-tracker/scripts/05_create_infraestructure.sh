#!/bin/bash
# Script to create Binance API client

mkdir -p pkg/infrastructure/services/binance
cat > pkg/infrastructure/services/binance/client.go << 'EOF'
package binance

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/systentandobr/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/invest-tracker/internal/domain/asset/valueobject"
	"github.com/systentandobr/invest-tracker/pkg/common/errors"
	"github.com/systentandobr/invest-tracker/pkg/common/logger"
	"github.com/systentandobr/toolkit/go/shared/infrastructure/http"
)

type BinanceApiClient struct {
	httpClient *http.Client
	logger     logger.Logger
	apiKey     string
	apiSecret  string
}

type ClientConfig struct {
	BaseURL   string
	ApiKey    string
	ApiSecret string
	Timeout   time.Duration
}

func DefaultConfig() ClientConfig {
	return ClientConfig{
		BaseURL:   "https://api.binance.com/api/v3",
		ApiKey:    "",
		ApiSecret: "",
		Timeout:   10 * time.Second,
	}
}

func NewClient(config ClientConfig, log logger.Logger) (*BinanceApiClient, error) {
	if log == nil {
		logConfig := logger.DefaultConfig()
		var err error
		log, err = logger.New(logConfig)
		if err != nil {
			return nil, err
		}
	}

	httpConfig := http.DefaultConfig()
	httpConfig.BaseURL = config.BaseURL
	httpConfig.Timeout = config.Timeout
	
	if config.ApiKey != "" {
		httpConfig.DefaultHeaders["X-MBX-APIKEY"] = config.ApiKey
	}

	httpClient := http.NewClient(httpConfig, log)

	return &BinanceApiClient{
		httpClient: httpClient,
		logger:     log,
		apiKey:     config.ApiKey,
		apiSecret:  config.ApiSecret,
	}, nil
}

// GetCryptocurrencies fetches all available cryptocurrencies
func (c *BinanceApiClient) GetCryptocurrencies(ctx context.Context) ([]*entity.Cryptocurrency, error) {
	var response []struct {
		Symbol             string `json:"symbol"`
		PriceChange        string `json:"priceChange"`
		PriceChangePercent string `json:"priceChangePercent"`
		LastPrice          string `json:"lastPrice"`
		Volume             string `json:"volume"`
		PrevClosePrice     string `json:"prevClosePrice"`
	}

	err := c.httpClient.Get(ctx, "/ticker/24hr", &response, nil)
	if err != nil {
		return nil, errors.NewExternalError("failed to fetch cryptocurrencies", err)
	}

	cryptos := make([]*entity.Cryptocurrency, 0)
	for _, item := range response {
		if !strings.HasSuffix(item.Symbol, "USDT") {
			continue
		}

		symbol := strings.TrimSuffix(item.Symbol, "USDT")
		lastPrice, _ := strconv.ParseFloat(item.LastPrice, 64)
		prevClosePrice, _ := strconv.ParseFloat(item.PrevClosePrice, 64)
		priceChangePercent, _ := strconv.ParseFloat(item.PriceChangePercent, 64)
		volume, _ := strconv.ParseFloat(item.Volume, 64)

		crypto := entity.NewCryptocurrency(
			symbol,
			getCryptoName(symbol),
			lastPrice,
			0, // MarketCap not directly available
			0, // CirculatingSupply not directly available
			nil, // MaxSupply not directly available
		)

		crypto.BaseAsset.PreviousClose = prevClosePrice
		crypto.BaseAsset.ChangePercentage = priceChangePercent
		crypto.BaseAsset.Volume = volume

		cryptos = append(cryptos, crypto)

		// Limit to top 20 for this example
		if len(cryptos) >= 20 {
			break
		}
	}

	return cryptos, nil
}

// GetCryptoBySymbol fetches a cryptocurrency by its symbol
func (c *BinanceApiClient) GetCryptoBySymbol(ctx context.Context, symbol string) (*entity.Cryptocurrency, error) {
	var ticker struct {
		Symbol             string `json:"symbol"`
		PriceChangePercent string `json:"priceChangePercent"`
		LastPrice          string `json:"lastPrice"`
		Volume             string `json:"volume"`
		PrevClosePrice     string `json:"prevClosePrice"`
	}

	pair := symbol + "USDT"
	err := c.httpClient.Get(ctx, fmt.Sprintf("/ticker/24hr?symbol=%s", pair), &ticker, nil)
	if err != nil {
		return nil, errors.NewExternalError(fmt.Sprintf("failed to fetch crypto %s", symbol), err)
	}

	lastPrice, _ := strconv.ParseFloat(ticker.LastPrice, 64)
	prevClosePrice, _ := strconv.ParseFloat(ticker.PrevClosePrice, 64)
	priceChangePercent, _ := strconv.ParseFloat(ticker.PriceChangePercent, 64)
	volume, _ := strconv.ParseFloat(ticker.Volume, 64)

	crypto := entity.NewCryptocurrency(
		symbol,
		getCryptoName(symbol),
		lastPrice,
		0, 
		0, 
		nil,
	)

	crypto.BaseAsset.PreviousClose = prevClosePrice
	crypto.BaseAsset.ChangePercentage = priceChangePercent
	crypto.BaseAsset.Volume = volume

	return crypto, nil
}

// GetPriceHistory fetches historical price data for a cryptocurrency
func (c *BinanceApiClient) GetPriceHistory(
	ctx context.Context,
	symbol string,
	timeframe valueobject.Timeframe,
	startDate, endDate *time.Time,
) (valueobject.PriceHistory, error) {
	interval := mapTimeframeToInterval(timeframe)
	
	params := map[string]string{
		"symbol": symbol + "USDT",
		"interval": interval,
	}
	
	if startDate != nil {
		params["startTime"] = strconv.FormatInt(startDate.UnixMilli(), 10)
	}
	
	if endDate != nil {
		params["endTime"] = strconv.FormatInt(endDate.UnixMilli(), 10)
	}
	
	url := "/klines?" + buildQueryString(params)
	
	var response [][]interface{}
	err := c.httpClient.Get(ctx, url, &response, nil)
	if err != nil {
		return valueobject.PriceHistory{}, errors.NewExternalError(
			fmt.Sprintf("failed to fetch price history for %s", symbol), err)
	}
	
	points := make([]valueobject.PricePoint, 0, len(response))
	for _, item := range response {
		if len(item) < 6 {
			continue
		}
		
		timestamp := int64(item[0].(float64))
		open, _ := strconv.ParseFloat(item[1].(string), 64)
		high, _ := strconv.ParseFloat(item[2].(string), 64)
		low, _ := strconv.ParseFloat(item[3].(string), 64)
		close, _ := strconv.ParseFloat(item[4].(string), 64)
		volume, _ := strconv.ParseFloat(item[5].(string), 64)
		
		point := valueobject.PricePoint{
			Timestamp: time.UnixMilli(timestamp),
			Open:      open,
			High:      high,
			Low:       low,
			Close:     close,
			Volume:    volume,
		}
		points = append(points, point)
	}
	
	assetID := "crypto-" + symbol
	return valueobject.NewPriceHistory(assetID, symbol, timeframe, points), nil
}

// Helper functions
func sign(queryString, secret string) string {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(queryString))
	return hex.EncodeToString(h.Sum(nil))
}

func mapTimeframeToInterval(timeframe valueobject.Timeframe) string {
	switch timeframe {
	case valueobject.TimeframeDaily:
		return "1d"
	case valueobject.TimeframeWeekly:
		return "1w"
	case valueobject.TimeframeMonthly:
		return "1M"
	case valueobject.TimeframeYearly:
		return "1M" // Binance doesn't have yearly interval
	default:
		return "1d"
	}
}

func buildQueryString(params map[string]string) string {
	if len(params) == 0 {
		return ""
	}
	
	query := make([]string, 0, len(params))
	for key, value := range params {
		query = append(query, fmt.Sprintf("%s=%s", key, value))
	}
	
	return strings.Join(query, "&")
}

func getCryptoName(symbol string) string {
	names := map[string]string{
		"BTC": "Bitcoin",
		"ETH": "Ethereum",
		"BNB": "Binance Coin",
		"SOL": "Solana",
		"ADA": "Cardano",
		"XRP": "Ripple",
		"DOT": "Polkadot",
		"DOGE": "Dogecoin",
		"AVAX": "Avalanche",
		"MATIC": "Polygon",
	}
	
	if name, ok := names[symbol]; ok {
		return name
	}
	return symbol
}
EOF

echo "Created Binance API client"

#!/bin/bash
mkdir -p internal/adapter/persistence

cat > internal/adapter/persistence/price_history_repository.go << 'EOF'
package persistence

import (
	"context"
	"fmt"
	"time"

	"github.com/systentandobr/invest-tracker/internal/domain/asset/valueobject"
	"github.com/systentandobr/invest-tracker/pkg/common/logger"
	"github.com/systentandobr/toolkit/go/shared/infrastructure/persistence/mongodb"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type PriceHistoryRepositoryMongo struct {
	client *mongodb.Client
	logger logger.Logger
}

func NewPriceHistoryRepositoryMongo(client *mongodb.Client, log logger.Logger) *PriceHistoryRepositoryMongo {
	return &PriceHistoryRepositoryMongo{
		client: client,
		logger: log,
	}
}

func (r *PriceHistoryRepositoryMongo) GetPriceHistory(
	ctx context.Context,
	assetID string,
	timeframe valueobject.Timeframe,
	startDate *time.Time,
	endDate *time.Time,
) (valueobject.PriceHistory, error) {
	collection := r.client.Collection("price_history")
	
	filter := bson.M{
		"asset_id":  assetID,
		"timeframe": timeframe,
	}
	
	var result struct {
		AssetID     string                   `bson:"asset_id"`
		AssetSymbol string                   `bson:"asset_symbol"`
		Timeframe   valueobject.Timeframe    `bson:"timeframe"`
		Data        []valueobject.PricePoint `bson:"data"`
	}
	
	err := collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		return valueobject.PriceHistory{}, fmt.Errorf("failed to get price history: %w", err)
	}
	
	// Filter points by date if needed
	filteredData := result.Data
	if startDate != nil || endDate != nil {
		filteredData = make([]valueobject.PricePoint, 0)
		for _, point := range result.Data {
			if (startDate == nil || !point.Timestamp.Before(*startDate)) &&
				(endDate == nil || !point.Timestamp.After(*endDate)) {
				filteredData = append(filteredData, point)
			}
		}
	}
	
	return valueobject.PriceHistory{
		AssetID:     result.AssetID,
		AssetSymbol: result.AssetSymbol,
		Timeframe:   result.Timeframe,
		Data:        filteredData,
	}, nil
}

func (r *PriceHistoryRepositoryMongo) SavePricePoints(
	ctx context.Context,
	assetID string,
	timeframe valueobject.Timeframe,
	points []valueobject.PricePoint,
) error {
	if len(points) == 0 {
		return nil
	}
	
	collection := r.client.Collection("price_history")
	
	// Try to find existing document
	filter := bson.M{
		"asset_id":  assetID,
		"timeframe": timeframe,
	}
	
	var existingDoc struct {
		AssetID     string                   `bson:"asset_id"`
		AssetSymbol string                   `bson:"asset_symbol"`
		Data        []valueobject.PricePoint `bson:"data"`
	}
	
	err := collection.FindOne(ctx, filter).Decode(&existingDoc)
	
	if err == nil {
		// Document exists, update with new points
		mergedPoints := mergePoints(existingDoc.Data, points)
		
		update := bson.M{
			"$set": bson.M{
				"data": mergedPoints,
			},
		}
		
		_, err = collection.UpdateOne(ctx, filter, update)
		if err != nil {
			return fmt.Errorf("failed to update price history: %w", err)
		}
	} else {
		// No document yet, create new one
		assetSymbol := ""
		parts := strings.Split(assetID, "-")
		if len(parts) > 1 {
			assetSymbol = parts[1]
		}
		
		document := bson.M{
			"asset_id":     assetID,
			"asset_symbol": assetSymbol,
			"timeframe":    timeframe,
			"data":         points,
		}
		
		_, err = collection.InsertOne(ctx, document)
		if err != nil {
			return fmt.Errorf("failed to insert price history: %w", err)
		}
	}
	
	return nil
}

// mergePoints combines existing points with new ones, avoiding duplicates
func mergePoints(existing, new []valueobject.PricePoint) []valueobject.PricePoint {
	// Create a map for quick lookup of existing timestamps
	existingMap := make(map[time.Time]bool)
	for _, point := range existing {
		existingMap[point.Timestamp] = true
	}
	
	// Add new points if they don't already exist
	result := existing
	for _, point := range new {
		if !existingMap[point.Timestamp] {
			result = append(result, point)
			existingMap[point.Timestamp] = true
		}
	}
	
	return result
}
EOF

echo "Created Price History Repository Implementation"

#!/bin/bash
# Script to create domain entities and repositories

if [ $# -lt 1 ]; then
  echo "Usage: $0 <base_dir>"
  exit 1
fi

BASE_DIR=$1
echo "Creating domain layer in: $BASE_DIR"

# Create asset entities
mkdir -p $BASE_DIR/internal/domain/asset/entity
cat > $BASE_DIR/internal/domain/asset/entity/asset.go << 'EOF'
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
func (a *BaseAsset) IsFavorite() bool            { return a.Favorite }
func (a *BaseAsset) SetFavorite(favorite bool)   { a.Favorite = favorite }

func (a *BaseAsset) SetCurrentPrice(price float64) {
	a.PreviousClose = a.CurrentPrice
	a.CurrentPrice = price
	a.ChangePercentage = ((price - a.PreviousClose) / a.PreviousClose) * 100
	a.LastUpdated = time.Now()
}

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
	MarketCap         float64    `json:"marketCap" bson:"market_cap"`
	CirculatingSupply float64    `json:"circulatingSupply" bson:"circulating_supply"`
	MaxSupply         *float64   `json:"maxSupply,omitempty" bson:"max_supply,omitempty"`
	AllTimeHigh       float64    `json:"allTimeHigh,omitempty" bson:"all_time_high,omitempty"`
	AllTimeHighDate   *time.Time `json:"allTimeHighDate,omitempty" bson:"all_time_high_date,omitempty"`
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

# Create price history value object
mkdir -p $BASE_DIR/internal/domain/asset/valueobject
cat > $BASE_DIR/internal/domain/asset/valueobject/price_history.go << 'EOF'
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
	AssetID     string       `json:"assetId" bson:"asset_id"`
	AssetSymbol string       `json:"assetSymbol" bson:"asset_symbol"`
	Timeframe   Timeframe    `json:"timeframe" bson:"timeframe"`
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

type ValueObjectError struct {
	message string
}

func (e ValueObjectError) Error() string {
	return e.message
}

func NewValueObjectError(message string) ValueObjectError {
	return ValueObjectError{message: message}
}

var (
	ErrNoDataAvailable  = NewValueObjectError("no price data available")
	ErrInsufficientData = NewValueObjectError("insufficient data for calculation")
)

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

# Create asset repository interface
mkdir -p $BASE_DIR/internal/domain/asset/repository
cat > $BASE_DIR/internal/domain/asset/repository/asset_repository.go << 'EOF'
package repository

import (
	"context"
	"time"

	"github.com/systentandobr/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/invest-tracker/internal/domain/asset/valueobject"
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

type RepositoryError struct {
	Message string
}

func (e RepositoryError) Error() string {
	return e.Message
}

func NewRepositoryError(message string) RepositoryError {
	return RepositoryError{Message: message}
}

var (
	ErrAssetNotFound      = NewRepositoryError("asset not found")
	ErrDuplicateAsset     = NewRepositoryError("asset already exists")
	ErrRepositoryInternal = NewRepositoryError("internal repository error")
	ErrInvalidAssetType   = NewRepositoryError("invalid asset type")
)
EOF

# Create analysis entities
mkdir -p $BASE_DIR/internal/domain/analysis/entity
cat > $BASE_DIR/internal/domain/analysis/entity/opportunity.go << 'EOF'
package entity

import (
	"time"

	"github.com/systentandobr/invest-tracker/internal/domain/asset/entity"
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
	expiresAt := now.AddDate(0, 0, 7) // 7 days by default
	
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

// Helper function to generate a unique ID
func generateID(prefix string) string {
	return prefix + "-" + time.Now().Format("20060102150405") + "-" + randomString(6)
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

# Create investment strategy interface
mkdir -p $BASE_DIR/internal/domain/analysis/strategy
cat > $BASE_DIR/internal/domain/analysis/strategy/strategy.go << 'EOF'
package strategy

import (
	"github.com/systentandobr/invest-tracker/internal/domain/analysis/entity"
	assetEntity "github.com/systentandobr/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/invest-tracker/internal/domain/asset/valueobject"
)

type InvestmentStrategyService interface {
	// Returns the strategy type
	GetType() entity.InvestmentStrategy
	
	// Returns the strategy name
	GetName() string
	
	// Returns the strategy description
	GetDescription() string
	
	// Checks if an asset is suitable for this strategy
	IsAssetSuitable(asset assetEntity.Asset) bool
	
	// Analyzes an asset and returns investment opportunities
	AnalyzeAsset(asset assetEntity.Asset, priceHistory valueobject.PriceHistory) (*entity.InvestmentOpportunity, error)
	
	// Checks if an asset should be sold 
	ShouldSell(asset assetEntity.Asset, entryPrice float64, priceHistory valueobject.PriceHistory) (bool, entity.OpportunityType, string, error)
	
	// Returns parameters for simulation
	GetSimulationParameters(asset assetEntity.Asset) (scenarios []float64, timeHorizon int)
}
EOF

# Create simulation entities
mkdir -p $BASE_DIR/internal/domain/simulation/entity
cat > $BASE_DIR/internal/domain/simulation/entity/simulation.go << 'EOF'
package entity

import (
	"time"

	"github.com/systentandobr/invest-tracker/internal/domain/analysis/entity"
	assetEntity "github.com/systentandobr/invest-tracker/internal/domain/asset/entity"
)

type SimulationStatus string

const (
	SimulationPending  SimulationStatus = "pending"
	SimulationRunning  SimulationStatus = "running"
	SimulationComplete SimulationStatus = "complete"
	SimulationFailed   SimulationStatus = "failed"
)

type Simulation struct {
	ID              string                    `json:"id" bson:"_id"`
	Name            string                    `json:"name" bson:"name"`
	Asset           assetEntity.Asset         `json:"asset" bson:"asset"`
	Strategy        entity.InvestmentStrategy `json:"strategy" bson:"strategy"`
	InitialAmount   float64                   `json:"initialAmount" bson:"initial_amount"`
	EntryPrice      float64                   `json:"entryPrice" bson:"entry_price"`
	TargetPrice     float64                   `json:"targetPrice" bson:"target_price"`
	StopLoss        *float64                  `json:"stopLoss,omitempty" bson:"stop_loss,omitempty"`
	TimeHorizon     int                       `json:"timeHorizon" bson:"time_horizon"` // In days
	Scenarios       []float64                 `json:"scenarios" bson:"scenarios"`      // Percentage changes
	Results         []*SimulationResult       `json:"results" bson:"results"`
	Status          SimulationStatus          `json:"status" bson:"status"`
	ErrorMessage    string                    `json:"errorMessage,omitempty" bson:"error_message,omitempty"`
	CreatedAt       time.Time                 `json:"createdAt" bson:"created_at"`
	CompletedAt     *time.Time                `json:"completedAt,omitempty" bson:"completed_at,omitempty"`
}

type SimulationResult struct {
	ScenarioChange float64 `json:"scenarioChange" bson:"scenario_change"` // Percentage
	FinalAmount    float64 `json:"finalAmount" bson:"final_amount"`
	FinalPrice     float64 `json:"finalPrice" bson:"final_price"`
	ProfitLoss     float64 `json:"profitLoss" bson:"profit_loss"`
	ProfitLossPerc float64 `json:"profitLossPerc" bson:"profit_loss_perc"`
	AnnualizedROI  float64 `json:"annualizedROI" bson:"annualized_roi"`
}

func NewSimulation(
	name string,
	asset assetEntity.Asset,
	strategy entity.InvestmentStrategy,
	initialAmount, entryPrice, targetPrice float64,
	stopLoss *float64,
	timeHorizon int,
	scenarios []float64,
) *Simulation {
	return &Simulation{
		ID:            "sim-" + time.Now().Format("20060102150405") + "-" + randomString(6),
		Name:          name,
		Asset:         asset,
		Strategy:      strategy,
		InitialAmount: initialAmount,
		EntryPrice:    entryPrice,
		TargetPrice:   targetPrice,
		StopLoss:      stopLoss,
		TimeHorizon:   timeHorizon,
		Scenarios:     scenarios,
		Results:       []*SimulationResult{},
		Status:        SimulationPending,
		CreatedAt:     time.Now(),
	}
}

func (s *Simulation) AddResult(change, finalAmount, finalPrice float64) {
	profitLoss := finalAmount - s.InitialAmount
	profitLossPerc := (profitLoss / s.InitialAmount) * 100
	
	// Calculate annualized ROI
	years := float64(s.TimeHorizon) / 365.0
	if years <= 0 {
		years = 1.0 / 365.0 // 1 day minimum
	}
	annualizedROI := ((finalAmount / s.InitialAmount) ^ (1 / years)) - 1
	
	result := &SimulationResult{
		ScenarioChange: change,
		FinalAmount:    finalAmount,
		FinalPrice:     finalPrice,
		ProfitLoss:     profitLoss,
		ProfitLossPerc: profitLossPerc,
		AnnualizedROI:  annualizedROI,
	}
	
	s.Results = append(s.Results, result)
}

func (s *Simulation) Start() {
	s.Status = SimulationRunning
}

func (s *Simulation) Complete() {
	s.Status = SimulationComplete
	now := time.Now()
	s.CompletedAt = &now
}

func (s *Simulation) Fail(errorMessage string) {
	s.Status = SimulationFailed
	s.ErrorMessage = errorMessage
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

echo "Domain layer created successfully"

#!/bin/bash
# Create a value investment strategy implementation

if [ $# -lt 1 ]; then
  echo "Usage: $0 <base_dir>"
  exit 1
fi

BASE_DIR=$1
echo "Creating value investment strategy implementation in: $BASE_DIR"

mkdir -p $BASE_DIR/internal/domain/analysis/strategy
cat > $BASE_DIR/internal/domain/analysis/strategy/value_strategy.go << 'EOF'
package strategy

import (
	"strings"

	"github.com/systentandobr/invest-tracker/internal/domain/analysis/entity"
	assetEntity "github.com/systentandobr/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/invest-tracker/internal/domain/asset/valueobject"
)

// ValueInvestmentStrategy implements the Value Investment strategy
type ValueInvestmentStrategy struct{}

// NewValueInvestmentStrategy creates a new instance of the strategy
func NewValueInvestmentStrategy() *ValueInvestmentStrategy {
	return &ValueInvestmentStrategy{}
}

// GetType returns the strategy type
func (s *ValueInvestmentStrategy) GetType() entity.InvestmentStrategy {
	return entity.StrategyValue
}

// GetName returns the strategy name
func (s *ValueInvestmentStrategy) GetName() string {
	return "Value Investment"
}

// GetDescription returns the strategy description
func (s *ValueInvestmentStrategy) GetDescription() string {
	return "Focuses on stocks trading below their intrinsic value, as determined by fundamental analysis. " +
		"Looks for companies with strong financials, low debt, stable earnings, and good dividend yield."
}

// IsAssetSuitable checks if an asset is suitable for this strategy
func (s *ValueInvestmentStrategy) IsAssetSuitable(asset assetEntity.Asset) bool {
	// Value investing typically applies to stocks and REITs
	return asset.GetType() == assetEntity.AssetTypeStock || asset.GetType() == assetEntity.AssetTypeREIT
}

// AnalyzeAsset analyzes an asset and returns investment opportunities
func (s *ValueInvestmentStrategy) AnalyzeAsset(asset assetEntity.Asset, priceHistory valueobject.PriceHistory) (*entity.InvestmentOpportunity, error) {
	switch asset.GetType() {
	case assetEntity.AssetTypeStock:
		return s.analyzeStock(asset.(*assetEntity.Stock), priceHistory)
	case assetEntity.AssetTypeREIT:
		return s.analyzeREIT(asset.(*assetEntity.REIT), priceHistory)
	default:
		return nil, nil // Not suitable for this strategy
	}
}

// ShouldSell checks if an asset should be sold
func (s *ValueInvestmentStrategy) ShouldSell(asset assetEntity.Asset, entryPrice float64, priceHistory valueobject.PriceHistory) (bool, entity.OpportunityType, string, error) {
	currentPrice := asset.GetCurrentPrice()
	percentGain := ((currentPrice - entryPrice) / entryPrice) * 100
	
	// If gain is 30% or more, consider selling
	if percentGain >= 30 {
		return true, entity.OpportunitySell, 
			"Gain of 30% or more achieved, consider taking profits", nil
	}
	
	// Check if asset is overvalued based on its type
	switch asset.GetType() {
	case assetEntity.AssetTypeStock:
		stock := asset.(*assetEntity.Stock)
		if stock.PriceToEarnings > 25 {
			return true, entity.OpportunitySell, 
				"P/E ratio above 25 suggests overvaluation", nil
		}
	case assetEntity.AssetTypeREIT:
		reit := asset.(*assetEntity.REIT)
		if reit.PVP > 1.3 {
			return true, entity.OpportunitySell, 
				"P/B ratio above 1.3 suggests overvaluation", nil
		}
	}
	
	// Default: maintain position
	return false, entity.OpportunityHold, "Asset still appears reasonably valued", nil
}

// GetSimulationParameters returns parameters for simulation
func (s *ValueInvestmentStrategy) GetSimulationParameters(asset assetEntity.Asset) ([]float64, int) {
	// Value investing typically has a longer time horizon (3-5 years)
	scenarios := []float64{-20, -10, -5, 0, 5, 10, 15, 20, 30}
	timeHorizon := 1080 // 3 years in days
	
	return scenarios, timeHorizon
}

// Private helper methods

func (s *ValueInvestmentStrategy) analyzeStock(stock *assetEntity.Stock, priceHistory valueobject.PriceHistory) (*entity.InvestmentOpportunity, error) {
	// Value criteria
	lowPE := stock.PriceToEarnings > 0 && stock.PriceToEarnings < 15
	highDividend := stock.DividendYield > 3.0
	
	// Calculate average price from history
	avgPrice := calculateAveragePrice(priceHistory)
	belowAverage := stock.CurrentPrice < avgPrice*0.9 // 10% below average
	
	// Score the opportunity
	score := 0
	reasons := []string{}
	
	if lowPE {
		score++
		reasons = append(reasons, "P/E ratio below 15")
	}
	
	if highDividend {
		score++
		reasons = append(reasons, "Dividend yield above 3%")
	}
	
	if belowAverage {
		score++
		reasons = append(reasons, "Price below historical average")
	}
	
	// Create opportunity if score is good
	if score >= 2 {
		reason := "Value opportunity: " + joinStrings(reasons, ", ")
		potentialReturn := estimatePotentialReturn(stock.CurrentPrice, avgPrice)
		riskLevel := entity.RiskLow
		
		if stock.MarketCap < 5000000000 { // $5B
			riskLevel = entity.RiskMedium
		}
		
		return entity.NewInvestmentOpportunity(
			stock,
			entity.OpportunityBuy,
			reason,
			potentialReturn,
			riskLevel,
			entity.StrategyValue,
		), nil
	}
	
	return nil, nil
}

func (s *ValueInvestmentStrategy) analyzeREIT(reit *assetEntity.REIT, priceHistory valueobject.PriceHistory) (*entity.InvestmentOpportunity, error) {
	// Value criteria for REITs
	lowPVP := reit.PVP < 1.0
	highDividend := reit.DividendYield > 5.0
	
	// Calculate average price from history
	avgPrice := calculateAveragePrice(priceHistory)
	belowAverage := reit.CurrentPrice < avgPrice*0.9 // 10% below average
	
	// Score the opportunity
	score := 0
	reasons := []string{}
	
	if lowPVP {
		score++
		reasons = append(reasons, "P/VP below 1.0")
	}
	
	if highDividend {
		score++
		reasons = append(reasons, "Dividend yield above 5%")
	}
	
	if belowAverage {
		score++
		reasons = append(reasons, "Price below historical average")
	}
	
	// Create opportunity if score is good
	if score >= 2 {
		reason := "Value opportunity: " + joinStrings(reasons, ", ")
		potentialReturn := estimatePotentialReturn(reit.CurrentPrice, avgPrice)
		
		return entity.NewInvestmentOpportunity(
			reit,
			entity.OpportunityBuy,
			reason,
			potentialReturn,
			entity.RiskLow, // REITs generally have lower risk
			entity.StrategyValue,
		), nil
	}
	
	return nil, nil
}

// Helper functions

func calculateAveragePrice(priceHistory valueobject.PriceHistory) float64 {
	if len(priceHistory.Data) == 0 {
		return 0
	}
	
	sum := 0.0
	for _, point := range priceHistory.Data {
		sum += point.Close
	}
	
	return sum / float64(len(priceHistory.Data))
}

func estimatePotentialReturn(currentPrice, averagePrice float64) float64 {
	if currentPrice >= averagePrice {
		return 10 // Default 10% if already above average
	}
	
	// Return to mean + 10% additional growth
	returnToMean := ((averagePrice - currentPrice) / currentPrice) * 100
	return returnToMean + 10
}

func joinStrings(strs []string, sep string) string {
	return strings.Join(strs, sep)
}
EOF

# Create a momentum investment strategy as well
cat > $BASE_DIR/internal/domain/analysis/strategy/momentum_strategy.go << 'EOF'
package strategy

import (
	"math"
	"strings"
	
	"github.com/systentandobr/invest-tracker/internal/domain/analysis/entity"
	assetEntity "github.com/systentandobr/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/invest-tracker/internal/domain/asset/valueobject"
)

// MomentumInvestmentStrategy implements the Momentum Investment strategy
type MomentumInvestmentStrategy struct{}

// NewMomentumInvestmentStrategy creates a new instance of the strategy
func NewMomentumInvestmentStrategy() *MomentumInvestmentStrategy {
	return &MomentumInvestmentStrategy{}
}

// GetType returns the strategy type
func (s *MomentumInvestmentStrategy) GetType() entity.InvestmentStrategy {
	return entity.StrategyMomentum
}

// GetName returns the strategy name
func (s *MomentumInvestmentStrategy) GetName() string {
	return "Momentum Investment"
}

// GetDescription returns the strategy description
func (s *MomentumInvestmentStrategy) GetDescription() string {
	return "Focuses on assets that have shown significant price appreciation in the recent past. " +
		"The strategy is based on the premise that assets which have performed well will continue to perform well."
}

// IsAssetSuitable checks if an asset is suitable for this strategy
func (s *MomentumInvestmentStrategy) IsAssetSuitable(asset assetEntity.Asset) bool {
	// Momentum strategy can be applied to all asset types
	return true
}

// AnalyzeAsset analyzes an asset and returns investment opportunities
func (s *MomentumInvestmentStrategy) AnalyzeAsset(asset assetEntity.Asset, priceHistory valueobject.PriceHistory) (*entity.InvestmentOpportunity, error) {
	if len(priceHistory.Data) < 30 {
		return nil, nil // Not enough data for analysis
	}
	
	// Calculate short-term and long-term momentum
	shortTermChange := calculateRecentPerformance(priceHistory, 14) // 14 days
	longTermChange := calculateRecentPerformance(priceHistory, 90)  // 90 days
	
	// Calculate volatility
	volatility := calculateVolatility(priceHistory, 30)
	
	// Score the opportunity
	score := 0
	reasons := []string{}
	
	// Strong short-term momentum
	if shortTermChange > 5 {
		score++
		reasons = append(reasons, "Strong 14-day momentum (+"+formatFloat(shortTermChange)+"%)")
	}
	
	// Strong long-term momentum
	if longTermChange > 15 {
		score++
		reasons = append(reasons, "Strong 90-day momentum (+"+formatFloat(longTermChange)+"%)")
	}
	
	// Rising volume
	if hasRisingVolume(priceHistory, 14) {
		score++
		reasons = append(reasons, "Increasing trading volume")
	}
	
	// Check if the asset is at all-time high
	if isNearAllTimeHigh(priceHistory) {
		score++
		reasons = append(reasons, "Trading near all-time high")
	}
	
	// Create opportunity if score is good
	if score >= 2 {
		reason := "Momentum opportunity: " + joinStrings(reasons, ", ")
		
		// Determine risk level based on asset type and volatility
		riskLevel := entity.RiskMedium
		if asset.GetType() == assetEntity.AssetTypeCrypto || volatility > 3.0 {
			riskLevel = entity.RiskHigh
		}
		
		// Estimate potential return based on recent momentum
		potentialReturn := math.Max(shortTermChange*1.5, 10.0)
		
		return entity.NewInvestmentOpportunity(
			asset,
			entity.OpportunityBuy,
			reason,
			potentialReturn,
			riskLevel,
			entity.StrategyMomentum,
		), nil
	}
	
	return nil, nil
}

// ShouldSell checks if an asset should be sold
func (s *MomentumInvestmentStrategy) ShouldSell(asset assetEntity.Asset, entryPrice float64, priceHistory valueobject.PriceHistory) (bool, entity.OpportunityType, string, error) {
	if len(priceHistory.Data) < 14 {
		return false, entity.OpportunityHold, "Insufficient data for analysis", nil
	}
	
	currentPrice := asset.GetCurrentPrice()
	percentGain := ((currentPrice - entryPrice) / entryPrice) * 100
	
	// Take profit if significant gain
	if percentGain > 20 {
		return true, entity.OpportunitySell, "Target profit of 20% reached", nil
	}
	
	// Calculate recent momentum
	recentChange := calculateRecentPerformance(priceHistory, 7)
	
	// Sell if momentum is reversing
	if recentChange < -5 {
		return true, entity.OpportunitySell, "Momentum reversal detected", nil
	}
	
	// Sell if price drops below moving average
	sma, err := priceHistory.CalculateSimpleMovingAverage(14)
	if err == nil && len(sma) > 0 && currentPrice < sma[len(sma)-1] {
		return true, entity.OpportunitySell, "Price dropped below 14-day moving average", nil
	}
	
	return false, entity.OpportunityHold, "Momentum still intact", nil
}

// GetSimulationParameters returns parameters for simulation
func (s *MomentumInvestmentStrategy) GetSimulationParameters(asset assetEntity.Asset) ([]float64, int) {
	// Momentum strategy typically has shorter time horizon
	scenarios := []float64{-25, -15, -5, 5, 15, 25, 35}
	
	// Time horizon depends on asset type
	timeHorizon := 90 // 90 days default
	if asset.GetType() == assetEntity.AssetTypeCrypto {
		timeHorizon = 30 // Shorter for crypto
	}
	
	return scenarios, timeHorizon
}

// Helper functions

func calculateRecentPerformance(priceHistory valueobject.PriceHistory, days int) float64 {
	if len(priceHistory.Data) < days {
		return 0
	}
	
	// Sort data by timestamp
	data := priceHistory.Data
	// Assume data is sorted by time, newest last
	
	current := data[len(data)-1].Close
	past := data[len(data)-days].Close
	
	return ((current - past) / past) * 100
}

func calculateVolatility(priceHistory valueobject.PriceHistory, days int) float64 {
	if len(priceHistory.Data) < days {
		return 0
	}
	
	// Calculate daily returns
	returns := make([]float64, 0, days-1)
	for i := len(priceHistory.Data) - days + 1; i < len(priceHistory.Data); i++ {
		yesterday := priceHistory.Data[i-1].Close
		today := priceHistory.Data[i].Close
		dailyReturn := (today - yesterday) / yesterday
		returns = append(returns, dailyReturn)
	}
	
	// Calculate standard deviation of returns
	mean := 0.0
	for _, r := range returns {
		mean += r
	}
	mean /= float64(len(returns))
	
	variance := 0.0
	for _, r := range returns {
		variance += math.Pow(r-mean, 2)
	}
	variance /= float64(len(returns))
	
	return math.Sqrt(variance)
}

func hasRisingVolume(priceHistory valueobject.PriceHistory, days int) bool {
	if len(priceHistory.Data) < days*2 {
		return false
	}
	
	// Calculate average volume for recent period vs previous period
	recentSum := 0.0
	previousSum := 0.0
	
	for i := len(priceHistory.Data) - 1; i >= len(priceHistory.Data) - days; i-- {
		recentSum += priceHistory.Data[i].Volume
	}
	
	for i := len(priceHistory.Data) - days - 1; i >= len(priceHistory.Data) - days*2; i-- {
		previousSum += priceHistory.Data[i].Volume
	}
	
	recentAvg := recentSum / float64(days)
	previousAvg := previousSum / float64(days)
	
	return recentAvg > previousAvg * 1.1 // 10% increase in volume
}

func isNearAllTimeHigh(priceHistory valueobject.PriceHistory) bool {
	if len(priceHistory.Data) < 2 {
		return false
	}
	
	// Find all-time high
	high := 0.0
	for _, point := range priceHistory.Data {
		if point.High > high {
			high = point.High
		}
	}
	
	// Check if current price is within 5% of all-time high
	current := priceHistory.Data[len(priceHistory.Data)-1].Close
	return current >= high * 0.95
}

func formatFloat(value float64) string {
	return strings.TrimRight(strings.TrimRight(float64str(value, 2), "0"), ".")
}

func float64str(value float64, precision int) string {
	return strconv.FormatFloat(value, 'f', precision, 64)
}
EOF

echo "Strategy implementations created successfully"