package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/docs"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/internal/bootstrap"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/logger"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/config"
	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/infrastructure/database/mongodb"
	// "github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/infrastructure/telemetry"
)

// @title Investment Tracker API
// @version 1.0
// @description API for tracking and analyzing investments across different asset types
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.systentando.com.br/support
// @contact.email support@systentando.com.br

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /api/v1
// @schemes http https
func main() {
	// Initialize logger
	log, err := logger.New(logger.DefaultConfig())
	if err != nil {
		panic(fmt.Sprintf("Failed to initialize logger: %v", err))
	}
	
	log.Info("Starting Investment Tracker application")
	
	// Load configuration
	envFile := ".env"
	if len(os.Args) > 1 {
		envFile = os.Args[1]
	}
	
	appConfig, err := config.LoadConfig(envFile, log)
	if err != nil {
		log.Fatal("Failed to load configuration", logger.Error(err))
	}
	
	// Set Gin mode based on environment
	if appConfig.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	
	// Initialize MongoDB client
	mongoConfig := mongodb.DefaultConfig()
	mongoConfig.URI = appConfig.Database.URI
	mongoConfig.DatabaseName = appConfig.Database.Name
	mongoConfig.ConnectTimeout = time.Duration(appConfig.Database.ConnectTimeout) * time.Second
	mongoConfig.OperationTimeout = time.Duration(appConfig.Database.OperationTimeout) * time.Second
	
	mongoClient, err := mongodb.NewClient(mongoConfig, log)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB", logger.Error(err))
	}
	
	// Initialize Gin router
	router := gin.New()
	
	// Add middleware
	router.Use(gin.Recovery())
	
	// Add logger middleware
	router.Use(func(c *gin.Context) {
		// Start timer
		start := time.Now()
		path := c.Request.URL.Path
		
		// Process request
		c.Next()
		
		// Log request
		latency := time.Since(start)
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()
		method := c.Request.Method
		
		log.Info("HTTP Request",
			logger.String("method", method),
			logger.String("path", path),
			logger.Int("status", statusCode),
			logger.String("ip", clientIP),
			logger.String("latency", latency.String()))
			
		// Record metrics if enabled
		if appConfig.EnableMetrics {
			// This would use the telemetry client in a real implementation
		}
	})
	
	// Configure CORS if enabled
	if appConfig.EnableCORS {
		router.Use(cors.New(cors.Config{
			AllowOrigins:     []string{"*"},
			AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
			ExposeHeaders:    []string{"Content-Length"},
			AllowCredentials: true,
			MaxAge:           12 * time.Hour,
		}))
	}
	
	// Setup Swagger documentation if enabled
	if appConfig.EnableSwagger {
		setupSwagger(router)
	}
	
	// Create application bootstrap
	bootstrapper := bootstrap.NewAppBootstrap(log, mongoClient, router, &bootstrap.AppConfig{
		Environment:   appConfig.Environment,
		APIPort:       appConfig.APIPort,
		EnableSwagger: appConfig.EnableSwagger,
		EnableCORS:    appConfig.EnableCORS,
		EnableJobs:    appConfig.EnableJobs,
		EnableMetrics: appConfig.EnableMetrics,
		EnableTracing: appConfig.EnableTracing,
	})
	
	// Bootstrap application components
	if err := bootstrapper.Bootstrap(context.Background()); err != nil {
		log.Fatal("Failed to bootstrap application", logger.Error(err))
	}
	
	// Add health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "up",
			"time":   time.Now().Format(time.RFC3339),
			"env":    appConfig.Environment,
		})
	})
	
	// Set up HTTP server
	srv := &http.Server{
		Addr:    ":" + appConfig.APIPort,
		Handler: router,
	}
	
	// Start HTTP server in a goroutine
	go func() {
		log.Info("Starting HTTP server", logger.String("port", appConfig.APIPort))
		
		if appConfig.EnableSwagger {
			log.Info("Swagger documentation available at", 
				logger.String("url", fmt.Sprintf("http://localhost:%s/swagger/index.html", appConfig.APIPort)))
		}
		
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Failed to start HTTP server", logger.Error(err))
		}
	}()
	
	// Set up graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	
	log.Info("Shutting down server...")
	
	// Create shutdown context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	
	// Shutdown HTTP server
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown", logger.Error(err))
	}
	
	// Shutdown application components
	if err := bootstrapper.Shutdown(ctx); err != nil {
		log.Fatal("Failed to shutdown application components", logger.Error(err))
	}
	
	// Disconnect from MongoDB
	if err := mongoClient.Disconnect(ctx); err != nil {
		log.Fatal("Failed to disconnect from MongoDB", logger.Error(err))
	}
	
	log.Info("Server exited gracefully")
}

// setupSwagger configures Swagger documentation for the API
func setupSwagger(router *gin.Engine) {
	// Configure swagger info
	docs.SwaggerInfo.Title = "Investment Tracker API"
	docs.SwaggerInfo.Description = "API for tracking and analyzing investments across different asset types"
	docs.SwaggerInfo.Version = "1.0"
	docs.SwaggerInfo.BasePath = "/api/v1"
	docs.SwaggerInfo.Schemes = []string{"http", "https"}
	
	// Add swagger endpoint
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
}