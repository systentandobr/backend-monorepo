package bootstrap

import (
	"context"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/adapter/factory"
	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/internal/scheduler"
	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/pkg/common/logger"
	"github.com/systentandobr/toolkit/go/shared/infrastructure/persistence/mongodb"
	"github.com/systentandobr/backend-monorepo/golang/invest-tracker/pkg/infrastructure/telemetry"
)

// AppBootstrap handles application initialization and dependency wiring
type AppBootstrap struct {
	logger      logger.Logger
	mongoClient *mongodb.Client
	router      *gin.Engine
	telemetry   *telemetry.Client
	scheduler   *scheduler.JobScheduler
	
	// Domain factories
	assetFactory        *factory.AssetFactory
	analysisFactory     *factory.AnalysisFactory
	simulationFactory   *factory.SimulationFactory
	notificationFactory *factory.NotificationFactory
	
	// Configuration
	config *AppConfig
}

// AppConfig holds application configuration
type AppConfig struct {
	Environment   string
	APIPort       string
	EnableSwagger bool
	EnableCORS    bool
	EnableJobs    bool
	EnableMetrics bool
	EnableTracing bool
}

// DefaultConfig returns the default configuration
func DefaultConfig() *AppConfig {
	return &AppConfig{
		Environment:   "development",
		APIPort:       "8080",
		EnableSwagger: true,
		EnableCORS:    true,
		EnableJobs:    true,
		EnableMetrics: true,
		EnableTracing: true,
	}
}

// NewAppBootstrap creates a new application bootstrap instance
func NewAppBootstrap(
	logger logger.Logger,
	mongoClient *mongodb.Client,
	router *gin.Engine,
	config *AppConfig,
) *AppBootstrap {
	return &AppBootstrap{
		logger:      logger,
		mongoClient: mongoClient,
		router:      router,
		config:      config,
	}
}

// Bootstrap initializes all application components
func (b *AppBootstrap) Bootstrap(ctx context.Context) error {
	startTime := time.Now()
	b.logger.Info("Starting application bootstrap", 
		logger.String("environment", b.config.Environment))
	
	// Initialize infrastructure services
	if err := b.initializeInfrastructure(ctx); err != nil {
		return fmt.Errorf("failed to initialize infrastructure: %w", err)
	}
	
	// Initialize domain factories
	if err := b.initializeDomainFactories(); err != nil {
		return fmt.Errorf("failed to initialize domain factories: %w", err)
	}
	
	// Create API router group
	apiRouter := b.router.Group("/api/v1")
	
	// Register domain routes
	b.registerRoutes(apiRouter)
	
	// Start scheduled jobs if enabled
	if b.config.EnableJobs {
		b.startScheduledJobs()
	}
	
	b.logger.Info("Application bootstrap completed successfully",
		logger.String("duration", time.Since(startTime).String()))
	return nil
}

// Shutdown gracefully shuts down application components
func (b *AppBootstrap) Shutdown(ctx context.Context) error {
	b.logger.Info("Shutting down application components")
	
	// Stop scheduled jobs
	if b.scheduler != nil {
		b.scheduler.StopAll(ctx)
	}
	
	// Shutdown telemetry
	if b.telemetry != nil {
		if err := b.telemetry.Shutdown(ctx); err != nil {
			b.logger.Error("Error shutting down telemetry", logger.Error(err))
		}
	}
	
	return nil
}

// initializeInfrastructure initializes infrastructure services
func (b *AppBootstrap) initializeInfrastructure(ctx context.Context) error {
	// Initialize telemetry if enabled
	if b.config.EnableMetrics || b.config.EnableTracing {
		telemetryConfig := telemetry.Config{
			ServiceName:  "invest-tracker",
			Environment:  b.config.Environment,
			EnableMetrics: b.config.EnableMetrics,
			EnableTracing: b.config.EnableTracing,
		}
		
		var err error
		b.telemetry, err = telemetry.NewClient(telemetryConfig, b.logger)
		if err != nil {
			return fmt.Errorf("failed to initialize telemetry: %w", err)
		}
	}
	
	// Initialize job scheduler if jobs are enabled
	if b.config.EnableJobs {
		b.scheduler = scheduler.NewJobScheduler(b.logger)
	}
	
	return nil
}

// initializeDomainFactories initializes all domain factories
func (b *AppBootstrap) initializeDomainFactories() error {
	// Initialize Asset domain factory
	b.assetFactory = factory.NewAssetFactory(b.logger)
	
	// Initialize Analysis domain factory
	b.analysisFactory = factory.NewAnalysisFactory(b.logger)
	
	// Initialize Simulation domain factory
	b.simulationFactory = factory.NewSimulationFactory(b.logger)
	
	// Initialize Notification domain factory
	b.notificationFactory = factory.NewNotificationFactory(b.logger)
	
	// Bootstrap domain components
	b.assetFactory.Bootstrap()
	b.analysisFactory.Bootstrap()
	b.simulationFactory.Bootstrap()
	b.notificationFactory.Bootstrap()
	
	return nil
}

// registerRoutes registers all domain routes
func (b *AppBootstrap) registerRoutes(router *gin.RouterGroup) {
	// Register Asset domain routes
	b.assetFactory.RegisterRoutes(router)
	
	// Register Analysis domain routes
	b.analysisFactory.RegisterRoutes(router)
	
	// Register Simulation domain routes
	b.simulationFactory.RegisterRoutes(router)
	
	// Register Notification domain routes
	b.notificationFactory.RegisterRoutes(router)
}

// startScheduledJobs registers and starts all scheduled jobs
func (b *AppBootstrap) startScheduledJobs() {
	b.logger.Info("Setting up scheduled jobs")
	
	// For now, we'll just start the scheduler without registering specific jobs
	// to avoid the interface compatibility errors
	b.scheduler.StartAll()
	
	// Eventually, you'll want to uncomment these lines once you've fully
	// implemented the service interfaces and job handlers
	/*
	// Register asset data collection job
	assetDataJob := b.scheduler.RegisterAssetDataJob(b.assetFactory.GetStockService())
	assetDataJob.SetSchedule("0 * * * *") // Run hourly
	
	// Register asset analysis job
	assetAnalysisJob := b.scheduler.RegisterAssetAnalysisJob(
		b.assetFactory.GetStockService(),
		b.analysisFactory.GetMarketAnalysisService(),
	)
	assetAnalysisJob.SetSchedule("0 0 * * *") // Run daily at midnight
	
	// Register opportunity detection job
	opportunityJob := b.scheduler.RegisterOpportunityDetectionJob(
		b.analysisFactory.GetOpportunityService(),
		b.notificationFactory.GetNotificationService(),
	)
	opportunityJob.SetSchedule("0 3 * * *") // Run every 3 hours
	*/
}
