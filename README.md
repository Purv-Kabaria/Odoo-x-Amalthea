# 🚀 Expensio - Enterprise Expense Management System

A modern, full-stack expense management system built with Next.js 15, TypeScript, and MongoDB. Features role-based access control, OCR integration, multi-currency support, and advanced approval workflows.

## ✨ Features

### 🏢 **Multi-Company Support**
- Company-specific currency detection based on admin location
- Isolated data per organization
- Custom approval rules per company

### 👥 **Role-Based Access Control**
- **Admin**: Full system access, user management, approval rule creation
- **Manager**: Expense approval, team oversight, dashboard analytics
- **Employee**: Expense submission, personal dashboard

### 💰 **Advanced Expense Management**
- Multi-currency support with real-time conversion
- OCR integration for automatic receipt processing
- Receipt image upload and processing
- Category-based expense classification

### ✅ **Smart Approval Workflows**
- Sequential approval processes
- Threshold-based approval percentages
- Manager comments and feedback
- Approval progress tracking

### 🔒 **Security & Authentication**
- JWT-based authentication
- Role-based route protection
- Secure file uploads
- Environment-based configuration

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Next.js API Routes, Server Actions
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with jose library
- **OCR**: Google Generative AI (Gemini)
- **Deployment**: Docker, Docker Compose, Nginx

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- Docker & Docker Compose (optional)

### 1. Clone & Install
```bash
git clone <repository-url>
cd expensio
npm install
```

### 2. Environment Setup
```bash
cp env.example .env.local
# Edit .env.local with your configuration
```

### 3. Database Setup
```bash
# Start MongoDB (if not using Docker)
mongod

# Or use Docker
docker-compose up -d mongodb
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Services
- **App**: Next.js application (port 3000)
- **MongoDB**: Database (port 27017)
- **Mongo Express**: Database admin (port 8081)
- **Nginx**: Reverse proxy (port 80)

## 📁 Project Structure

```
expensio/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   ├── admin/                    # Admin panel
│   ├── api/                      # API routes
│   ├── dashboard/                # User dashboard
│   ├── manager/                  # Manager dashboard
│   └── expenseSubmission/        # Expense form
├── components/                   # Reusable components
│   ├── ui/                       # UI components
│   ├── layout/                   # Layout components
│   └── admin-approval/           # Admin-specific components
├── lib/                          # Utility libraries
├── models/                       # MongoDB schemas
├── constants/                    # Application constants
├── hooks/                        # Custom React hooks
├── middleware.ts                 # Route protection
├── docker-compose.yml           # Development Docker setup
├── docker-compose.prod.yml      # Production Docker setup
└── Dockerfile                   # Application container
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | ✅ | - |
| `JWT_SECRET` | JWT signing secret | ✅ | - |
| `NEXTAUTH_SECRET` | NextAuth secret | ✅ | - |
| `NEXTAUTH_URL` | Application URL | ✅ | http://localhost:3000 |
| `GOOGLE_API_KEY` | Google AI API key for OCR | ❌ | - |

### Database Models

- **User**: User accounts with roles and organizations
- **Company**: Company information and default currency
- **Expense**: Expense records with approval tracking
- **ApprovalRule**: Custom approval workflows
- **ApprovalRequest**: Approval request tracking

## 🎯 Usage Guide

### For Employees
1. **Submit Expenses**: Navigate to "Submit Expense" to create new expense reports
2. **View Dashboard**: Check your expense history and approval status
3. **OCR Processing**: Upload receipt images for automatic data extraction

### For Managers
1. **Approve Expenses**: Review and approve/reject expense requests
2. **Add Comments**: Provide feedback on expense decisions
3. **Track Progress**: Monitor approval workflows and team expenses

### For Admins
1. **User Management**: Create and manage user accounts
2. **Approval Rules**: Configure custom approval workflows
3. **System Oversight**: Monitor system usage and performance

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

### Expenses
- `GET /api/expenses` - Get user expenses
- `POST /api/expenses` - Create new expense
- `GET /api/manager/approvals` - Get approval requests

### OCR Processing
- `POST /api/ocr` - Process receipt images

### Health Check
- `GET /api/health` - System health status

## 🚀 Deployment

### Production Checklist
- [ ] Set secure environment variables
- [ ] Configure MongoDB with authentication
- [ ] Set up SSL certificates
- [ ] Configure Nginx for production
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

### Docker Production
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Code Quality
- **ESLint**: Code linting and formatting
- **TypeScript**: Type safety and error checking
- **Prettier**: Code formatting (if configured)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Granular permission system
- **Route Protection**: Middleware-based route security
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Mongoose ODM protection
- **XSS Protection**: React's built-in XSS protection

## 📊 Performance Features

- **Server-Side Rendering**: Next.js SSR for better performance
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic code splitting
- **Caching**: Nginx caching for static assets
- **Database Indexing**: Optimized MongoDB queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🏆 Built With

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - Component library
- [MongoDB](https://www.mongodb.com/) - Database
- [Docker](https://www.docker.com/) - Containerization

---

**Made with ❤️ by the Expensio Team**