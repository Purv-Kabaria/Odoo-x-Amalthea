@echo off
REM Expensio Deployment Script for Windows
REM This script handles deployment for both development and production environments

setlocal enabledelayedexpansion

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Create necessary directories
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs
if not exist "ssl" mkdir ssl

REM Check for .env file
if not exist ".env" (
    if exist "env.example" (
        echo [WARNING] .env file not found. Creating from env.example...
        copy env.example .env
        echo [WARNING] Please edit .env file with your configuration before continuing.
        pause
    ) else (
        echo [ERROR] env.example file not found. Please create .env file manually.
        exit /b 1
    )
)

REM Main script logic
if "%1"=="dev" goto deploy_dev
if "%1"=="prod" goto deploy_prod
if "%1"=="stop" goto stop_services
if "%1"=="stop-prod" goto stop_services_prod
if "%1"=="logs" goto view_logs
if "%1"=="logs-prod" goto view_logs_prod
if "%1"=="cleanup" goto cleanup
goto show_help

:deploy_dev
echo [INFO] Deploying development environment...
docker-compose up -d --build
echo [SUCCESS] Development environment deployed successfully!
echo [INFO] Services available at:
echo   - Application: http://localhost:3000
echo   - MongoDB: mongodb://localhost:27017
echo   - Mongo Express: http://localhost:8081
goto end

:deploy_prod
echo [INFO] Deploying production environment...
docker-compose -f docker-compose.prod.yml up -d --build
echo [SUCCESS] Production environment deployed successfully!
echo [INFO] Services available at:
echo   - Application: http://localhost:3000
echo   - Nginx: http://localhost:80
echo   - MongoDB: mongodb://localhost:27017
goto end

:stop_services
echo [INFO] Stopping development services...
docker-compose down
echo [SUCCESS] Services stopped successfully!
goto end

:stop_services_prod
echo [INFO] Stopping production services...
docker-compose -f docker-compose.prod.yml down
echo [SUCCESS] Services stopped successfully!
goto end

:view_logs
echo [INFO] Viewing development logs...
docker-compose logs -f
goto end

:view_logs_prod
echo [INFO] Viewing production logs...
docker-compose -f docker-compose.prod.yml logs -f
goto end

:cleanup
echo [INFO] Cleaning up Docker resources...
docker-compose down -v --remove-orphans
docker-compose -f docker-compose.prod.yml down -v --remove-orphans
docker system prune -f
echo [SUCCESS] Cleanup completed!
goto end

:show_help
echo Expensio Deployment Script
echo.
echo Usage: %0 [COMMAND]
echo.
echo Commands:
echo   dev         Deploy development environment
echo   prod        Deploy production environment
echo   stop        Stop all services
echo   stop-prod   Stop production services
echo   logs        View logs (development)
echo   logs-prod   View logs (production)
echo   cleanup     Clean up Docker resources
echo   help        Show this help message
echo.
echo Examples:
echo   %0 dev      # Deploy development environment
echo   %0 prod     # Deploy production environment
echo   %0 stop     # Stop development services
echo   %0 logs     # View development logs
goto end

:end
