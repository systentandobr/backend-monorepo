#!/bin/bash
# Script to set up the Life Tracker project structure

# Colors for pretty output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Creating Life Tracker project structure...${NC}"

# Create root directory
mkdir -p backend-monorepo
cd backend-monorepo

# Create main directory structure
mkdir -p cmd/server
mkdir -p internal/{domain,usecase,port,adapter}
mkdir -p pkg/{http,mongodb,supabase,external}
mkdir -p web/{react,react-native}

# Create domain layer directories
mkdir -p internal/domain/entity/{financial,goals,wellness,business,user}
mkdir -p internal/domain/valueobject

# Create usecase layer directories
mkdir -p internal/usecase/{financial,goals,wellness,business,ai}

# Create port layer directories
mkdir -p internal/port/{input,output}

# Create adapter layer directories
mkdir -p internal/adapter/{controller,presenter,repository,service,eventbus}

# Create placeholder files
# Main entry point
cat > cmd/server/main.go << 'EOF'
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/systentandobr/backend-monorepo/golanginternal/adapter/controller"
	"github.com/systentandobr/backend-monorepo/golanginternal/adapter/eventbus"
	"github.com/systentandobr/backend-monorepo/golanginternal/adapter/repository"
	"github.com/systentandobr/backend-monorepo/golanginternal/adapter/service"
	"github.com/systentandobr/backend-monorepo/golanginternal/usecase/financial"
	"github.com/systentandobr/backend-monorepo/golanginternal/usecase/goals"
	"github.com/systentandobr/backend-monorepo/golangpkg/mongodb"
)

func main() {
	// Setup context with cancellation
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Setup signal handling
	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-signalChan
		log.Println("Shutdown signal received, exiting...")
		cancel()
	}()

	// Initialize MongoDB connection
	mongoClient, err := mongodb.NewClient(os.Getenv("MONGODB_URI"))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	db := mongoClient.Database("backend-monorepo")

	// Initialize event bus
	eventBus := eventbus.NewInMemoryEventBus()

	// Initialize repositories
	assetRepo := repository.NewMongoAssetRepository(db)
	goalRepo := repository.NewMongoGoalRepository(db)

	// Initialize external services
	financialService := service.NewFinancialServiceAdapter()

	// Initialize use cases
	assetUseCase := financial.NewAssetMonitoringUseCase(assetRepo, financialService, eventBus)
	goalUseCase := goals.NewGoalManagementUseCase(goalRepo, eventBus)

	// Initialize controllers
	assetController := controller.NewAssetController(assetUseCase)
	goalController := controller.NewGoalController(goalUseCase)

	// Set up HTTP server
	server := &http.Server{
		Addr:    ":8080",
		Handler: setupRouter(assetController, goalController),
	}

	// Start server
	go func() {
		log.Println("Server starting on :8080")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for context cancellation
	<-ctx.Done()

	// Graceful shutdown
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server shutdown failed: %v", err)
	}
	log.Println("Server stopped gracefully")
}

func setupRouter(assetController *controller.AssetController, goalController *controller.GoalController) http.Handler {
	mux := http.NewServeMux()
	
	// Register routes
	mux.HandleFunc("POST /api/assets", assetController.AddAsset)
	mux.HandleFunc("GET /api/assets", assetController.GetAssets)
	mux.HandleFunc("POST /api/goals", goalController.CreateGoal)
	mux.HandleFunc("PATCH /api/goals", goalController.UpdateGoalProgress)
	
	return mux
}
EOF

# Domain entities

# Financial entity
cat > internal/domain/entity/financial/asset.go << 'EOF'
package financial

import (
	"time"
)

type AssetType string

const (
	AssetTypeStock  AssetType = "stock"
	AssetTypeCrypto AssetType = "crypto"
	AssetTypeREIT   AssetType = "reit"
)

type Asset struct {
	ID               string    `json:"id"`
	UserID           string    `json:"userId"`
	Symbol           string    `json:"symbol"`
	Type             AssetType `json:"type"`
	AcquisitionDate  time.Time `json:"acquisitionDate"`
	AcquisitionPrice float64   `json:"acquisitionPrice"`
	CurrentPrice     float64   `json:"currentPrice"`
	Quantity         float64   `json:"quantity"`
}

func NewAsset(userID, symbol string, assetType AssetType, price, quantity float64) Asset {
	return Asset{
		ID:               generateID(),
		UserID:           userID,
		Symbol:           symbol,
		Type:             assetType,
		AcquisitionDate:  time.Now(),
		AcquisitionPrice: price,
		CurrentPrice:     price,
		Quantity:         quantity,
	}
}

func (a *Asset) UpdatePrice(price float64) {
	a.CurrentPrice = price
}

func (a *Asset) Value() float64 {
	return a.CurrentPrice * a.Quantity
}

func (a *Asset) ProfitLoss() float64 {
	return (a.CurrentPrice - a.AcquisitionPrice) * a.Quantity
}

