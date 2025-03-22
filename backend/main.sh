#!/bin/bash
# Master setup script that runs all setup scripts in order

# Colors for output formatting
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="invest-tracker"
IMPORT_PATH="github.com/systentandobr/life-tracker/backend/invest-tracker"
SCRIPTS_DIR="scripts"

# Make sure scripts directory exists
mkdir -p $SCRIPTS_DIR

echo -e "${BLUE}Investment Tracker Setup${NC}"
echo "This script will create a complete project structure for the Investment Tracker application."

# Check if project directory already exists
if [ -d "$PROJECT_DIR" ]; then
  echo -e "${YELLOW}Warning: Directory '$PROJECT_DIR' already exists${NC}"
  read -p "Do you want to continue and potentially overwrite files? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Setup aborted${NC}"
    exit 1
  fi
fi

# Create the scripts directory
echo -e "${BLUE}Setting up project scripts...${NC}"
mkdir -p $SCRIPTS_DIR

# Create structure setup script
cat > $SCRIPTS_DIR/01_create_structure.sh << 'EOF'
#!/bin/bash
# Creates directory structure for the project
if [ $# -lt 1 ]; then echo "Usage: $0 <base_dir>"; exit 1; fi
BASE_DIR=$1
echo "Creating directory structure in: $BASE_DIR"

mkdir -p $BASE_DIR/cmd/{api,jobs,templates}
mkdir -p $BASE_DIR/pkg/{common/{errors,logger,utils},infrastructure/{database/{mongodb,redis},http,messaging/{kafka,rabbitmq},services/{b3,binance,notifications}}}
mkdir -p $BASE_DIR/internal/domain/{asset/{entity,repository,service,valueobject},analysis/{entity,repository,service,strategy},simulation/{entity,repository,service},notification/{entity,repository,service},user/{entity,repository,service}}
mkdir -p $BASE_DIR/internal/{application/{asset,analysis,simulation,notification,user},ports/{input,output},adapter/{controller,presenter,persistence,external}}
mkdir -p $BASE_DIR/web/{src/{components,pages,hooks,store},public}
mkdir -p $BASE_DIR/deploy/{docker/{api,job-collector,job-analyzer},kubernetes}
mkdir -p $BASE_DIR/test $BASE_DIR/docs
echo "Directory structure created successfully"
EOF
chmod +x $SCRIPTS_DIR/01_create_structure.sh

# Create config files setup script
cat > $SCRIPTS_DIR/02_create_config_files.sh << 'EOF'
#!/bin/bash
# Creates configuration files for the project
if [ $# -lt 2 ]; then echo "Usage: $0 <base_dir> <import_path>"; exit 1; fi
BASE_DIR=$1
IMPORT_PATH=$2

# go.mod
cat > $BASE_DIR/go.mod << EOT
module $IMPORT_PATH

go 1.21

require (
	go.mongodb.org/mongo-driver v1.12.1
	go.uber.org/zap v1.26.0
)
EOT

# Makefile
cat > $BASE_DIR/Makefile << 'EOT'
.PHONY: build run test clean generate

# Variables
GO_BUILD_FLAGS=-ldflags="-s -w" -trimpath
SERVICE_NAMES=api data-collector analyzer simulator notifier

# Main commands
build: clean generate
	@echo "Building all services..."
	@for service in $(SERVICE_NAMES); do \
		echo "Building $$service..."; \
		go build $(GO_BUILD_FLAGS) -o bin/$$service ./cmd/$$service; \
	done

run:
	@echo "Starting services locally..."
	@docker-compose up -d

test:
	@echo "Running tests..."
	@go test -v ./...

clean:
	@echo "Cleaning up..."
	@rm -rf bin/
	@mkdir -p bin/

generate:
	@echo "Generating code..."
	@go generate ./...
EOT

# .gitignore
cat > $BASE_DIR/.gitignore << 'EOT'
# Binaries
/bin/
*.exe
*.dll
*.so
*.dylib

# Test binary
*.test

# Output of go coverage tool
*.out

# Dependency directories
vendor/

# Environment variables
.env
.env.*
!.env.example

# IDE files
.idea/
.vscode/
*.swp
*.swo

# Logs
*.log

# Build directories
/dist/
/build/
/web/build/
EOT

# README.md
cat > $BASE_DIR/README.md << 'EOT'
# Investment Tracker

A system that monitors, analyzes, and simulates investments across various asset types.

## Features

- Data collection from financial APIs
- Asset fundamental analysis
- Investment opportunity detection
- Portfolio simulation
- Real-time notifications

## Architecture

This project follows Clean Architecture principles and SOLID design:

- **Domain Layer**: Core business entities and rules
- **Application Layer**: Use cases and business logic
- **Adapter Layer**: Implementation of interfaces
- **Infrastructure Layer**: External services integration

## Getting Started

```bash
# Build the services
make build

# Run with Docker
make run

# Run tests
make test
```
EOT

# docker-compose.yml
cat > $BASE_DIR/docker-compose.yml << 'EOT'
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: deploy/docker/api/Dockerfile
    ports:
      - "8080:8080"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017
      - MONGODB_DATABASE=invest_tracker
    depends_on:
      - mongodb
    restart: unless-stopped

  data-collector:
    build:
      context: .
      dockerfile: deploy/docker/job-collector/Dockerfile
    environment:
      - MONGODB_URI=mongodb://mongodb:27017
      - MONGODB_DATABASE=invest_tracker
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
EOT

echo "Configuration files created successfully"
EOF
chmod +x $SCRIPTS_DIR/02_create_config_files.sh

# Common packages setup script
cat > $SCRIPTS_DIR/03_create_common_packages.sh << 'EOF'
#!/bin/bash
# Creates common utility packages
if [ $# -lt 1 ]; then echo "Usage: $0 <base_dir>"; exit 1; fi
BASE_DIR=$1

# Create errors package
mkdir -p $BASE_DIR/pkg/common/errors
cat > $BASE_DIR/pkg/common/errors/errors.go << 'EOT'
package errors

import (
	"errors"
	"fmt"
)

type ErrorType string

const (
	TypeValidation   ErrorType = "VALIDATION"
	TypeNotFound     ErrorType = "NOT_FOUND"
	TypeDuplicated   ErrorType = "DUPLICATED"
	TypeUnauthorized ErrorType = "UNAUTHORIZED"
	TypeForbidden    ErrorType = "FORBIDDEN"
	TypeInternal     ErrorType = "INTERNAL"
	TypeExternal     ErrorType = "EXTERNAL"
)

type AppError struct {
	Type       ErrorType
	Message    string
	Details    map[string]interface{}
	StatusCode int
	OrigErr    error
}

func (e *AppError) Error() string {
	if e.OrigErr != nil {
		return fmt.Sprintf("%s: %s [%s]", e.Type, e.Message, e.OrigErr.Error())
	}
	return fmt.Sprintf("%s: %s", e.Type, e.Message)
}

func (e *AppError) Unwrap() error { return e.OrigErr }

func NewValidationError(message string, details map[string]interface{}, origErr error) *AppError {
	return &AppError{Type: TypeValidation, Message: message, Details: details, StatusCode: 400, OrigErr: origErr}
}

func NewNotFoundError(message string, origErr error) *AppError {
	return &AppError{Type: TypeNotFound, Message: message, StatusCode: 404, OrigErr: origErr}
}

func NewInternalError(message string, origErr error) *AppError {
	return &AppError{Type: TypeInternal, Message: message, StatusCode: 500, OrigErr: origErr}
}

func IsNotFoundError(err error) bool {
	var appErr *AppError
	return errors.As(err, &appErr) && appErr.Type == TypeNotFound
}
EOT

# Create logger package
mkdir -p $BASE_DIR/pkg/common/logger
cat > $BASE_DIR/pkg/common/logger/logger.go << 'EOT'
package logger

import (
	"context"
	"io"
	"os"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type Logger interface {
	Debug(msg string, fields ...Field)
	Info(msg string, fields ...Field)
	Warn(msg string, fields ...Field)
	Error(msg string, fields ...Field)
	Fatal(msg string, fields ...Field)
	With(fields ...Field) Logger
	WithContext(ctx context.Context) Logger
}

type Field struct {
	Key   string
	Value interface{}
}

type Config struct {
	Level      string
	Format     string
	Output     io.Writer
	TimeFormat string
}

func DefaultConfig() Config {
	return Config{
		Level:      "info",
		Format:     "json",
		Output:     os.Stdout,
		TimeFormat: time.RFC3339,
	}
}

// Implementation
type zapLogger struct {
	logger *zap.Logger
}

func New(config Config) (Logger, error) {
	var level zapcore.Level
	switch config.Level {
	case "debug":
		level = zapcore.DebugLevel
	case "info":
		level = zapcore.InfoLevel
	case "warn":
		level = zapcore.WarnLevel
	case "error":
		level = zapcore.ErrorLevel
	case "fatal":
		level = zapcore.FatalLevel
	default:
		level = zapcore.InfoLevel
	}

	encoderConfig := zapcore.EncoderConfig{
		TimeKey:        "time",
		LevelKey:       "level",
		NameKey:        "logger",
		CallerKey:      "caller",
		MessageKey:     "msg",
		StacktraceKey:  "stacktrace",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.LowercaseLevelEncoder,
		EncodeTime:     zapcore.TimeEncoder(func(t time.Time, enc zapcore.PrimitiveArrayEncoder) { enc.AppendString(t.Format(config.TimeFormat)) }),
		EncodeDuration: zapcore.SecondsDurationEncoder,
		EncodeCaller:   zapcore.ShortCallerEncoder,
	}

	var encoder zapcore.Encoder
	if config.Format == "json" {
		encoder = zapcore.NewJSONEncoder(encoderConfig)
	} else {
		encoder = zapcore.NewConsoleEncoder(encoderConfig)
	}

	writeSyncer := zapcore.AddSync(config.Output)
	core := zapcore.NewCore(encoder, writeSyncer, level)
	zapLogger := zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))

	return &zapLogger{logger: zapLogger}, nil
}

func (l *zapLogger) Debug(msg string, fields ...Field) { l.logger.Debug(msg, fieldsToZapFields(fields)...) }
func (l *zapLogger) Info(msg string, fields ...Field)  { l.logger.Info(msg, fieldsToZapFields(fields)...) }
func (l *zapLogger) Warn(msg string, fields ...Field)  { l.logger.Warn(msg, fieldsToZapFields(fields)...) }
func (l *zapLogger) Error(msg string, fields ...Field) { l.logger.Error(msg, fieldsToZapFields(fields)...) }
func (l *zapLogger) Fatal(msg string, fields ...Field) { l.logger.Fatal(msg, fieldsToZapFields(fields)...) }

func (l *zapLogger) With(fields ...Field) Logger {
	return &zapLogger{logger: l.logger.With(fieldsToZapFields(fields)...)}
}

func (l *zapLogger) WithContext(ctx context.Context) Logger {
	return l
}

func fieldsToZapFields(fields []Field) []zap.Field {
	zapFields := make([]zap.Field, 0, len(fields))
	for _, field := range fields {
		zapFields = append(zapFields, zap.Any(field.Key, field.Value))
	}
	return zapFields
}

// Helper functions
func String(key string, value string) Field       { return Field{Key: key, Value: value} }
func Int(key string, value int) Field             { return Field{Key: key, Value: value} }
func Float64(key string, value float64) Field     { return Field{Key: key, Value: value} }
func Error(err error) Field                       { return Field{Key: "error", Value: err.Error()} }
func Any(key string, value interface{}) Field     { return Field{Key: key, Value: value} }
EOT

# Create date utils package
mkdir -p $BASE_DIR/pkg/common/utils
cat > $BASE_DIR/pkg/common/utils/date.go << 'EOT'
package utils

import "time"

type DateRange struct {
	Start time.Time
	End   time.Time
}

func NewDateRange(start, end time.Time) DateRange {
	return DateRange{Start: start, End: end}
}

func (dr DateRange) DaysInRange() int {
	return int(dr.End.Sub(dr.Start).Hours() / 24)
}

func (dr DateRange) Contains(date time.Time) bool {
	return (date.Equal(dr.Start) || date.After(dr.Start)) && 
		   (date.Equal(dr.End) || date.Before(dr.End))
}

func LastNDays(n int) DateRange {
	end := time.Now()
	start := end.AddDate(0, 0, -n)
	return DateRange{Start: start, End: end}
}

func LastNMonths(n int) DateRange {
	end := time.Now()
	start := end.AddDate(0, -n, 0)
	return DateRange{Start: start, End: end}
}

func StartOfDay(date time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
}

func EndOfDay(date time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), 23, 59, 59, 999999999, date.Location())
}
EOT

