// internal/domain/asset/valueobject/price_history.go
package valueobject

import (
	"time"
)

// Timeframe representa o intervalo de tempo para análise
type Timeframe string

const (
	TimeframeDaily   Timeframe = "daily"
	TimeframeWeekly  Timeframe = "weekly"
	TimeframeMonthly Timeframe = "monthly"
	TimeframeYearly  Timeframe = "yearly"
)

// PricePoint representa um ponto de preço em um momento específico
type PricePoint struct {
	Timestamp time.Time `json:"timestamp" bson:"timestamp"`
	Open      float64   `json:"open" bson:"open"`
	High      float64   `json:"high" bson:"high"`
	Low       float64   `json:"low" bson:"low"`
	Close     float64   `json:"close" bson:"close"`
	Volume    float64   `json:"volume" bson:"volume"`
}

// PriceHistory representa o histórico de preços de um ativo
type PriceHistory struct {
	AssetID     string      `json:"assetId" bson:"asset_id"`
	AssetSymbol string      `json:"assetSymbol" bson:"asset_symbol"`
	Timeframe   Timeframe   `json:"timeframe" bson:"timeframe"`
	Data        []PricePoint `json:"data" bson:"data"`
}

// NewPriceHistory cria uma nova instância de PriceHistory
func NewPriceHistory(assetID, assetSymbol string, timeframe Timeframe, data []PricePoint) PriceHistory {
	return PriceHistory{
		AssetID:     assetID,
		AssetSymbol: assetSymbol,
		Timeframe:   timeframe,
		Data:        data,
	}
}

// GetLatestPrice retorna o preço de fechamento mais recente
func (ph *PriceHistory) GetLatestPrice() (float64, error) {
	if len(ph.Data) == 0 {
		return 0, ErrNoDataAvailable
	}
	
	// Encontrar o ponto mais recente
	latestPoint := ph.Data[0]
	for _, point := range ph.Data {
		if point.Timestamp.After(latestPoint.Timestamp) {
			latestPoint = point
		}
	}
	
	return latestPoint.Close, nil
}

// GetPriceAt retorna o preço de fechamento mais próximo de uma data específica
func (ph *PriceHistory) GetPriceAt(date time.Time) (float64, error) {
	if len(ph.Data) == 0 {
		return 0, ErrNoDataAvailable
	}
	
	// Encontrar o ponto mais próximo da data especificada
	var closestPoint PricePoint
	var minDiff time.Duration = -1
	
	for _, point := range ph.Data {
		diff := date.Sub(point.Timestamp)
		if diff < 0 {
			diff = -diff
		}
		
		if minDiff == -1 || diff < minDiff {
			minDiff = diff
			closestPoint = point
		}
	}
	
	return closestPoint.Close, nil
}

// CalculateSimpleMovingAverage calcula a média móvel simples para um período específico
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

// CalculateExponentialMovingAverage calcula a média móvel exponencial para um período específico
func (ph *PriceHistory) CalculateExponentialMovingAverage(period int) ([]float64, error) {
	if len(ph.Data) < period {
		return nil, ErrInsufficientData
	}
	
	// Calcular SMA inicial
	sma := 0.0
	for i := 0; i < period; i++ {
		sma += ph.Data[i].Close
	}
	sma /= float64(period)
	
	// Calcular multiplicador
	multiplier := 2.0 / (float64(period) + 1.0)
	
	// Calcular EMA
	result := make([]float64, len(ph.Data)-period+1)
	result[0] = sma
	
	for i := 1; i < len(result); i++ {
		result[i] = (ph.Data[period+i-1].Close - result[i-1]) * multiplier + result[i-1]
	}
	
	return result, nil
}

// CalculateRelativeStrengthIndex calcula o RSI para um período específico
func (ph *PriceHistory) CalculateRelativeStrengthIndex(period int) ([]float64, error) {
	// Implementação do cálculo de RSI
	// ...
	// Retorna um slice com os valores de RSI
	return nil, nil
}

// Erros comuns
var (
	ErrNoDataAvailable = NewValueObjectError("no price data available")
	ErrInsufficientData = NewValueObjectError("insufficient data for calculation")
)

// ValueObjectError representa um erro relacionado a objetos de valor
type ValueObjectError struct {
	message string
}

func (e ValueObjectError) Error() string {
	return e.message
}

func NewValueObjectError(message string) ValueObjectError {
	return ValueObjectError{message: message}
}