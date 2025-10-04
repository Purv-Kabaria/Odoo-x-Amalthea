#!/bin/bash

# Odoo x Amalthea Deployment Script
# This script handles deployment for both development and production environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="development"
CLEAN_BUILD=false
SKIP_TESTS=false
HELP=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show help
show_help() {
    echo "Odoo x Amalthea Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Set environment (development|production) [default: development]"
    echo "  -c, --clean             Clean build (remove existing containers and volumes)"
    echo "  -s, --skip-tests        Skip running tests"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Deploy development environment"
    echo "  $0 -e production                      # Deploy production environment"
    echo "  $0 -e production -c                  # Clean build production environment"
    echo "  $0 -e development -s                 # Deploy development without tests"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -c|--clean)
            CLEAN_BUILD=true
            shift
            ;;
        -s|--skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        -h|--help)
            HELP=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Show help if requested
if [ "$HELP" = true ]; then
    show_help
    exit 0
fi

# Validate environment
if [ "$ENVIRONMENT" != "development" ] && [ "$ENVIRONMENT" != "production" ]; then
    print_error "Invalid environment: $ENVIRONMENT. Must be 'development' or 'production'"
    exit 1
fi

print_status "Starting deployment for $ENVIRONMENT environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from env.example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        print_warning "Please edit .env file with your configuration before continuing."
        read -p "Press Enter to continue after editing .env file..."
    else
        print_error "env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

# Clean build if requested
if [ "$CLEAN_BUILD" = true ]; then
    print_status "Cleaning existing containers and volumes..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml down -v --remove-orphans
    else
        docker-compose down -v --remove-orphans
    fi
    
    print_success "Clean completed"
fi

# Run tests if not skipped
if [ "$SKIP_TESTS" = false ]; then
    print_status "Running tests..."
    
    # Check if pnpm is available
    if command -v pnpm &> /dev/null; then
        pnpm install
        pnpm run lint
        print_success "Tests completed successfully"
    else
        print_warning "pnpm not found. Skipping tests. Please run tests manually."
    fi
fi

# Build and start services
print_status "Building and starting services..."

if [ "$ENVIRONMENT" = "production" ]; then
    print_status "Deploying production environment..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Wait for services to be healthy
    print_status "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    if docker-compose -f docker-compose.prod.yml ps | grep -q "unhealthy"; then
        print_warning "Some services are unhealthy. Check logs with: docker-compose -f docker-compose.prod.yml logs"
    else
        print_success "All services are healthy"
    fi
    
    # Show service status
    print_status "Service status:"
    docker-compose -f docker-compose.prod.yml ps
    
    print_success "Production deployment completed!"
    print_status "Application is available at: http://localhost"
    print_status "Health check: http://localhost/health"
    
else
    print_status "Deploying development environment..."
    docker-compose up -d --build
    
    # Wait for services to be healthy
    print_status "Waiting for services to be healthy..."
    sleep 20
    
    # Check service health
    if docker-compose ps | grep -q "unhealthy"; then
        print_warning "Some services are unhealthy. Check logs with: docker-compose logs"
    else
        print_success "All services are healthy"
    fi
    
    # Show service status
    print_status "Service status:"
    docker-compose ps
    
    print_success "Development deployment completed!"
    print_status "Application is available at: http://localhost:3000"
    print_status "MongoDB Express is available at: http://localhost:8081"
    print_status "Health check: http://localhost:3000/api/health"
fi

# Show useful commands
print_status "Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart services: docker-compose restart"
echo "  View service status: docker-compose ps"

if [ "$ENVIRONMENT" = "production" ]; then
    echo "  Scale application: docker-compose -f docker-compose.prod.yml up -d --scale app=3"
fi

print_success "Deployment script completed successfully!"
