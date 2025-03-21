// pkg/mongodb/client.go
package mongodb

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

// Client wraps the MongoDB client
type Client struct {
	client *mongo.Client
}

// NewClient creates a new MongoDB client
func NewClient(uri string) (*Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	// Ping the database to verify connection
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		return nil, err
	}

	return &Client{
		client: client,
	}, nil
}

// Database returns a database with the given name
func (c *Client) Database(name string) *mongo.Database {
	return c.client.Database(name)
}

// Close closes the connection to MongoDB
func (c *Client) Close(ctx context.Context) error {
	return c.client.Disconnect(ctx)
}
