package mongodb

import (
	"context"
	"time"

	"github.com/systentandobr/invest-tracker/internal/domain/notification/entity"
	"github.com/systentandobr/invest-tracker/internal/domain/notification/repository"
	"github.com/systentandobr/invest-tracker/pkg/common/logger"
	"github.com/systentandobr/toolkit/go/shared/infrastructure/persistence/mongodb"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const notificationCollection = "notifications"

// MongoNotificationRepository implements repository.NotificationRepository using MongoDB
type MongoNotificationRepository struct {
	client *mongodb.Client
	logger logger.Logger
}

// NewMongoNotificationRepository creates a new MongoDB repository for Notification
func NewMongoNotificationRepository(client *mongodb.Client, logger logger.Logger) repository.NotificationRepository {
	return &MongoNotificationRepository{
		client: client,
		logger: logger,
	}
}

// FindByID retrieves a Notification by its ID
func (r *MongoNotificationRepository) FindByID(ctx context.Context, id string) (*entity.Notification, error) {
	collection := r.client.Collection(notificationCollection)
	
	var notification entity.Notification
	
	filter := bson.M{"_id": id}
	
	err := collection.FindOne(ctx, filter).Decode(&notification)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, repository.ErrNotificationNotFound
		}
		return nil, err
	}
	
	return &notification, nil
}

// FindAll retrieves all notifications based on optional filter
func (r *MongoNotificationRepository) FindAll(ctx context.Context, filter map[string]interface{}) ([]*entity.Notification, error) {
	collection := r.client.Collection(notificationCollection)
	
	findOptions := options.Find()
	findOptions.SetSort(bson.D{{"created_at", -1}})
	
	mongoFilter := bson.M{}
	if filter != nil {
		for k, v := range filter {
			mongoFilter[k] = v
		}
	}
	
	cursor, err := collection.Find(ctx, mongoFilter, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	
	var results []*entity.Notification
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}
	
	return results, nil
}

// Create stores a new Notification
func (r *MongoNotificationRepository) Create(ctx context.Context, notification *entity.Notification) error {
	collection := r.client.Collection(notificationCollection)
	
	// Validate notification
	if err := notification.Validate(); err != nil {
		return err
	}
	
	_, err := collection.InsertOne(ctx, notification)
	if err != nil {
		// Check for duplicate key error
		if mongo.IsDuplicateKeyError(err) {
			return repository.ErrNotificationDuplicate
		}
		return err
	}
	
	return nil
}

// Update modifies an existing Notification
func (r *MongoNotificationRepository) Update(ctx context.Context, notification *entity.Notification) error {
	collection := r.client.Collection(notificationCollection)
	
	// Validate notification
	if err := notification.Validate(); err != nil {
		return err
	}
	
	filter := bson.M{"_id": notification.ID}
	
	result, err := collection.ReplaceOne(ctx, filter, notification)
	if err != nil {
		return err
	}
	
	if result.MatchedCount == 0 {
		return repository.ErrNotificationNotFound
	}
	
	return nil
}

// Delete removes a Notification by its ID
func (r *MongoNotificationRepository) Delete(ctx context.Context, id string) error {
	collection := r.client.Collection(notificationCollection)
	
	filter := bson.M{"_id": id}
	
	result, err := collection.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}
	
	if result.DeletedCount == 0 {
		return repository.ErrNotificationNotFound
	}
	
	return nil
}

// MarkAllAsRead marks all notifications as read
func (r *MongoNotificationRepository) MarkAllAsRead(ctx context.Context) error {
	collection := r.client.Collection(notificationCollection)
	
	filter := bson.M{"read": false}
	update := bson.M{
		"$set": bson.M{
			"read":    true,
			"read_at": time.Now(),
		},
	}
	
	_, err := collection.UpdateMany(ctx, filter, update)
	if err != nil {
		return err
	}
	
	return nil
}

// CountUnread counts unread notifications
func (r *MongoNotificationRepository) CountUnread(ctx context.Context) (int, error) {
	collection := r.client.Collection(notificationCollection)
	
	filter := bson.M{"read": false}
	
	count, err := collection.CountDocuments(ctx, filter)
	if err != nil {
		return 0, err
	}
	
	return int(count), nil
}
