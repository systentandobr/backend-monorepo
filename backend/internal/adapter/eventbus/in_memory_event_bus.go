
// internal/adapter/eventbus/in_memory_event_bus.go
package eventbus

import (
	"context"
	"sync"
)

// Handler is a function that handles an event
type Handler func(ctx context.Context, payload interface{}) error

// InMemoryEventBus is an in-memory implementation of the EventBus interface
type InMemoryEventBus struct {
	subscribers map[string][]Handler
	mu          sync.RWMutex
}

// NewInMemoryEventBus creates a new InMemoryEventBus
func NewInMemoryEventBus() *InMemoryEventBus {
	return &InMemoryEventBus{
		subscribers: make(map[string][]Handler),
	}
}

// Publish publishes an event to all subscribers
func (eb *InMemoryEventBus) Publish(ctx context.Context, eventName string, payload interface{}) error {
	eb.mu.RLock()
	handlers, exists := eb.subscribers[eventName]
	eb.mu.RUnlock()
	
	if !exists {
		return nil
	}
	
	for _, handler := range handlers {
		// Run handlers concurrently
		go func(h Handler) {
			if err := h(ctx, payload); err != nil {
				// Log error
			}
		}(handler)
	}
	
	return nil
}

// Subscribe subscribes to an event
func (eb *InMemoryEventBus) Subscribe(eventName string, handler Handler) error {
	eb.mu.Lock()
	defer eb.mu.Unlock()
	
	if _, exists := eb.subscribers[eventName]; !exists {
		eb.subscribers[eventName] = []Handler{}
	}
	
	eb.subscribers[eventName] = append(eb.subscribers[eventName], handler)
	return nil
}

// Unsubscribe unsubscribes from an event
func (eb *InMemoryEventBus) Unsubscribe(eventName string, handler Handler) error {
	eb.mu.Lock()
	defer eb.mu.Unlock()
	
	if _, exists := eb.subscribers[eventName]; !exists {
		return nil
	}
	
	var newHandlers []Handler
	for _, h := range eb.subscribers[eventName] {
		if h != handler {
			newHandlers = append(newHandlers, h)
		}
	}
	
	eb.subscribers[eventName] = newHandlers
	return nil
}
