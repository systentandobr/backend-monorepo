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
	"github.com/systentandobr/life-tracker/internal/usecase/goals"
	"github.com/systentandobr/life-tracker/pkg/mongodb"
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
	db := mongoClient.Database("lifetracker")

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
