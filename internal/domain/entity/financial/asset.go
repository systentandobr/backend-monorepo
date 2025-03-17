package financial

import (
	"time"
)

type AssetType string

const (
	AssetTypeStock  AssetType = "stock"
	AssetTypeCrypto AssetType = "crypto"
	AssetTypeREIT   AssetType = "reit"
)

type Asset struct {
	ID               string    `json:"id"`
	UserID           string    `json:"userId"`
	Symbol           string    `json:"symbol"`
	Type             AssetType `json:"type"`
	AcquisitionDate  time.Time `json:"acquisitionDate"`
	AcquisitionPrice float64   `json:"acquisitionPrice"`
	CurrentPrice     float64   `json:"currentPrice"`
	Quantity         float64   `json:"quantity"`
}

func NewAsset(userID, symbol string, assetType AssetType, price, quantity float64) Asset {
	return Asset{
		ID:               generateID(),
		UserID:           userID,
		Symbol:           symbol,
		Type:             assetType,
		AcquisitionDate:  time.Now(),
		AcquisitionPrice: price,
		CurrentPrice:     price,
		Quantity:         quantity,
	}
}

func (a *Asset) UpdatePrice(price float64) {
	a.CurrentPrice = price
}

func (a *Asset) Value() float64 {
	return a.CurrentPrice * a.Quantity
}

func (a *Asset) ProfitLoss() float64 {
	return (a.CurrentPrice - a.AcquisitionPrice) * a.Quantity
}

func (a *Asset) ProfitLossPercentage() float64 {
	if a.AcquisitionPrice == 0 {
		return 0
	}
	return ((a.CurrentPrice - a.AcquisitionPrice) / a.AcquisitionPrice) * 100
}

// Helper function to generate a unique ID
func generateID() string {
	return time.Now().Format("20060102150405") + "-" + randomString(8)
}

// Helper function to generate a random string
func randomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
		time.Sleep(1 * time.Nanosecond)
	}
	return string(b)
}
