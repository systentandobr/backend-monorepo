// internal/adapter/service/financial_service.go
package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"
	
	"github.com/systentandobr/life-tracker/internal/port/output"
)

// FinancialServiceAdapter implements the FinancialDataService interface
type FinancialServiceAdapter struct {
	httpClient *http.Client
	binanceAPI string
	b3API      string
}

// NewFinancialServiceAdapter creates a new FinancialServiceAdapter
func NewFinancialServiceAdapter() *FinancialServiceAdapter {
	return &FinancialServiceAdapter{
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		binanceAPI: "https://api.binance.com",
		b3API:      "https://api.b3.com", // Example URL, replace with actual B3 API URL
	}
}

// GetAssetPrice gets the current price of an asset
func (s *FinancialServiceAdapter) GetAssetPrice(ctx context.Context, symbol string) (float64, error) {
	// Determine which API to use based on symbol
	if isCryptoSymbol(symbol) {
		return s.getBinancePrice(ctx, symbol)
	}
	return s.getB3Price(ctx, symbol)
}

// GetMarketTrends gets current market trends
func (s *FinancialServiceAdapter) GetMarketTrends(ctx context.Context) ([]map[string]interface{}, error) {
	// Implementation would use both APIs to get comprehensive trends
	// This is a simplified placeholder implementation
	return []map[string]interface{}{
		{
			"sector":   "Technology",
			"trend":    "up",
			"growth":   5.7,
			"volume":   1000000,
			"confidence": 0.85,
		},
		{
			"sector":   "Finance",
			"trend":    "stable",
			"growth":   0.2,
			"volume":   2500000,
			"confidence": 0.92,
		},
	}, nil
}

// Helper functions
func (s *FinancialServiceAdapter) getBinancePrice(ctx context.Context, symbol string) (float64, error) {
	url := fmt.Sprintf("%s/api/v3/ticker/price?symbol=%s", s.binanceAPI, symbol)
	
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return 0, err
	}
	
	resp, err := s.httpClient.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("API error: %s", resp.Status)
	}
	
	var result struct {
		Symbol string `json:"symbol"`
		Price  string `json:"price"`
	}
	
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, err
	}
	
	price, err := strconv.ParseFloat(result.Price, 64)
	if err != nil {
		return 0, err
	}
	
	return price, nil
}

func (s *FinancialServiceAdapter) getB3Price(ctx context.Context, symbol string) (float64, error) {
	// This is a placeholder for B3 API integration
	// In a real implementation, this would call the B3 API
	
	// For now, return a mock price
	return 45.67, nil
}

func isCryptoSymbol(symbol string) bool {
	// Simple heuristic for determining if a symbol is crypto
	// In a real implementation, this would be more sophisticated
	cryptoSymbols := []string{
		"BTC", "ETH", "XRP", "LTC", "ADA", "DOT", "BNB", "LINK", "XLM", "DOGE",
	}
	
	for _, crypto := range cryptoSymbols {
		if symbol == crypto || symbol == crypto+"USDT" {
			return true
		}
	}
	
	return false
}

// Ensure FinancialServiceAdapter implements the FinancialDataService interface
var _ output.FinancialDataService = &FinancialServiceAdapter{}