func (a *Asset) ProfitLossPercentage() float64 {
	if a.AcquisitionPrice == 0 {
		return 0
	}
	return ((a.CurrentPrice - a.AcquisitionPrice) / a.AcquisitionPrice) * 100
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
EOF

# Goals entity
cat > internal/domain/entity/goals/goal.go << 'EOF'
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
EOF

# Port interfaces
cat > internal/port/output/repository.go << 'EOF'
package output

import (
	"context"
)

// Generic Repository interface
type Repository[T any] interface {
	FindByID(ctx context.Context, id string) (T, error)
	FindAll(ctx context.Context, filter map[string]interface{}) ([]T, error)
	Save(ctx context.Context, entity T) error
	Update(ctx context.Context, entity T) error
	Delete(ctx context.Context, id string) error
}

// AssetRepository extends the generic Repository
type AssetRepository interface {
	Repository[interface{}] // Replace with proper Asset type
	FindBySymbol(ctx context.Context, userID string, symbol string) (interface{}, error)
	UpdatePrice(ctx context.Context, symbol string, price float64) error
}

// GoalRepository extends the generic Repository
type GoalRepository interface {
	Repository[interface{}] // Replace with proper Goal type
	FindByUserID(ctx context.Context, userID string) ([]interface{}, error)
	FindByCategory(ctx context.Context, userID string, category string) ([]interface{}, error)
	FindActive(ctx context.Context, userID string) ([]interface{}, error)
	UpdateProgress(ctx context.Context, goalID string, progress float64) error
}
EOF

cat > internal/port/output/eventbus.go << 'EOF'
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
EOF

# Use case implementations
cat > internal/usecase/financial/asset_monitoring.go << 'EOF'
package financial

import (
	"context"
	"time"

	"github.com/systentandobr/backend-monorepo/golanginternal/domain/entity/financial"
	"github.com/systentandobr/backend-monorepo/golanginternal/port/output"
)

type AssetMonitoringUseCase struct {
	assetRepo        output.AssetRepository
	financialService output.FinancialDataService
	eventBus         output.EventPublisher
}

func NewAssetMonitoringUseCase(
	assetRepo output.AssetRepository,
	financialService output.FinancialDataService,
	eventBus output.EventPublisher,
) *AssetMonitoringUseCase {
	return &AssetMonitoringUseCase{
		assetRepo:        assetRepo,
		financialService: financialService,
		eventBus:         eventBus,
	}
}

func (uc *AssetMonitoringUseCase) AddAssetToWatchlist(
	ctx context.Context, 
	userID string, 
	symbol string,
	assetType financial.AssetType,
	quantity float64,
) error {
	// Get current price
	price, err := uc.financialService.GetAssetPrice(ctx, symbol)
	if err != nil {
		return err
	}
	
	// Create asset entity
	asset := financial.NewAsset(userID, symbol, assetType, price, quantity)
	
	// Save to repository
	if err := uc.assetRepo.Save(ctx, asset); err != nil {
		return err
	}
	
	// Publish event
	return uc.eventBus.Publish(ctx, "asset.added", asset)
}

func (uc *AssetMonitoringUseCase) UpdateAssetPrices(ctx context.Context) error {
	// Implementation would go here
	return nil
}

func (uc *AssetMonitoringUseCase) GetAssets(ctx context.Context, userID string) ([]interface{}, error) {
	// Implementation would go here
	return nil, nil
}
EOF

# Add git ignore file
cat > .gitignore << 'EOF'
# Binaries for programs and plugins
*.exe
*.exe~
*.dll
*.so
*.dylib

# Test binary, built with `go test -c`
*.test

# Output of the go coverage tool, specifically when used with LiteIDE
*.out

# Dependency directories (remove the comment below to include it)
# vendor/

# Go workspace file
go.work

# Environment variables
.env

# macOS
.DS_Store

# IDE files
.idea/
.vscode/
*.swp
*.swo

# Logs
*.log

# Binary output
/bin/

# Node modules
node_modules/

# Build artifacts
/web/react/build/
/web/react-native/build/
EOF

# Add go.mod file
cat > go.mod << 'EOF'
module github.com/systentandobr

go 1.18

require (
	go.mongodb.org/mongo-driver v1.12.1
)
EOF

# Add README.md
cat > README.md << 'EOF'
# Life Tracker

Life Tracker is a comprehensive system that helps balance various aspects of life, including finances, personal goals, wellness, and business opportunities.

## Architecture

This project follows Clean Architecture principles and SOLID design:

- **Domain Layer**: Core business entities and rules
- **Use Case Layer**: Application business rules
- **Interface Adapters Layer**: Adapters for external tools
- **Frameworks & Drivers Layer**: External frameworks and tools

## Getting Started

### Prerequisites

- Go 1.21+
- MongoDB
- Supabase account
- Docker and Kubernetes (for production)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/systentandobr.git
   cd backend-monorepo
   ```

2. Set up environment variables
   ```
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Run the application
   ```
   go run cmd/server/main.go
   ```

## Modules

The system consists of six primary modules:

1. **Financial Monitoring**: Track financial assets and portfolios
2. **Investment Simulation**: Simulate investment strategies
3. **Planning & Goals**: Manage personal and professional goals
4. **AI Assistant**: Learn user behavior and provide insights
5. **Wellness & Productivity**: Monitor wellness and productivity
6. **Business Opportunities**: Evaluate business ideas and opportunities

## License

This project is licensed under the MIT License - see the LICENSE file for details.
EOF

echo -e "${GREEN}Project structure created successfully!${NC}"
echo "Next steps:"
echo "1. Navigate to the project directory: cd backend-monorepo"
echo "2. Initialize git repository: git init"
echo "3. Install dependencies: go mod tidy"
echo "4. Start implementing the remaining components"