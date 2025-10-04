#!/bin/bash

# Expensio Deployment Script
# This script handles deployment for both development and production environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "All prerequisites are met!"
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p uploads
    mkdir -p logs
    mkdir -p ssl
    
    print_success "Directories created successfully!"
}

# Function to check environment file
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from env.example..."
        if [ -f env.example ]; then
            cp env.example .env
            print_warning "Please edit .env file with your configuration before continuing."
            print_warning "Press Enter to continue after editing .env file..."
            read -r
        else
            print_error "env.example file not found. Please create .env file manually."
            exit 1
        fi
    fi
}

# Function to deploy development environment
deploy_dev() {
    print_status "Deploying development environment..."
    
    check_prerequisites
    create_directories
    check_env_file
    
    print_status "Starting development services..."
    docker-compose up -d --build
    
    print_success "Development environment deployed successfully!"
    print_status "Services available at:"
    print_status "  - Application: http://localhost:3000"
    print_status "  - MongoDB: mongodb://localhost:27017"
    print_status "  - Mongo Express: http://localhost:8081"
}

# Function to deploy production environment
deploy_prod() {
    print_status "Deploying production environment..."
    
    check_prerequisites
    create_directories
    check_env_file
    
    # Check for required environment variables
    if [ -z "$JWT_SECRET" ] || [ -z "$NEXTAUTH_SECRET" ] || [ -z "$MONGODB_URI" ]; then
        print_error "Required environment variables not set in .env file:"
        print_error "  - JWT_SECRET"
        print_error "  - NEXTAUTH_SECRET"
        print_error "  - MONGODB_URI"
        exit 1
    fi
    
    print_status "Starting production services..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
    print_success "Production environment deployed successfully!"
    print_status "Services available at:"
    print_status "  - Application: http://localhost:3000"
    print_status "  - Nginx: http://localhost:80"
    print_status "  - MongoDB: mongodb://localhost:27017"
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    
    if [ "$1" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml down
    else
        docker-compose down
    fi
    
    print_success "Services stopped successfully!"
}

# Function to view logs
view_logs() {
    if [ "$1" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml logs -f
    else
        docker-compose logs -f
    fi
}

# Function to clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    
    docker-compose down -v --remove-orphans
    docker-compose -f docker-compose.prod.yml down -v --remove-orphans
    
    print_status "Removing unused Docker resources..."
    docker system prune -f
    
    print_success "Cleanup completed!"
}

# Function to show help
show_help() {
    echo "Expensio Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev         Deploy development environment"
    echo "  prod        Deploy production environment"
    echo "  stop        Stop all services"
    echo "  stop-prod   Stop production services"
    echo "  logs        View logs (development)"
    echo "  logs-prod   View logs (production)"
    echo "  cleanup     Clean up Docker resources"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev      # Deploy development environment"
    echo "  $0 prod     # Deploy production environment"
    echo "  $0 stop     # Stop development services"
    echo "  $0 logs     # View development logs"
}

# Main script logic
case "${1:-help}" in
    dev)
        deploy_dev
        ;;
    prod)
        deploy_prod
        ;;
    stop)
        stop_services
        ;;
    stop-prod)
        stop_services prod
        ;;
    logs)
        view_logs
        ;;
    logs-prod)
        view_logs prod
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac