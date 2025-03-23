# Investment Tracker Deployment Guide

This guide explains how to deploy the Investment Tracker application in various environments.

## Prerequisites

- Go 1.21 or higher
- Docker and Docker Compose
- MongoDB 6.0 or higher (if not using Docker)
- Kafka (if not using Docker)
- Make (for using Makefile commands)

## Project Setup

1. Clone the repository:

```bash
git clone https://github.com/systentandobr/life-tracker.git
cd life-tracker/backend
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Modify the `.env` file with your configuration settings.

## Development Environment

### Option 1: Running Locally

1. Install dependencies:

```bash
go mod tidy
```

2. Start infrastructure services with Docker:

```bash
make infra
```

This starts MongoDB, Kafka, and monitoring services.

3. Build and run the API:

```bash
make build
make run-api
```

### Option 2: Using Docker Compose

Run all services with Docker Compose:

```bash
make docker-compose
```

This builds and starts all services defined in `docker-compose.yml`.

## Production Deployment

### Docker Swarm

1. Initialize a Docker Swarm cluster (if not already done):

```bash
docker swarm init
```

2. Deploy the stack:

```bash
docker stack deploy -c deploy/docker-compose.prod.yml invest-tracker
```

### Kubernetes

1. Build Docker images:

```bash
make docker
```

2. Push images to registry:

```bash
make docker-push
```

3. Deploy to Kubernetes:

```bash
kubectl apply -f deploy/kubernetes/
```

## Configuration Options

The application can be configured using environment variables or a `.env` file. Here are the main configuration options:

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_ENV` | Environment (development, production) | development |
| `API_PORT` | Port for the API server | 8080 |
| `MONGODB_URI` | MongoDB connection URI | mongodb://localhost:27017 |
| `MONGODB_DATABASE` | MongoDB database name | invest_tracker |
| `KAFKA_BROKERS` | Comma-separated list of Kafka brokers | localhost:9092 |
| `ENABLE_SWAGGER` | Enable Swagger documentation | true |
| `ENABLE_CORS` | Enable CORS for API | true |
| `ENABLE_JOBS` | Enable scheduled jobs | true |
| `ENABLE_METRICS` | Enable Prometheus metrics | true |
| `ENABLE_TRACING` | Enable OpenTelemetry tracing | false |
| `TRACING_ENDPOINT` | OpenTelemetry collector endpoint | localhost:4317 |

## Monitoring

The application provides several monitoring endpoints:

- **Health Check**: `http://localhost:8080/health`
- **Metrics**: `http://localhost:8080/metrics`
- **Swagger UI**: `http://localhost:8080/swagger/index.html`
- **Grafana**: `http://localhost:3000` (default credentials: admin/admin)
- **Jaeger UI**: `http://localhost:16686`
- **Kafka UI**: `http://localhost:8090`

## Scaling

### Horizontal Scaling

The application is designed to scale horizontally:

- API service can be scaled to multiple instances
- Job services (collector, analyzer, notifier) can be scaled independently
- Use Kafka for messaging between components to ensure fault tolerance

### Vertical Scaling

- Adjust resource limits in Docker Compose or Kubernetes deployments
- For MongoDB, adjust WiredTiger cache size based on available RAM

## Backup and Recovery

### MongoDB Backup

1. Create a backup:

```bash
mongodump --uri="mongodb://localhost:27017" --db=invest_tracker --out=/backup
```

2. Restore from backup:

```bash
mongorestore --uri="mongodb://localhost:27017" --db=invest_tracker /backup/invest_tracker
```

## Troubleshooting

### Common Issues

1. **Connection refused to MongoDB**:
   - Check if MongoDB is running: `docker ps | grep mongodb`
   - Verify MongoDB connection string in .env

2. **API not starting**:
   - Check logs: `docker logs invest-tracker_api_1`
   - Verify port availability: `netstat -tulpn | grep 8080`

3. **Kafka connectivity issues**:
   - Check Kafka logs: `docker logs invest-tracker_kafka_1`
   - Verify topic creation: `docker exec -it invest-tracker_kafka_1 kafka-topics --bootstrap-server localhost:9092 --list`

## Maintenance

### Updating

1. Pull latest changes:

```bash
git pull origin main
```

2. Rebuild and restart:

```bash
make docker-compose
```

### Logs

View service logs:

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs api
```

## Security Considerations

1. **API Security**:
   - Use HTTPS in production
   - Implement authentication/authorization
   - Set appropriate CORS policies

2. **Database Security**:
   - Use strong MongoDB credentials
   - Enable MongoDB authentication
   - Network isolation through Docker networks

3. **Infrastructure Security**:
   - Kafka authentication and encryption
   - Restrict ports exposure
   - Regular security updates

## Contact and Support

For assistance with deployment or other issues:

- **Email**: support@systentando.com.br
- **GitHub Issues**: https://github.com/systentandobr/life-tracker/issues