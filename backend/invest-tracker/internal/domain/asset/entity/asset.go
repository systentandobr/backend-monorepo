// internal/domain/asset/entity/asset.go
package entity

import (
	"time"
)

// AssetType representa os diferentes tipos de ativos financeiros
type AssetType string

const (
	AssetTypeStock  AssetType = "stock"  // Ações
	AssetTypeREIT   AssetType = "reit"   // Fundos Imobiliários
	AssetTypeCrypto AssetType = "crypto" // Criptomoedas
)

// Asset é a interface base para todos os tipos de ativos
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

// BaseAsset implementa a interface Asset com atributos comuns
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

// Implementação dos métodos da interface Asset
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

// Stock representa um ativo do tipo ação
type Stock struct {
	BaseAsset
	Company         string  `json:"company" bson:"company"`
	Sector          string  `json:"sector" bson:"sector"`
	DividendYield   float64 `json:"dividendYield" bson:"dividend_yield"`
	PriceToEarnings float64 `json:"priceToEarnings" bson:"price_to_earnings"`
	MarketCap       float64 `json:"marketCap" bson:"market_cap"`
}

// REIT representa um ativo do tipo fundo imobiliário
type REIT struct {
	BaseAsset
	Segment       string  `json:"segment" bson:"segment"`
	DividendYield float64 `json:"dividendYield" bson:"dividend_yield"`
	PropertyCount int     `json:"propertyCount" bson:"property_count"`
	PVP           float64 `json:"pvp" bson:"pvp"`
	LastDividend  float64 `json:"lastDividend" bson:"last_dividend"`
}

// Cryptocurrency representa um ativo do tipo criptomoeda
type Cryptocurrency struct {
	BaseAsset
	MarketCap         float64     `json:"marketCap" bson:"market_cap"`
	CirculatingSupply float64     `json:"circulatingSupply" bson:"circulating_supply"`
	MaxSupply         *float64    `json:"maxSupply,omitempty" bson:"max_supply,omitempty"`
	AllTimeHigh       float64     `json:"allTimeHigh,omitempty" bson:"all_time_high,omitempty"`
	AllTimeHighDate   *time.Time  `json:"allTimeHighDate,omitempty" bson:"all_time_high_date,omitempty"`
}

// NewStock cria uma nova instância de Stock
func NewStock(symbol, name, company, sector string, currentPrice, dividendYield, priceToEarnings, marketCap float64) *Stock {
	id := "stock-" + symbol
	return &Stock{
		BaseAsset: BaseAsset{
			ID:               id,
			Symbol:           symbol,
			Name:             name,
			Type:             AssetTypeStock,
			CurrentPrice:     currentPrice,
			PreviousClose:    currentPrice, // Inicialmente igual
			ChangePercentage: 0,
			LastUpdated:      time.Now(),
			Favorite:         false,
		},
		Company:         company,
		Sector:          sector,
		DividendYield:   dividendYield,
		PriceToEarnings: priceToEarnings,
		MarketCap:       marketCap,
	}
}

// NewREIT cria uma nova instância de REIT
func NewREIT(symbol, name, segment string, currentPrice, dividendYield, pvp, lastDividend float64, propertyCount int) *REIT {
	id := "reit-" + symbol
	return &REIT{
		BaseAsset: BaseAsset{
			ID:               id,
			Symbol:           symbol,
			Name:             name,
			Type:             AssetTypeREIT,
			CurrentPrice:     currentPrice,
			PreviousClose:    currentPrice, // Inicialmente igual
			ChangePercentage: 0,
			LastUpdated:      time.Now(),
			Favorite:         false,
		},
		Segment:       segment,
		DividendYield: dividendYield,
		PropertyCount: propertyCount,
		PVP:           pvp,
		LastDividend:  lastDividend,
	}
}

// NewCryptocurrency cria uma nova instância de Cryptocurrency
func NewCryptocurrency(symbol, name string, currentPrice, marketCap, circulatingSupply float64, maxSupply *float64) *Cryptocurrency {
	id := "crypto-" + symbol
	return &Cryptocurrency{
		BaseAsset: BaseAsset{
			ID:               id,
			Symbol:           symbol,
			Name:             name,
			Type:             AssetTypeCrypto,
			CurrentPrice:     currentPrice,
			PreviousClose:    currentPrice, // Inicialmente igual
			ChangePercentage: 0,
			LastUpdated:      time.Now(),
			Favorite:         false,
		},
		MarketCap:         marketCap,
		CirculatingSupply: circulatingSupply,
		MaxSupply:         maxSupply,
	}
}