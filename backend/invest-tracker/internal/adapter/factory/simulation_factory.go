package factory

import (
    "github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/common/logger"
    "github.com/systentandobr/life-tracker/backend/invest-tracker/pkg/infrastructure/database/mongodb"
)

// SimulationFactory manages simulation domain components
type SimulationFactory struct {}

// NewSimulationFactory creates a new simulation factory
func NewSimulationFactory(client *mongodb.Client, logger logger.Logger) *SimulationFactory {
    return &SimulationFactory{}
}

// Bootstrap initializes domain components
func (f *SimulationFactory) Bootstrap() {}

// RegisterRoutes registers domain routes
func (f *SimulationFactory) RegisterRoutes(router interface{}) {}
