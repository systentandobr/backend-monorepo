package mongodb

import (
	"context"
	"time"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/logger"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

type Client struct {
	client      *mongo.Client
	database    *mongo.Database
	logger      logger.Logger
	timeout     time.Duration
	collections map[string]*mongo.Collection
}

type ClientConfig struct {
	URI              string
	DatabaseName     string
	ConnectTimeout   time.Duration
	OperationTimeout time.Duration
}

func DefaultConfig() ClientConfig {
	return ClientConfig{
		URI:              "mongodb://localhost:27017",
		DatabaseName:     "invest_tracker",
		ConnectTimeout:   10 * time.Second,
		OperationTimeout: 5 * time.Second,
	}
}

func NewClient(config ClientConfig, log logger.Logger) (*Client, error) {
	clientOptions := options.Client().ApplyURI(config.URI)
	
	ctx, cancel := context.WithTimeout(context.Background(), config.ConnectTimeout)
	defer cancel()
	
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}
	
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		return nil, err
	}
	
	database := client.Database(config.DatabaseName)
	
	return &Client{
		client:      client,
		database:    database,
		logger:      log,
		timeout:     config.OperationTimeout,
		collections: make(map[string]*mongo.Collection),
	}, nil
}

func (c *Client) Collection(name string) *mongo.Collection {
	if col, ok := c.collections[name]; ok {
		return col
	}
	
	col := c.database.Collection(name)
	c.collections[name] = col
	return col
}

func (c *Client) Disconnect(ctx context.Context) error {
	return c.client.Disconnect(ctx)
}
