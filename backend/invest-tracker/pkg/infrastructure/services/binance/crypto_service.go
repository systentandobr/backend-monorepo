package repository

import (
	"context"
	"time"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/entity"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/valueobject"
)

// CryptoDataService define a interface para serviços que coletam dados de criptomoedas
type CryptoDataService interface {
	// GetCryptocurrencies recupera informações sobre as principais criptomoedas
	GetCryptocurrencies(ctx context.Context) ([]*entity.Cryptocurrency, error)
	
	// GetCryptoBySymbol recupera informações sobre uma criptomoeda específica
	GetCryptoBySymbol(ctx context.Context, symbol string) (*entity.Cryptocurrency, error)
	
	// GetPriceHistory recupera o histórico de preços para uma criptomoeda
	GetPriceHistory(
		ctx context.Context,
		symbol string,
		timeframe valueobject.Timeframe,
		startDate, endDate *time.Time,
	) (valueobject.PriceHistory, error)
	
	// GetCurrentPrice recupera o preço atual de uma criptomoeda
	GetCurrentPrice(ctx context.Context, symbol string) (float64, error)
}

// PriceHistoryRepository define a interface para armazenar histórico de preços
type PriceHistoryRepository interface {
	// SavePriceHistory salva ou atualiza o histórico de preços de um ativo
	SavePriceHistory(ctx context.Context, priceHistory valueobject.PriceHistory) error
	
	// GetPriceHistory recupera o histórico de preços de um ativo
	GetPriceHistory(
		ctx context.Context,
		assetID string,
		timeframe valueobject.Timeframe,
		startDate, endDate *time.Time,
	) (valueobject.PriceHistory, error)
	
	// AppendPricePoints adiciona novos pontos de preço ao histórico
	AppendPricePoints(
		ctx context.Context,
		assetID string,
		timeframe valueobject.Timeframe,
		points []valueobject.PricePoint,
	) error
}

// DataCollectionJob define a interface para um job de coleta de dados
type DataCollectionJob interface {
	// Start inicia o job de coleta de dados
	Start() error
	
	// Stop para o job de coleta de dados
	Stop() error
	
	// IsRunning verifica se o job está em execução
	IsRunning() bool
	
	// CollectOnce executa uma coleta de dados imediata
	CollectOnce(ctx context.Context) error
	
	// SetSchedule configura o agendamento do job
	SetSchedule(cronExpression string) error
}