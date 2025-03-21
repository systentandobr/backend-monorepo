package repository

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	
	"github.com/systentandobr/life-tracker/internal/domain/entity/business"
)

// MongoBusinessIdeaRepository implements the BusinessIdeaRepository interface
type MongoBusinessIdeaRepository struct {
	*MongoRepository[business.BusinessIdea]
}

// NewMongoBusinessIdeaRepository creates a new MongoBusinessIdeaRepository
func NewMongoBusinessIdeaRepository(db *mongo.Database) *MongoBusinessIdeaRepository {
	return &MongoBusinessIdeaRepository{
		MongoRepository: NewMongoRepository[business.BusinessIdea](db, "businessideas"),
	}
}

// FindByUserID finds all businessideas for a given user
func (r *MongoBusinessIdeaRepository) FindByUserID(ctx context.Context, userID string) ([]business.BusinessIdea, error) {
	filter := bson.M{"userId": userID}
	return r.FindAll(ctx, filter)
}