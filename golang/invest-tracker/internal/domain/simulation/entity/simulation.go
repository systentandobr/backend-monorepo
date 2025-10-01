// internal/domain/simulation/entity/simulation.go
package entity

import (
	"math"
	"time"

	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/domain/analysis/entity"
	assetEntity "github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/domain/asset/entity"
)

// SimulationStatus representa o status da simulação
type SimulationStatus string

const (
	SimulationPending  SimulationStatus = "pending"  // Simulação pendente
	SimulationRunning  SimulationStatus = "running"  // Simulação em execução
	SimulationComplete SimulationStatus = "complete" // Simulação concluída
	SimulationFailed   SimulationStatus = "failed"   // Simulação falhou
)

// Simulation representa uma simulação de investimento
type Simulation struct {
	ID              string                    `json:"id" bson:"_id"`
	Name            string                    `json:"name" bson:"name"`
	Asset           assetEntity.Asset         `json:"asset" bson:"asset"`
	Strategy        entity.InvestmentStrategy `json:"strategy" bson:"strategy"`
	InitialAmount   float64                   `json:"initialAmount" bson:"initial_amount"`
	EntryPrice      float64                   `json:"entryPrice" bson:"entry_price"`
	TargetPrice     float64                   `json:"targetPrice" bson:"target_price"`
	StopLoss        *float64                  `json:"stopLoss,omitempty" bson:"stop_loss,omitempty"`
	TimeHorizon     int                       `json:"timeHorizon" bson:"time_horizon"` // Em dias
	Scenarios       []float64                 `json:"scenarios" bson:"scenarios"`      // Variações percentuais
	Results         []*SimulationResult       `json:"results" bson:"results"`
	Status          SimulationStatus          `json:"status" bson:"status"`
	ErrorMessage    string                    `json:"errorMessage,omitempty" bson:"error_message,omitempty"`
	CreatedAt       time.Time                 `json:"createdAt" bson:"created_at"`
	CompletedAt     *time.Time                `json:"completedAt,omitempty" bson:"completed_at,omitempty"`
}

// SimulationResult representa o resultado de um cenário na simulação
type SimulationResult struct {
	ScenarioChange float64 `json:"scenarioChange" bson:"scenario_change"` // Percentual
	FinalAmount    float64 `json:"finalAmount" bson:"final_amount"`
	FinalPrice     float64 `json:"finalPrice" bson:"final_price"`
	ProfitLoss     float64 `json:"profitLoss" bson:"profit_loss"`
	ProfitLossPerc float64 `json:"profitLossPerc" bson:"profit_loss_perc"`
	AnnualizedROI  float64 `json:"annualizedROI" bson:"annualized_roi"`
}

// NewSimulation cria uma nova simulação
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

// AddResult adiciona um resultado de cenário à simulação
func (s *Simulation) AddResult(change, finalAmount, finalPrice float64) {
	profitLoss := finalAmount - s.InitialAmount
	profitLossPerc := (profitLoss / s.InitialAmount) * 100
	
	// Calcular ROI anualizado
	years := float64(s.TimeHorizon) / 365.0
	if years <= 0 {
		years = 1.0 / 365.0 // Mínimo de 1 dia
	}
	
	// Fórmula para ROI anualizado: (1 + ROI total)^(1/anos) - 1
	// Usando math.Pow para exponenciação
	annualizedROI := math.Pow(finalAmount/s.InitialAmount, 1/years) - 1
	
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

// Start inicia a simulação
func (s *Simulation) Start() {
	s.Status = SimulationRunning
}

// Complete marca a simulação como concluída
func (s *Simulation) Complete() {
	s.Status = SimulationComplete
	now := time.Now()
	s.CompletedAt = &now
}

// Fail marca a simulação como falha
func (s *Simulation) Fail(errorMessage string) {
	s.Status = SimulationFailed
	s.ErrorMessage = errorMessage
}

// TradeType representa o tipo de operação
type TradeType string

const (
	TradeBuy  TradeType = "buy"  // Compra
	TradeSell TradeType = "sell" // Venda
)

// Trade representa uma operação de compra ou venda
type Trade struct {
	Type                 TradeType `json:"type" bson:"type"`
	Price                float64   `json:"price" bson:"price"`
	Units                float64   `json:"units" bson:"units"`
	Value                float64   `json:"value" bson:"value"`
	Date                 time.Time `json:"date" bson:"date"`
	ProfitLoss           float64   `json:"profitLoss" bson:"profit_loss"`
	ProfitLossPercentage float64   `json:"profitLossPercentage" bson:"profit_loss_percentage"`
	DaysHeld             int       `json:"daysHeld" bson:"days_held"`
	Reason               string    `json:"reason" bson:"reason"`
}

// BacktestStatistics contém estatísticas de backtesting
type BacktestStatistics struct {
	TotalTrades          int     `json:"totalTrades" bson:"total_trades"`
	WinningTrades        int     `json:"winningTrades" bson:"winning_trades"`
	LosingTrades         int     `json:"losingTrades" bson:"losing_trades"`
	WinRate              float64 `json:"winRate" bson:"win_rate"`
	TotalProfit          float64 `json:"totalProfit" bson:"total_profit"`
	ProfitLossPercentage float64 `json:"profitLossPercentage" bson:"profit_loss_percentage"`
	BiggestWin           float64 `json:"biggestWin" bson:"biggest_win"`
	BiggestLoss          float64 `json:"biggestLoss" bson:"biggest_loss"`
	MaxDrawdown          float64 `json:"maxDrawdown" bson:"max_drawdown"`
	FinalValue           float64 `json:"finalValue" bson:"final_value"`
}

// BacktestResult contém o resultado completo de um backtesting
type BacktestResult struct {
	Asset             assetEntity.Asset         `json:"asset" bson:"asset"`
	Strategy          entity.InvestmentStrategy `json:"strategy" bson:"strategy"`
	StrategyName      string                    `json:"strategyName" bson:"strategy_name"`
	InitialInvestment float64                   `json:"initialInvestment" bson:"initial_investment"`
	StartDate         time.Time                 `json:"startDate" bson:"start_date"`
	EndDate           time.Time                 `json:"endDate" bson:"end_date"`
	Trades            []Trade                   `json:"trades" bson:"trades"`
	Statistics        BacktestStatistics        `json:"statistics" bson:"statistics"`
}

// Helper para gerar strings aleatórias
func randomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
		time.Sleep(1 * time.Nanosecond)
	}
	return string(b)
}