# Dockerfile for Invest Tracker API
FROM golang:1.23-alpine AS builder

# Set working directory
WORKDIR /app

# Copy go.mod and go.sum
COPY go.mod go.sum* ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o /invest-tracker-api ./cmd/api

# Final stage
FROM alpine:latest

# Add ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /invest-tracker-api .

# Environment variables
ENV PORT=8888
ENV MONGODB_URI=mongodb://mongodb:27017
ENV MONGODB_DATABASE=invest_tracker

# Expose port
EXPOSE 8888

# Run the application
CMD ["./invest-tracker-api"]
