#!/bin/bash
# Script to set up the Invest Tracker project structure

# Colors for pretty output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to create directories
create_directories() {
    echo -e "${BLUE}Creating Invest Tracker project structure...${NC}"
    mkdir -p cmd/server
    mkdir -p internal/{domain,usecase,port,adapter}
    mkdir -p pkg/{http,mongodb,supabase,external,eventbus,logger}
    mkdir -p web/{react,react-native}
    mkdir -p internal/domain/entity/{financial,investment,user}
    mkdir -p internal/domain/valueobject
    mkdir -p internal/usecase/{financial,investment,ai}
    mkdir -p internal/port/{input,output}
    mkdir -p internal/adapter/{controller,presenter,repository,service,eventbus}
}

# Function to create main.go with improved logging and modular setup
create_main_go() {
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

	"github.com/systentandobr/life-tracker/internal/adapter/controller"
	"github.com/systentandobr/life-tracker/internal/adapter/eventbus"
	"github.com/systentandobr/life-tracker/internal/adapter/repository"
	"github.com/systentandobr/life-tracker/internal/adapter/service"
	"github.com/systentandobr/life-tracker/internal/usecase/financial"
	"github.com/systentandobr/life-tracker/pkg/mongodb"
	"github.com/systentandobr/life-tracker/pkg/logger"
)

func main() {
	logger.InitLogger()
	log := logger.GetLogger()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-signalChan
		log.Println("Shutdown signal received, exiting...")
		cancel()
	}()

	mongoClient, err := mongodb.NewClient(os.Getenv("MONGODB_URI"))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	db := mongoClient.Database("investtracker")

	eventBus := eventbus.NewInMemoryEventBus()

	investmentRepo := repository.NewMongoInvestmentRepository(db)
	financialService := service.NewFinancialServiceAdapter()
	investmentUseCase := financial.NewInvestmentTrackingUseCase(investmentRepo, financialService, eventBus)
	investmentController := controller.NewInvestmentController(investmentUseCase)

	server := &http.Server{
		Addr:    ":8080",
		Handler: setupRouter(investmentController),
	}

	go func() {
		log.Println("Server starting on :8080")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	<-ctx.Done()

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server shutdown failed: %v", err)
	}
	log.Println("Server stopped gracefully")
}

func setupRouter(investmentController *controller.InvestmentController) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/investments", investmentController.AddInvestment)
	mux.HandleFunc("GET /api/investments", investmentController.GetInvestments)
	return mux
}
EOF
}

# Run setup functions
create_directories
create_main_go

# Output success message
echo -e "${GREEN}Invest Tracker project structure created successfully!${NC}"