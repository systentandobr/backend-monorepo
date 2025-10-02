package entity

import (
	"time"
	assetEntity "github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/domain/asset/entity"
)

// OpportunityStatus represents the status of an investment opportunity
type OpportunityStatus string

const (
	OpportunityStatusActive  OpportunityStatus = "active"
	OpportunityStatusExpired OpportunityStatus = "expired"
	OpportunityStatusClosed  OpportunityStatus = "closed"
)

// Using RiskLevel from strategy.go

// Opportunity represents an investment opportunity
type Opportunity struct {
	ID          string            `json:"id" bson:"_id,omitempty"`
	Asset       assetEntity.Asset `json:"asset" bson:"asset"`
	Title       string            `json:"title" bson:"title"`
	Description string            `json:"description" bson:"description"`
	Status      OpportunityStatus `json:"status" bson:"status"`
	RiskLevel   RiskLevel         `json:"risk_level" bson:"risk_level"`
	ExpectedReturn float64        `json:"expected_return" bson:"expected_return"`
	Confidence   float64          `json:"confidence" bson:"confidence"`
	CreatedAt   time.Time         `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at" bson:"updated_at"`
	ExpiresAt   *time.Time        `json:"expires_at,omitempty" bson:"expires_at,omitempty"`
	Tags        []string          `json:"tags" bson:"tags"`
	Metadata    map[string]interface{} `json:"metadata,omitempty" bson:"metadata,omitempty"`
}

// IsActive checks if the opportunity is currently active
func (o *Opportunity) IsActive() bool {
	return o.Status == OpportunityStatusActive
}

// IsExpired checks if the opportunity has expired
func (o *Opportunity) IsExpired() bool {
	if o.ExpiresAt == nil {
		return false
	}
	return time.Now().After(*o.ExpiresAt)
}

// GetID returns the opportunity ID
func (o *Opportunity) GetID() string {
	return o.ID
}

// SetID sets the opportunity ID
func (o *Opportunity) SetID(id string) {
	o.ID = id
}

// MarkAsExpired marks the opportunity as expired
func (o *Opportunity) MarkAsExpired() {
	o.Status = OpportunityStatusExpired
	o.UpdatedAt = time.Now()
}

// MarkAsClosed marks the opportunity as closed
func (o *Opportunity) MarkAsClosed() {
	o.Status = OpportunityStatusClosed
	o.UpdatedAt = time.Now()
}
