# Life Tracker

Life Tracker is a comprehensive system that helps balance various aspects of life, including finances, personal goals, wellness, and business opportunities.

## Architecture

This project follows Clean Architecture principles and SOLID design:

- **Domain Layer**: Core business entities and rules
- **Use Case Layer**: Application business rules
- **Interface Adapters Layer**: Adapters for external tools
- **Frameworks & Drivers Layer**: External frameworks and tools

## Getting Started

### Prerequisites

- Go 1.21+
- MongoDB
- Supabase account
- Docker and Kubernetes (for production)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/systentandobr.git
   cd backend-monorepo
   ```

2. Set up environment variables
   ```
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Run the application
   ```
   go run cmd/server/main.go
   ```

## Modules

The system consists of six primary modules:

1. **Financial Monitoring**: Track financial assets and portfolios
2. **Investment Simulation**: Simulate investment strategies
3. **Planning & Goals**: Manage personal and professional goals
4. **AI Assistant**: Learn user behavior and provide insights
5. **Wellness & Productivity**: Monitor wellness and productivity
6. **Business Opportunities**: Evaluate business ideas and opportunities

## License

This project is licensed under the MIT License - see the LICENSE file for details.
