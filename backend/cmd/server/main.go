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
	goalsUseCase := goals.NewGoalsUseCase()
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
