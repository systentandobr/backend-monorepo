// pkg/infrastructure/services/binance/client.go
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

	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/valueobject"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/errors"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/logger"
	httpClient "github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/infrastructure/http"
)

// BinanceClient é a implementação do cliente da API Binance
type BinanceClient struct {
	httpClient *httpClient.Client
	logger     logger.Logger
	apiKey     string
	apiSecret  string
	baseURL    string
}

// ClientConfig contém a configuração do cliente Binance
type ClientConfig struct {
	BaseURL   string
	ApiKey    string
	ApiSecret string
	Timeout   time.Duration
}

// DefaultConfig retorna a configuração padrão para o cliente Binance
func DefaultConfig() ClientConfig {
	return ClientConfig{
		BaseURL:   "https://api.binance.com",
		ApiKey:    "",
		ApiSecret: "",
		Timeout:   10 * time.Second,
	}
}

// NewClient cria uma nova instância do cliente Binance
func NewClient(config ClientConfig, log logger.Logger) (*BinanceClient, error) {
	if log == nil {
		logConfig := logger.DefaultConfig()
		var err error
		log, err = logger.New(logConfig)
		if err != nil {
			return nil, err
		}
	}

	httpConfig := httpClient.ClientConfig{
		BaseURL:   config.BaseURL,
		Timeout:   config.Timeout,
		DefaultHeaders: make(map[string]string),
	}
	
	if config.ApiKey != "" {
		httpConfig.DefaultHeaders["X-MBX-APIKEY"] = config.ApiKey
	}

	client := httpClient.NewClient(httpConfig, log)

	return &BinanceClient{
		httpClient: client,
		logger:     log,
		apiKey:     config.ApiKey,
		apiSecret:  config.apiSecret,
		baseURL:    config.BaseURL,
	}, nil
}

// GetCryptocurrencies busca todas as criptomoedas disponíveis
func (c *BinanceClient) GetCryptocurrencies(ctx context.Context) ([]*entity.Cryptocurrency, error) {
	var response []struct {
		Symbol             string `json:"symbol"`
		PriceChange        string `json:"priceChange"`
		PriceChangePercent string `json:"priceChangePercent"`
		LastPrice          string `json:"lastPrice"`
		Volume             string `json:"volume"`
		PrevClosePrice     string `json:"prevClosePrice"`
	}

	err := c.httpClient.Get(ctx, "/api/v3/ticker/24hr", &response)
	if err != nil {
		return nil, errors.NewExternalError("falha ao buscar criptomoedas", err)
	}

	cryptos := make([]*entity.Cryptocurrency, 0)
	for _, item := range response {
		// Filtrar apenas pares com USDT
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
			0, // MarketCap não disponível diretamente
			0, // CirculatingSupply não disponível diretamente
			nil, // MaxSupply não disponível diretamente
		)

		crypto.BaseAsset.PreviousClose = prevClosePrice
		crypto.BaseAsset.ChangePercentage = priceChangePercent
		crypto.BaseAsset.Volume = volume

		cryptos = append(cryptos, crypto)

		// Limitar a 20 criptomoedas para este exemplo
		if len(cryptos) >= 20 {
			break
		}
	}

	return cryptos, nil
}

