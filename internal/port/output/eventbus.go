package output

import (
	"context"
)

type EventPublisher interface {
	Publish(ctx context.Context, eventName string, payload interface{}) error
}

type EventSubscriber interface {
	Subscribe(eventName string, handler func(ctx context.Context, payload interface{}) error) error
	Unsubscribe(eventName string, handler func(ctx context.Context, payload interface{}) error) error
}

type EventBus interface {
	EventPublisher
	EventSubscriber
}
