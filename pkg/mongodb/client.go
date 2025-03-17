// pkg/mongodb/client.go
package mongodb

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

// Client wraps the MongoDB client
type Client struct {
	client *mongo.Client
}

// NewClient creates a new MongoDB client
func NewClient(uri string) (*Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	// Ping the database to verify connection
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		return nil, err
	}

	return &Client{
		client: client,
	}, nil
}

// Database returns a database with the given name
func (c *Client) Database(name string) *mongo.Database {
	return c.client.Database(name)
}

// Close closes the connection to MongoDB
func (c *Client) Close(ctx context.Context) error {
	return c.client.Disconnect(ctx)
}

// internal/adapter/repository/mongo_repository.go
package repository

import (
	"context"
	"errors"
	"reflect"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// MongoRepository is a generic MongoDB repository
type MongoRepository[T any] struct {
	collection *mongo.Collection
	idField    string
}

// NewMongoRepository creates a new MongoRepository
func NewMongoRepository[T any](db *mongo.Database, collectionName string) *MongoRepository[T] {
	return &MongoRepository[T]{
		collection: db.Collection(collectionName),
		idField:    "id", // Default ID field
	}
}

// WithIDField sets the ID field name
func (r *MongoRepository[T]) WithIDField(fieldName string) *MongoRepository[T] {
	r.idField = fieldName
	return r
}

// FindByID finds an entity by ID
func (r *MongoRepository[T]) FindByID(ctx context.Context, id string) (T, error) {
	var entity T
	filter := bson.M{r.idField: id}
	
	err := r.collection.FindOne(ctx, filter).Decode(&entity)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			var zero T
			return zero, errors.New("entity not found")
		}
		return entity, err
	}
	
	return entity, nil
}

// FindAll finds all entities matching the filter
func (r *MongoRepository[T]) FindAll(ctx context.Context, filter map[string]interface{}) ([]T, error) {
	var entities []T
	
	// Convert map to bson.M
	bsonFilter := bson.M{}
	for k, v := range filter {
		bsonFilter[k] = v
	}
	
	cursor, err := r.collection.Find(ctx, bsonFilter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	
	if err := cursor.All(ctx, &entities); err != nil {
		return nil, err
	}
	
	return entities, nil
}

// Save saves an entity
func (r *MongoRepository[T]) Save(ctx context.Context, entity T) error {
	_, err := r.collection.InsertOne(ctx, entity)
	return err
}

// Update updates an entity
func (r *MongoRepository[T]) Update(ctx context.Context, entity T) error {
	// Get ID using reflection
	val := reflect.ValueOf(entity)
	if val.Kind() == reflect.Ptr {
		val = val.Elem()
	}
	
	idField := val.FieldByNameFunc(func(fieldName string) bool {
		field, _ := val.Type().FieldByName(fieldName)
		jsonTag := field.Tag.Get("json")
		return jsonTag == r.idField || fieldName == "ID"
	})
	
	if !idField.IsValid() {
		return errors.New("ID field not found")
	}
	
	id := idField.String()
	filter := bson.M{r.idField: id}
	
	// Update the entity
	_, err := r.collection.ReplaceOne(ctx, filter, entity)
	return err
}

// Delete deletes an entity by ID
func (r *MongoRepository[T]) Delete(ctx context.Context, id string) error {
	filter := bson.M{r.idField: id}
	_, err := r.collection.DeleteOne(ctx, filter)
	return err
}

// Count counts entities matching the filter
func (r *MongoRepository[T]) Count(ctx context.Context, filter map[string]interface{}) (int64, error) {
	// Convert map to bson.M
	bsonFilter := bson.M{}
	for k, v := range filter {
		bsonFilter[k] = v
	}
	
	return r.collection.CountDocuments(ctx, bsonFilter)
}

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

// internal/adapter/service/financial_service.go
package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"
	
	"github.com/yourusername/lifetracker/internal/port/output"
)

// FinancialServiceAdapter implements the FinancialDataService interface
type FinancialServiceAdapter struct {
	httpClient *http.Client
	binanceAPI string
	b3API      string
}

// NewFinancialServiceAdapter creates a new FinancialServiceAdapter
func NewFinancialServiceAdapter() *FinancialServiceAdapter {
	return &FinancialServiceAdapter{
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		binanceAPI: "https://api.binance.com",
		b3API:      "https://api.b3.com", // Example URL, replace with actual B3 API URL
	}
}

// GetAssetPrice gets the current price of an asset
func (s *FinancialServiceAdapter) GetAssetPrice(ctx context.Context, symbol string) (float64, error) {
	// Determine which API to use based on symbol
	if isCryptoSymbol(symbol) {
		return s.getBinancePrice(ctx, symbol)
	}
	return s.getB3Price(ctx, symbol)
}

// GetMarketTrends gets current market trends
func (s *FinancialServiceAdapter) GetMarketTrends(ctx context.Context) ([]map[string]interface{}, error) {
	// Implementation would use both APIs to get comprehensive trends
	// This is a simplified placeholder implementation
	return []map[string]interface{}{
		{
			"sector":   "Technology",
			"trend":    "up",
			"growth":   5.7,
			"volume":   1000000,
			"confidence": 0.85,
		},
		{
			"sector":   "Finance",
			"trend":    "stable",
			"growth":   0.2,
			"volume":   2500000,
			"confidence": 0.92,
		},
	}, nil
}

// Helper functions
func (s *FinancialServiceAdapter) getBinancePrice(ctx context.Context, symbol string) (float64, error) {
	url := fmt.Sprintf("%s/api/v3/ticker/price?symbol=%s", s.binanceAPI, symbol)
	
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return 0, err
	}
	
	resp, err := s.httpClient.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("API error: %s", resp.Status)
	}
	
	var result struct {
		Symbol string `json:"symbol"`
		Price  string `json:"price"`
	}
	
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, err
	}
	
	price, err := strconv.ParseFloat(result.Price, 64)
	if err != nil {
		return 0, err
	}
	
	return price, nil
}

func (s *FinancialServiceAdapter) getB3Price(ctx context.Context, symbol string) (float64, error) {
	// This is a placeholder for B3 API integration
	// In a real implementation, this would call the B3 API
	
	// For now, return a mock price
	return 45.67, nil
}

func isCryptoSymbol(symbol string) bool {
	// Simple heuristic for determining if a symbol is crypto
	// In a real implementation, this would be more sophisticated
	cryptoSymbols := []string{
		"BTC", "ETH", "XRP", "LTC", "ADA", "DOT", "BNB", "LINK", "XLM", "DOGE",
	}
	
	for _, crypto := range cryptoSymbols {
		if symbol == crypto || symbol == crypto+"USDT" {
			return true
		}
	}
	
	return false
}

// Ensure FinancialServiceAdapter implements the FinancialDataService interface
var _ output.FinancialDataService = &FinancialServiceAdapter{}