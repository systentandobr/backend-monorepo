package entity

import (
	"time"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/errors"
)

// Notification represents a system notification
type Notification struct {
	ID        string                 `json:"id" bson:"_id"`
	Title     string                 `json:"title" bson:"title"`
	Message   string                 `json:"message" bson:"message"`
	Type      string                 `json:"type" bson:"type"`
	Data      map[string]interface{} `json:"data" bson:"data"`
	Read      bool                   `json:"read" bson:"read"`
	CreatedAt time.Time              `json:"createdAt" bson:"created_at"`
	ReadAt    *time.Time             `json:"readAt,omitempty" bson:"read_at,omitempty"`
}

// Validate checks if the notification data is valid
func (n *Notification) Validate() error {
	if n.Title == "" {
		return errors.NewValidationError("title is required", nil, nil)
	}
	
	if n.Message == "" {
		return errors.NewValidationError("message is required", nil, nil)
	}
	
	return nil
}

// MarkAsRead marks the notification as read
func (n *Notification) MarkAsRead() {
	if !n.Read {
		n.Read = true
		now := time.Now()
		n.ReadAt = &now
	}
}

// NewNotification creates a new notification
func NewNotification(title, message, type_ string, data map[string]interface{}) *Notification {
	if data == nil {
		data = make(map[string]interface{})
	}
	
	return &Notification{
		ID:        generateID("notif"),
		Title:     title,
		Message:   message,
		Type:      type_,
		Data:      data,
		Read:      false,
		CreatedAt: time.Now(),
	}
}

// Helper function to generate a unique ID
func generateID(prefix string) string {
	timestamp := time.Now().Format("20060102150405")
	rand := randomString(6)
	return prefix + "-" + timestamp + "-" + rand
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
