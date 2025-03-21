package business

import (
	"context"
	"github.com/systentandobr/life-tracker/internal/domain/entity/business"
	"github.com/systentandobr/life-tracker/internal/port/output"
)

// BusinessIdeaUseCase contains business logic for businessideas
type BusinessIdeaUseCase struct {
	repo     output.BusinessIdeaRepository
	eventBus output.EventPublisher
}

// NewBusinessIdeaUseCase creates a new BusinessIdeaUseCase
func NewBusinessIdeaUseCase(
	repo output.BusinessIdeaRepository,
	eventBus output.EventPublisher,
) *BusinessIdeaUseCase {
	return &BusinessIdeaUseCase{
		repo:     repo,
		eventBus: eventBus,
	}
}

// CreateBusinessIdea creates a new BusinessIdea
func (uc *BusinessIdeaUseCase) CreateBusinessIdea(
	ctx context.Context, 
	userID string,
	title string,
	description string,
) (business.BusinessIdea, error) {
	// Create entity
	entity, err := business.NewBusinessIdea(userID, title, description)
	if err != nil {
		return business.BusinessIdea{}, err
	}
	
	// Save to repository
	if err := uc.repo.Save(ctx, entity); err != nil {
		return business.BusinessIdea{}, err
	}
	
	// Publish event
	uc.eventBus.Publish(ctx, "businessidea.created", entity)
	
	return entity, nil
}

// GetBusinessIdea retrieves a BusinessIdea by ID
func (uc *BusinessIdeaUseCase) GetBusinessIdea(ctx context.Context, id string) (business.BusinessIdea, error) {
	return uc.repo.FindByID(ctx, id)
}

// GetUserAllBusinessIdeas retrieves all businessideas for a user
func (uc *BusinessIdeaUseCase) GetUserAllBusinessIdeas(ctx context.Context, userID string) ([]business.BusinessIdea, error) {
	return uc.repo.FindByUserID(ctx, userID)
}

// UpdateBusinessIdea updates an existing BusinessIdea
func (uc *BusinessIdeaUseCase) UpdateBusinessIdea(ctx context.Context, entity business.BusinessIdea) error {
	// Update
	if err := uc.repo.Update(ctx, entity); err != nil {
		return err
	}
	
	// Publish event
	uc.eventBus.Publish(ctx, "businessidea.updated", entity)
	
	return nil
}

// DeleteBusinessIdea deletes a BusinessIdea
func (uc *BusinessIdeaUseCase) DeleteBusinessIdea(ctx context.Context, id string) error {
	// Get entity first for the event
	entity, err := uc.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	
	// Delete
	if err := uc.repo.Delete(ctx, id); err != nil {
		return err
	}
	
	// Publish event
	uc.eventBus.Publish(ctx, "businessidea.deleted", entity)
	
	return nil
}