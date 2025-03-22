// pkg/infrastructure/database/mongodb/client.go
package mongodb

import (
	"context"
	"time"

	"github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/logger"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

// Client encapsula um cliente MongoDB
type Client struct {
	client     *mongo.Client
	database   *mongo.Database
	logger     logger.Logger
	timeout    time.Duration
	dbName     string
	collections map[string]*mongo.Collection
}

// ClientConfig representa a configuração do cliente MongoDB
type ClientConfig struct {
	URI             string
	DatabaseName    string
	ConnectTimeout  time.Duration
	OperationTimeout time.Duration
}

// DefaultConfig retorna a configuração padrão do cliente
func DefaultConfig() ClientConfig {
	return ClientConfig{
		URI:              "mongodb://localhost:27017",
		DatabaseName:     "invest_tracker",
		ConnectTimeout:   10 * time.Second,
		OperationTimeout: 5 * time.Second,
	}
}

// NewClient cria um novo cliente MongoDB
func NewClient(config ClientConfig, log logger.Logger) (*Client, error) {
	if log == nil {
		logConfig := logger.DefaultConfig()
		var err error
		log, err = logger.New(logConfig)
		if err != nil {
			return nil, err
		}
	}

	log.Info("Connecting to MongoDB", logger.String("uri", config.URI), logger.String("database", config.DatabaseName))

	// Configurar opções de cliente
	clientOptions := options.Client().
		ApplyURI(config.URI).
		SetConnectTimeout(config.ConnectTimeout)

	// Criar contexto com timeout
	ctx, cancel := context.WithTimeout(context.Background(), config.ConnectTimeout)
	defer cancel()

	// Conectar ao MongoDB
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Error("Failed to connect to MongoDB", logger.Error(err))
		return nil, err
	}

	// Verificar conexão com ping
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Error("Failed to ping MongoDB", logger.Error(err))
		return nil, err
	}

	// Selecionar banco de dados
	database := client.Database(config.DatabaseName)

	log.Info("Connected to MongoDB", logger.String("database", config.DatabaseName))

	return &Client{
		client:     client,
		database:   database,
		logger:     log,
		timeout:    config.OperationTimeout,
		dbName:     config.DatabaseName,
		collections: make(map[string]*mongo.Collection),
	}, nil
}

// Collection retorna uma referência à coleção especificada
func (c *Client) Collection(name string) *mongo.Collection {
	if col, ok := c.collections[name]; ok {
		return col
	}
	
	col := c.database.Collection(name)
	c.collections[name] = col
	return col
}

// WithTimeout executa uma função com um timeout específico
func (c *Client) WithTimeout(timeout time.Duration) *Client {
	clone := *c
	clone.timeout = timeout
	return &clone
}

// ContextWithTimeout retorna um contexto com timeout
func (c *Client) ContextWithTimeout() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), c.timeout)
}

// Disconnect fecha a conexão com o MongoDB
func (c *Client) Disconnect() error {
	c.logger.Info("Disconnecting from MongoDB")
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	return c.client.Disconnect(ctx)
}

// GetClient retorna o cliente MongoDB subjacente
func (c *Client) GetClient() *mongo.Client {
	return c.client
}

// GetDatabase retorna a referência ao banco de dados
func (c *Client) GetDatabase() *mongo.Database {
	return c.database
}

// GetLogger retorna o logger
func (c *Client) GetLogger() logger.Logger {
	return c.logger
}

// GetDatabaseName retorna o nome do banco de dados
func (c *Client) GetDatabaseName() string {
	return c.dbName
}