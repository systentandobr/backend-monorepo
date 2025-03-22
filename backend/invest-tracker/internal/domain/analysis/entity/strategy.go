// internal/domain/analysis/entity/strategy.go
package entity

import (
	"time"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/entity"
)

// InvestmentStrategy representa os diferentes tipos de estratégias de investimento
type InvestmentStrategy string

const (
	StrategyValue           InvestmentStrategy = "value"           // Investimento em valor
	StrategyGrowth          InvestmentStrategy = "growth"          // Investimento em crescimento
	StrategyDividend        InvestmentStrategy = "dividend"        // Investimento em dividendos
	StrategyTrend           InvestmentStrategy = "trend"           // Análise de tendências
	StrategyMomentum        InvestmentStrategy = "momentum"        // Análise de momentum
	StrategyDCA             InvestmentStrategy = "dca"             // Dollar-cost averaging
	StrategySwingTrading    InvestmentStrategy = "swing"           // Swing trading
	StrategyDiversification InvestmentStrategy = "diversification" // Diversificação
)

// OpportunityType representa os diferentes tipos de oportunidades
type OpportunityType string

const (
	OpportunityBuy  OpportunityType = "buy"  // Oportunidade de compra
	OpportunitySell OpportunityType = "sell" // Oportunidade de venda
	OpportunityHold OpportunityType = "hold" // Manter posição
)

// RiskLevel representa os diferentes níveis de risco
type RiskLevel string

const (
	RiskLow    RiskLevel = "low"    // Baixo risco
	RiskMedium RiskLevel = "medium" // Médio risco
	RiskHigh   RiskLevel = "high"   // Alto risco
)

// InvestmentOpportunity representa uma oportunidade de investimento identificada
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

// NewInvestmentOpportunity cria uma nova instância de InvestmentOpportunity
func NewInvestmentOpportunity(
	asset entity.Asset,
	opportunityType OpportunityType,
	reason string,
	potentialReturn float64,
	riskLevel RiskLevel,
	strategy InvestmentStrategy,
) *InvestmentOpportunity {
	now := time.Now()
	
	// Oportunidades expiram em 7 dias por padrão
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

// IsExpired verifica se a oportunidade está expirada
func (o *InvestmentOpportunity) IsExpired() bool {
	if o.Expired {
		return true
	}
	
	// Verificar se a data de expiração já passou
	if time.Now().After(o.ExpiresAt) {
		o.Expired = true
		return true
	}
	
	return false
}

// MarkAsExpired marca a oportunidade como expirada
func (o *InvestmentOpportunity) MarkAsExpired() {
	o.Expired = true
}

// Helper function to generate a unique ID with a prefix
func generateID(prefix string) string {
	timestamp := time.Now().UnixNano()
	return prefix + "-" + time.Now().Format("20060102150405") + "-" + randomString(6)
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