// GetCryptoBySymbol busca uma criptomoeda pelo seu símbolo
func (c *BinanceClient) GetCryptoBySymbol(ctx context.Context, symbol string) (*entity.Cryptocurrency, error) {
	var ticker struct {
		Symbol             string `json:"symbol"`
		PriceChangePercent string `json:"priceChangePercent"`
		LastPrice          string `json:"lastPrice"`
		Volume             string `json:"volume"`
		PrevClosePrice     string `json:"prevClosePrice"`
	}

	pair := symbol + "USDT"
	err := c.httpClient.Get(ctx, fmt.Sprintf("/api/v3/ticker/24hr?symbol=%s", pair), &ticker)
	if err != nil {
		return nil, errors.NewExternalError(fmt.Sprintf("falha ao buscar criptomoeda %s", symbol), err)
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

// GetPriceHistory busca o histórico de preços para uma criptomoeda
func (c *BinanceClient) GetPriceHistory(
	ctx context.Context,
	symbol string,
	timeframe valueobject.Timeframe,
	startDate, endDate *time.Time,
) (valueobject.PriceHistory, error) {
	interval := mapTimeframeToInterval(timeframe)
	
	params := make(map[string]string)
	params["symbol"] = symbol + "USDT"
	params["interval"] = interval
	
	if startDate != nil {
		params["startTime"] = strconv.FormatInt(startDate.UnixMilli(), 10)
	}
	
	if endDate != nil {
		params["endTime"] = strconv.FormatInt(endDate.UnixMilli(), 10)
	}
	
	url := fmt.Sprintf("/api/v3/klines?%s", buildQueryString(params))
	
	var response [][]interface{}
	if err := c.httpClient.Get(ctx, url, &response); err != nil {
		return valueobject.PriceHistory{}, errors.NewExternalError(
			fmt.Sprintf("falha ao buscar histórico de preços para %s", symbol), err)
	}
	
	points := make([]valueobject.PricePoint, 0, len(response))
	for _, item := range response {
		if len(item) < 6 {
			continue
		}
		
		// O formato do kline da Binance é:
		// [0] Open time
		// [1] Open price
		// [2] High price
		// [3] Low price
		// [4] Close price
		// [5] Volume
		
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

// GetRecentTrades busca negociações recentes para um par de criptomoedas
func (c *BinanceClient) GetRecentTrades(ctx context.Context, symbol string, limit int) ([]map[string]interface{}, error) {
	if limit <= 0 {
		limit = 500 // Valor padrão da API
	}
	
	url := fmt.Sprintf("/api/v3/trades?symbol=%sUSDT&limit=%d", symbol, limit)
	
	var response []map[string]interface{}
	if err := c.httpClient.Get(ctx, url, &response); err != nil {
		return nil, errors.NewExternalError(
			fmt.Sprintf("falha ao buscar negociações recentes para %s", symbol), err)
	}
	
	return response, nil
}

// GetOrderBook busca o livro de ofertas para um par de criptomoedas
func (c *BinanceClient) GetOrderBook(ctx context.Context, symbol string, limit int) (map[string]interface{}, error) {
	if limit <= 0 {
		limit = 100 // Valor padrão da API
	}
	
	url := fmt.Sprintf("/api/v3/depth?symbol=%sUSDT&limit=%d", symbol, limit)
	
	var response map[string]interface{}
	if err := c.httpClient.Get(ctx, url, &response); err != nil {
		return nil, errors.NewExternalError(
			fmt.Sprintf("falha ao buscar livro de ofertas para %s", symbol), err)
	}
	
	return response, nil
}

// Funções auxiliares

// sign assina uma query com o API secret
func sign(queryString, secret string) string {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(queryString))
	return hex.EncodeToString(h.Sum(nil))
}

// mapTimeframeToInterval converte o timeframe do domínio para o formato da API Binance
func mapTimeframeToInterval(timeframe valueobject.Timeframe) string {
	switch timeframe {
	case valueobject.TimeframeDaily:
		return "1d"
	case valueobject.TimeframeWeekly:
		return "1w"
	case valueobject.TimeframeMonthly:
		return "1M"
	case valueobject.TimeframeYearly:
		return "1M" // Binance não tem intervalo anual, usamos mensal
	default:
		return "1d"
	}
}

// buildQueryString constrói uma query string a partir de um mapa de parâmetros
func buildQueryString(params map[string]string) string {
	if len(params) == 0 {
		return ""
	}
	
	var parts []string
	for key, value := range params {
		parts = append(parts, fmt.Sprintf("%s=%s", key, value))
	}
	
	return strings.Join(parts, "&")
}

// getCryptoName retorna o nome completo de uma criptomoeda pelo seu símbolo
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
		"LINK": "Chainlink",
		"UNI": "Uniswap",
		"LTC": "Litecoin",
		"ATOM": "Cosmos",
		"XLM": "Stellar",
		"ALGO": "Algorand",
		"NEAR": "Near Protocol",
		"FTM": "Fantom",
		"ONE": "Harmony",
		"MANA": "Decentraland",
	}
	
	if name, ok := names[symbol]; ok {
		return name
	}
	return symbol
}