echo "Common packages created successfully"
EOF
chmod +x $SCRIPTS_DIR/03_create_common_packages.sh

# Domain layer setup script
cat > $SCRIPTS_DIR/04_create_domain_layer.sh << 'EOF'
#!/bin/bash
# Creates domain layer entities and repositories
if [ $# -lt 1 ]; then echo "Usage: $0 <base_dir>"; exit 1; fi
BASE_DIR=$1

# Basic asset entity
mkdir -p $BASE_DIR/internal/domain/asset/entity
cat > $BASE_DIR/internal/domain/asset/entity/asset.go << 'EOT'
package entity

import "time"

type AssetType string

const (
	AssetTypeStock  AssetType = "stock"
	AssetTypeREIT   AssetType = "reit"
	AssetTypeCrypto AssetType = "crypto"
)

type Asset interface {
	GetID() string
	GetSymbol() string
	GetName() string
	GetType() AssetType
	GetCurrentPrice() float64
	GetChangePercentage() float64
	SetCurrentPrice(price float64)
	IsFavorite() bool
	SetFavorite(favorite bool)
}

type BaseAsset struct {
	ID               string    `json:"id" bson:"_id"`
	Symbol           string    `json:"symbol" bson:"symbol"`
	Name             string    `json:"name" bson:"name"`
	Type             AssetType `json:"type" bson:"type"`
	CurrentPrice     float64   `json:"currentPrice" bson:"current_price"`
	PreviousClose    float64   `json:"previousClose" bson:"previous_close"`
	ChangePercentage float64   `json:"changePercentage" bson:"change_percentage"`
	LastUpdated      time.Time `json:"lastUpdated" bson:"last_updated"`
	Favorite         bool      `json:"isFavorite" bson:"is_favorite"`
}

// Implement Asset interface methods
func (a *BaseAsset) GetID() string                { return a.ID }
func (a *BaseAsset) GetSymbol() string            { return a.Symbol }
func (a *BaseAsset) GetName() string              { return a.Name }
func (a *BaseAsset) GetType() AssetType           { return a.Type }
func (a *BaseAsset) GetCurrentPrice() float64     { return a.CurrentPrice }
func (a *BaseAsset) GetChangePercentage() float64 { return a.ChangePercentage }
func (a *BaseAsset) IsFavorite() bool             { return a.Favorite }
func (a *BaseAsset) SetFavorite(favorite bool)    { a.Favorite = favorite }

func (a *BaseAsset) SetCurrentPrice(price float64) {
	a.PreviousClose = a.CurrentPrice
	a.CurrentPrice = price
	a.ChangePercentage = ((price - a.PreviousClose) / a.PreviousClose) * 100
	a.LastUpdated = time.Now()
}

// Specific asset types
type Stock struct {
	BaseAsset
	Company         string  `json:"company" bson:"company"`
	Sector          string  `json:"sector" bson:"sector"`
	DividendYield   float64 `json:"dividendYield" bson:"dividend_yield"`
	PriceToEarnings float64 `json:"priceToEarnings" bson:"price_to_earnings"`
	MarketCap       float64 `json:"marketCap" bson:"market_cap"`
}

type REIT struct {
	BaseAsset
	Segment       string  `json:"segment" bson:"segment"`
	DividendYield float64 `json:"dividendYield" bson:"dividend_yield"`
	PropertyCount int     `json:"propertyCount" bson:"property_count"`
	PVP           float64 `json:"pvp" bson:"pvp"`
}

type Cryptocurrency struct {
	BaseAsset
	MarketCap         float64    `json:"marketCap" bson:"market_cap"`
	CirculatingSupply float64    `json:"circulatingSupply" bson:"circulating_supply"`
	MaxSupply         *float64   `json:"maxSupply,omitempty" bson:"max_supply,omitempty"`
}
EOT

# Repository interface
mkdir -p $BASE_DIR/internal/domain/asset/repository
cat > $BASE_DIR/internal/domain/asset/repository/asset_repository.go << 'EOT'
package repository

import (
	"context"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/domain/asset/entity"
)

type AssetRepository interface {
	// Basic CRUD
	GetByID(ctx context.Context, id string) (entity.Asset, error)
	GetBySymbol(ctx context.Context, symbol string, assetType entity.AssetType) (entity.Asset, error)
	GetAll(ctx context.Context, filter map[string]interface{}) ([]entity.Asset, error)
	GetByType(ctx context.Context, assetType entity.AssetType) ([]entity.Asset, error)
	Save(ctx context.Context, asset entity.Asset) error
	Update(ctx context.Context, asset entity.Asset) error
	
	// Specialized queries
	GetFavorites(ctx context.Context) ([]entity.Asset, error)
	UpdatePrice(ctx context.Context, id string, price float64) error
	Search(ctx context.Context, query string, types []entity.AssetType) ([]entity.Asset, error)
}

// Common error types
var (
	ErrAssetNotFound = NewRepositoryError("asset not found")
	ErrDuplicateAsset = NewRepositoryError("asset already exists")
)

type RepositoryError struct {
	Message string
}

func (e RepositoryError) Error() string {
	return e.Message
}

func NewRepositoryError(message string) RepositoryError {
	return RepositoryError{Message: message}
}
EOT

echo "Domain layer created successfully"
EOF
chmod +x $SCRIPTS_DIR/04_create_domain_layer.sh

# Infrastructure setup script
cat > $SCRIPTS_DIR/05_create_infrastructure.sh << 'EOF'
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
EOF
chmod +x $SCRIPTS_DIR/05_create_infrastructure.sh

# Run all scripts in order
echo -e "${BLUE}Running setup scripts...${NC}"

echo -e "${BLUE}1. Creating directory structure...${NC}"
./$SCRIPTS_DIR/01_create_structure.sh "$PROJECT_DIR"

echo -e "${BLUE}2. Creating configuration files...${NC}"
./$SCRIPTS_DIR/02_create_config_files.sh "$PROJECT_DIR" "$IMPORT_PATH"

echo -e "${BLUE}3. Creating common packages...${NC}"
./$SCRIPTS_DIR/03_create_common_packages.sh "$PROJECT_DIR"

echo -e "${BLUE}4. Creating domain layer...${NC}"
./$SCRIPTS_DIR/04_create_domain_layer.sh "$PROJECT_DIR"

echo -e "${BLUE}5. Creating infrastructure layer...${NC}"
./$SCRIPTS_DIR/05_create_infrastructure.sh "$PROJECT_DIR"

echo -e "${GREEN}Setup completed successfully!${NC}"
echo "Next steps:"
echo "1. cd $PROJECT_DIR"
echo "2. go mod tidy"
echo "3. Continue implementing domain entities and use cases"