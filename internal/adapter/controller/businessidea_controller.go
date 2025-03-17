package controller

import (
	"encoding/json"
	"net/http"
	
	"github.com/systentandobr/life-tracker/internal/usecase/business"
)

// BusinessIdeaController handles HTTP requests related to businessideas
type BusinessIdeaController struct {
	useCase *business.BusinessIdeaUseCase
}

// NewBusinessIdeaController creates a new BusinessIdeaController
func NewBusinessIdeaController(useCase *business.BusinessIdeaUseCase) *BusinessIdeaController {
	return &BusinessIdeaController{
		useCase: useCase,
	}
}

// CreateBusinessIdea handles POST requests to create a new BusinessIdea
func (c *BusinessIdeaController) CreateBusinessIdea(w http.ResponseWriter, r *http.Request) {
	var request struct {
		UserID string `json:"userId"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	entity, err := c.useCase.CreateBusinessIdea(
		r.Context(), 
		request.UserID,
	)
	
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(entity)
}

// GetBusinessIdea handles GET requests to retrieve a BusinessIdea
func (c *BusinessIdeaController) GetBusinessIdea(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing ID", http.StatusBadRequest)
		return
	}
	
	entity, err := c.useCase.GetBusinessIdea(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entity)
}

// GetAllBusinessIdeas handles GET requests to retrieve all businessideas for a user
func (c *BusinessIdeaController) GetAllBusinessIdeas(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("userId")
	if userID == "" {
		http.Error(w, "Missing userID", http.StatusBadRequest)
		return
	}
	
	entities, err := c.useCase.GetUserAllBusinessIdeas(r.Context(), userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entities)
}

// DeleteBusinessIdea handles DELETE requests to delete a BusinessIdea
func (c *BusinessIdeaController) DeleteBusinessIdea(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing ID", http.StatusBadRequest)
		return
	}
	
	if err := c.useCase.DeleteBusinessIdea(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}