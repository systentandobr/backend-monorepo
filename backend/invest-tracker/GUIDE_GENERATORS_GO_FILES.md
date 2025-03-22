# Go Template Generators for Investment Tracker

This guide explains how to use the template generators to maintain a clean architecture in your Investment Tracker project.

## Setup

First, let's set up the template generators:

```bash
# Clone the repository if you haven't already
git clone https://github.com/systentandobr/life-tracker.git
cd life-tracker/backend

# Create the template generators directory
mkdir -p invest-tracker/cmd/templates
```

Copy all the template generator files to the `invest-tracker/cmd/templates` directory:

1. `common.sh`
2. `entity_generator.go`
3. `repository_generator.go`
4. `service_generator.go`
5. `controller_generator.go`
6. `strategy_generator.go`
7. `di-factory_generator.go`
8. `generate.sh`

Make the scripts executable:

```bash
chmod +x invest-tracker/cmd/templates/generate.sh
chmod +x invest-tracker/cmd/templates/common.sh
```

## Basic Usage

### Generate a Single Component

To generate a single component, use the `generate.sh` script:

```bash
cd invest-tracker/cmd/templates

# Generate an entity
./generate.sh entity asset Stock

# Generate a repository
./generate.sh repository asset Stock

# Generate a service
./generate.sh service asset Stock

# Generate a controller
./generate.sh controller asset Stock
```

### Generate All Components for an Entity

To generate all components for an entity at once:

```bash
./generate.sh all asset Stock
```

This will create:
- Entity definition
- Repository interface and MongoDB implementation
- Service interface and implementation
- Controller
- DI Factory (if applicable)
- Strategy (for analysis domain)

## Examples

# Basic usage pattern
./generate.sh <generator-type> <domain-name> <entity-name>


### Example 1: Creating a New Domain and Entity

```bash
# Create a new asset entity
./generate.sh all asset Stock

# Create a REIT entity in the same domain
./generate.sh all asset REIT

# Create a cryptocurrency entity in the same domain
./generate.sh all asset Cryptocurrency
```

### Example 2: Creating Analysis Components

```bash
# Create analysis domain components
./generate.sh all analysis MarketAnalysis

# Create an investment strategy
./generate.sh strategy analysis ValueInvestment
```

### Example 3: Creating Notification System

```bash
# Create notification domain components
./generate.sh all notification AlertNotification

# Create SMS notification service
./generate.sh entity notification SMSProvider
./generate.sh service notification SMSProvider
```

## Directory Structure

The generators will create files according to the clean architecture pattern:

```
invest-tracker/
├── internal/
│   ├── domain/
│   │   ├── asset/
│   │   │   ├── entity/
│   │   │   │   └── stock.go
│   │   │   ├── repository/
│   │   │   │   └── stock_repository.go
│   │   │   └── service/
│   │   │       └── stock_service.go
│   │   └── analysis/
│   │       ├── entity/
│   │       ├── repository/
│   │       ├── service/
│   │       └── strategy/
│   │           └── value_investment_strategy.go
│   ├── application/
│   │   ├── asset/
│   │   │   └── stock_service.go
│   │   └── analysis/
│   └── adapter/
│       ├── controller/
│       │   └── stock_controller.go
│       ├── persistence/
│       │   └── mongodb/
│       │       └── stock_repository.go
│       └── factory/
│           └── asset_factory.go
└── cmd/
    └── templates/
```

## Advanced Features

### Custom Fields

You can modify the generated templates to include custom fields specific to your domain:

1. Edit the entity template to add your custom fields
2. Regenerate the entity and related components

### Integration with Message Queues

For asynchronous communication:

```bash
# Create notification broker
./generate.sh entity messaging NotificationBroker
./generate.sh service messaging NotificationBroker
```

### Analytics Integration

For tracking metrics and performance:

```bash
# Create analytics components
./generate.sh all analytics MetricsCollector
```

## Troubleshooting

### Common Issues

1. **File already exists**: The generators will prompt you before overwriting files
2. **Import path issues**: Update the import path in common.sh if needed
3. **Go errors**: Make sure Go is installed and properly configured

### Getting Help

If you encounter issues:

1. Check that all template files are in the correct location
2. Verify that the common.sh script is executable
3. Check for any error messages in the output

## Best Practices

1. Keep domain logic in domain layer (entities, repositories, services)
2. Put business logic implementation in application layer
3. Keep controllers thin, delegating to services
4. Use the DI Factory for dependency management
5. Regularly update generators as project requirements evolve


## Generator swagger

This will create the entity with Swagger annotations. After updating or adding endpoints, run `make swagger` again to regenerate the documentation.