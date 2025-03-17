package eventbus

type InMemoryEventBus struct {}

func NewInMemoryEventBus() *InMemoryEventBus {
    return &InMemoryEventBus{}
}
