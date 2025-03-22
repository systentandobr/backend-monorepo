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
	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/infrastructure/database/mongodb"
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
	
	// Initialize MongoDB client
	mongoConfig := mongodb.DefaultConfig()
	
	// Override with environment variables if available
	if mongoURI := os.Getenv("MONGODB_URI"); mongoURI != "" {
		mongoConfig.URI = mongoURI
	}
	
	if mongoDBName := os.Getenv("MONGODB_DATABASE"); mongoDBName != "" {
		mongoConfig.DatabaseName = mongoDBName
	}
	
	mongoClient, err := mongodb.NewClient(mongoConfig, log)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB", logger.Error(err))
	}
	
	// Initialize Gin router
	router := gin.Default()
	
	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	
	// Setup Swagger documentation
	setupSwagger(router)
	
	// Create application bootstrap
	app := bootstrap.NewAppBootstrap(log, mongoClient, router)
	
	// Bootstrap application components
	if err := app.Bootstrap(context.Background()); err != nil {
		log.Fatal("Failed to bootstrap application", logger.Error(err))
	}
	
	// Add health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "up",
			"time":   time.Now().Format(time.RFC3339),
		})
	})
	
	// Set up HTTP server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}
	
	// Start HTTP server in a goroutine
	go func() {
		log.Info("Starting HTTP server", logger.String("port", port))
		log.Info("Swagger documentation available at: http://localhost:" + port + "/swagger/index.html")
		
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
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	// Shutdown HTTP server
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown", logger.Error(err))
	}
	
	// Shutdown application components
	if err := app.Shutdown(ctx); err != nil {
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