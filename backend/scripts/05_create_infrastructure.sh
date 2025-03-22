#!/bin/bash
# Creates infrastructure layer components
if [ $# -lt 1 ]; then echo "Usage: $0 <base_dir>"; exit 1; fi
BASE_DIR=$1

# MongoDB client
mkdir -p $BASE_DIR/pkg/infrastructure/database/mongodb
cat > $BASE_DIR/pkg/infrastructure/database/mongodb/client.go << 'EOT'
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
EOT

# HTTP Client
mkdir -p $BASE_DIR/pkg/infrastructure/http
cat > $BASE_DIR/pkg/infrastructure/http/client.go << 'EOT'
package http

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/errors"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/logger"
)

type Client struct {
	client  *http.Client
	baseURL string
	logger  logger.Logger
}

type ClientConfig struct {
	BaseURL        string
	Timeout        time.Duration
	DefaultHeaders map[string]string
}

func NewClient(config ClientConfig, log logger.Logger) *Client {
	return &Client{
		client:  &http.Client{Timeout: config.Timeout},
		baseURL: config.BaseURL,
		logger:  log,
	}
}

func (c *Client) Get(ctx context.Context, path string, result interface{}) error {
	url := c.baseURL + path
	
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	
	resp, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode >= 400 {
		return fmt.Errorf("server returned error: %d", resp.StatusCode)
	}
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response: %w", err)
	}
	
	if err := json.Unmarshal(body, result); err != nil {
		return fmt.Errorf("failed to unmarshal response: %w", err)
	}
	
	return nil
}
EOT

echo "Infrastructure layer created successfully"
