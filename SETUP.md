# 🚀 Expensio Setup Guide

This guide will help you set up Expensio on your machine, whether you're using Windows, macOS, or Linux.

## 📋 Prerequisites

### Required Software
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **MongoDB 6+** - [Download here](https://www.mongodb.com/try/download/community)
- **Docker & Docker Compose** - [Download here](https://www.docker.com/products/docker-desktop/)

### Optional Software
- **Git** - [Download here](https://git-scm.com/)
- **VS Code** - [Download here](https://code.visualstudio.com/)

## 🛠️ Installation Methods

### Method 1: Docker (Recommended)

#### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd expensio

# Copy environment file
cp env.example .env

# Edit .env file with your configuration
# Then run:
npm run deploy:dev
```

#### Manual Docker Commands
```bash
# Development
docker-compose up -d --build

# Production
docker-compose -f docker-compose.prod.yml up -d --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

### Method 2: Local Development

#### 1. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Or using pnpm (recommended)
pnpm install
```

#### 2. Setup Database
```bash
# Start MongoDB locally
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

#### 3. Configure Environment
```bash
# Copy environment file
cp env.example .env.local

# Edit .env.local with your settings
```

#### 4. Run Development Server
```bash
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/expensio

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# Optional: Google AI API for OCR functionality
GOOGLE_API_KEY=your-google-ai-api-key-here

# Optional: Production settings
NODE_ENV=development
```

### Database Setup

#### Using Docker (Recommended)
```bash
# Start MongoDB with Docker
docker run -d \
  --name expensio-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7.0
```

#### Using Local MongoDB
```bash
# Install MongoDB locally
# Then start the service
mongod --dbpath /path/to/your/db
```

## 🚀 Deployment Options

### Development Deployment
```bash
# Using npm scripts
npm run deploy:dev

# Using Docker Compose directly
docker-compose up -d --build

# Using deployment script (Linux/macOS)
./deploy.sh dev

# Using deployment script (Windows)
deploy.bat dev
```

### Production Deployment
```bash
# Using npm scripts
npm run deploy:prod

# Using Docker Compose directly
docker-compose -f docker-compose.prod.yml up -d --build

# Using deployment script (Linux/macOS)
./deploy.sh prod

# Using deployment script (Windows)
deploy.bat prod
```

## 🔍 Verification

### Check Services
```bash
# Check if containers are running
docker ps

# Check application health
curl http://localhost:3000/api/health

# Check MongoDB connection
docker exec -it expensio-mongodb mongosh
```

### Access Points
- **Application**: http://localhost:3000
- **Mongo Express**: http://localhost:8081 (development only)
- **MongoDB**: mongodb://localhost:27017

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

#### 2. Docker Issues
```bash
# Clean up Docker resources
docker system prune -f

# Remove all containers and volumes
docker-compose down -v --remove-orphans
```

#### 3. MongoDB Connection Issues
```bash
# Check MongoDB status
docker logs expensio-mongodb

# Restart MongoDB
docker restart expensio-mongodb
```

#### 4. Environment Variables
```bash
# Check if .env file exists
ls -la .env

# Verify environment variables
cat .env
```

### Logs and Debugging

#### View Application Logs
```bash
# Development
docker-compose logs -f app

# Production
docker-compose -f docker-compose.prod.yml logs -f app
```

#### View All Logs
```bash
# Development
docker-compose logs -f

# Production
docker-compose -f docker-compose.prod.yml logs -f
```

## 📊 Performance Optimization

### Production Optimizations
1. **Enable Gzip Compression** (already configured in nginx.conf)
2. **Set up SSL Certificates** in the `ssl/` directory
3. **Configure MongoDB Authentication**
4. **Set up Monitoring and Logging**
5. **Use a CDN for Static Assets**

### Resource Limits
The Docker Compose files include resource limits:
- **App**: 1GB memory limit, 512MB reservation
- **MongoDB**: 1GB memory limit, 512MB reservation
- **Nginx**: 256MB memory limit, 128MB reservation

## 🔒 Security Considerations

### Production Security
1. **Change Default Passwords**
2. **Use Strong JWT Secrets**
3. **Enable MongoDB Authentication**
4. **Set up SSL/TLS Certificates**
5. **Configure Firewall Rules**
6. **Regular Security Updates**

### Environment Security
```bash
# Generate strong secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For NEXTAUTH_SECRET
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🆘 Support

If you encounter any issues:
1. Check the logs: `docker-compose logs -f`
2. Verify your environment variables
3. Ensure all prerequisites are installed
4. Check the troubleshooting section above
5. Create an issue in the repository

---

**Happy Coding! 🚀**
