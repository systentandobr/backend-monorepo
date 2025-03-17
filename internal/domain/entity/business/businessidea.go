package business

import (
	"time"
	"errors"
)

// BusinessIdea represents a businessidea in the system
type BusinessIdea struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	Title string `json:"title"`
	Description string `json:"description"`
	InitialInvestment float64 `json:"initialInvestment"`
	MarketSize float64 `json:"marketSize"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// NewBusinessIdea creates a new BusinessIdea instance
func NewBusinessIdea(userID string, title string, description string) (BusinessIdea, error) {
	// Validation
	if title == "" {
		return BusinessIdea{}, errors.New("title is required")
	}
	if description == "" {
		return BusinessIdea{}, errors.New("description is required")
	}

	now := time.Now()
	
	return BusinessIdea{
		ID:        generateID(),
		UserID:    userID,
		Title: title,
		Description: description,
		InitialInvestment: initialInvestment,
		MarketSize: marketSize,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
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