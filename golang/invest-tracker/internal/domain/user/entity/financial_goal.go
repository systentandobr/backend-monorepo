package entity

import (
	"time"
)

// FinancialGoal represents a user's financial goal
type FinancialGoal struct {
	ID            string    `json:"id" bson:"_id"`
	UserID        string    `json:"userId" bson:"user_id"`
	Name          string    `json:"name" bson:"name"`
	TargetAmount  float64   `json:"targetAmount" bson:"target_amount"`
	CurrentAmount float64   `json:"currentAmount" bson:"current_amount"`
	TargetDate    time.Time `json:"targetDate" bson:"target_date"`
	Priority      string    `json:"priority" bson:"priority"`
	CreatedAt     time.Time `json:"createdAt" bson:"created_at"`
	UpdatedAt     time.Time `json:"updatedAt" bson:"updated_at"`
}

// NewFinancialGoal creates a new financial goal instance
func NewFinancialGoal(userID, name string, targetAmount, currentAmount float64, targetDate time.Time, priority string) *FinancialGoal {
	return &FinancialGoal{
		UserID:        userID,
		Name:          name,
		TargetAmount:  targetAmount,
		CurrentAmount: currentAmount,
		TargetDate:    targetDate,
		Priority:      priority,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}
}
