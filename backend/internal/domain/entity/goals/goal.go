package goals

import (
	"errors"
	"time"
)

type Goal struct {
	ID          string    `json:"id"`
	UserID      string    `json:"userId"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	Target      Target    `json:"target"`
	Deadline    time.Time `json:"deadline"`
	Progress    float64   `json:"progress"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	CompletedAt *time.Time `json:"completedAt,omitempty"`
}

type Target struct {
	Type       string      `json:"type"`
	Value      interface{} `json:"value"`
	MetricUnit string      `json:"metricUnit,omitempty"`
}

func NewGoal(userID, title, description, category string, target Target, deadline time.Time) (Goal, error) {
	if title == "" {
		return Goal{}, errors.New("goal title cannot be empty")
	}
	
	if deadline.Before(time.Now()) {
		return Goal{}, errors.New("deadline must be in the future")
	}
	
	now := time.Now()
	
	return Goal{
		ID:          generateID(),
		UserID:      userID,
		Title:       title,
		Description: description,
		Category:    category,
		Target:      target,
		Deadline:    deadline,
		Progress:    0,
		Status:      "active",
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

func (g *Goal) UpdateProgress(progress float64) error {
	if progress < 0 || progress > 100 {
		return errors.New("progress must be between 0 and 100")
	}
	
	g.Progress = progress
	g.UpdatedAt = time.Now()
	
	if progress >= 100 && g.Status != "completed" {
		g.Complete()
	}
	
	return nil
}

func (g *Goal) Complete() {
	now := time.Now()
	g.Status = "completed"
	g.Progress = 100
	g.CompletedAt = &now
	g.UpdatedAt = now
}

func (g *Goal) IsCompleted() bool {
	return g.Status == "completed"
}

func (g *Goal) DaysRemaining() int {
	if g.IsCompleted() {
		return 0
	}
	
	now := time.Now()
	if g.Deadline.Before(now) {
		return 0
	}
	
	return int(g.Deadline.Sub(now).Hours() / 24)
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
