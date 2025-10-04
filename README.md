# Odoo x Amalthea - Expense Management System

A modern, full-stack expense management application built with Next.js 15, TypeScript, and MongoDB. This application provides comprehensive expense tracking, approval workflows, and AI-powered OCR capabilities for receipt processing.

## 👥 Team Details

- **Purv Kabaria (2027)** - purvkabaria@gmail.com
- **Jay Pipaliya (2027)** - jaypipaliya0101@gmail.com  
- **Chetan Kalsariya (2027)** - lost.alchemist69@gmail.com
- **Om Satodiya (2027)** - omsatodiya96@gmail.com

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**: Secure JWT-based authentication with role-based access control
- **Expense Management**: Create, track, and manage expense submissions with real-time status updates
- **AI-Powered OCR**: Automatic expense extraction from receipts using Google Gemini AI
- **Approval Workflows**: Configurable approval rules and multi-level approval processes
- **Admin Dashboard**: Comprehensive admin panel for user and system management
- **Multi-Organization Support**: Isolated data and workflows per organization
- **Manager Dashboard**: Dedicated interface for managers to review and approve expenses
- **Real-time Notifications**: Instant updates for expense submissions, approvals, and rejections

### User Roles
- **Admin**: Full system access, user management, approval rule configuration, system analytics
- **Manager**: Team oversight, expense approval capabilities, team analytics
- **Employee**: Expense submission, personal dashboard, expense history tracking

### Technical Features
- **Modern UI**: Built with Radix UI components and Tailwind CSS with custom design system
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Responsive Design**: Mobile-first, responsive interface that works on all devices
- **Real-time Updates**: Dynamic data updates without page refresh using React state management
- **File Upload**: Secure file handling for receipts and documents with validation
- **Dark Mode Support**: Automatic theme switching with CSS custom properties
- **Performance Optimized**: Next.js 15 with standalone output for optimal deployment

## 🏗️ Project Structure

```
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/               # Login page
│   │   └── signup/              # Registration page
│   ├── admin/                   # Admin-only routes
│   │   ├── dashboard/           # Admin dashboard with analytics
│   │   │   └── role-editor.tsx  # User role management component
│   │   ├── users/               # User management interface
│   │   ├── approvals/           # Approval rules management
│   │   │   └── edit/[id]/       # Edit approval rules
│   │   └── admin-approval/      # Admin approval interface
│   ├── dashboard/               # Main user dashboard
│   │   ├── dashboard-client.tsx # Client-side dashboard logic
│   │   └── expenses-client.tsx  # Expense management component
│   ├── manager/                 # Manager-specific routes
│   │   └── dashboard/           # Manager dashboard
│   ├── expenseSubmission/       # Expense submission form
│   ├── upload/                  # File upload interface
│   ├── api/                     # API routes
│   │   ├── users/              # User management API
│   │   │   └── [id]/           # Individual user operations
│   │   ├── expenses/           # Expense management API
│   │   ├── ocr/                # OCR processing API
│   │   ├── approval-rules/     # Approval rules API
│   │   │   └── [id]/           # Individual rule operations
│   │   ├── manager/            # Manager-specific APIs
│   │   │   └── approvals/      # Manager approval endpoints
│   │   │       └── [id]/       # Individual approval operations
│   │   │           ├── approve/ # Approve expense
│   │   │           └── reject/  # Reject expense
│   │   ├── countries/          # Country data API
│   │   └── health/             # Health check endpoint
│   └── actions/                 # Server actions
│       └── auth.ts             # Authentication actions
├── components/                   # Reusable UI components
│   ├── ui/                     # Base UI components (Radix UI)
│   ├── admin-approval/         # Admin-specific components
│   │   └── AdminApprovalForm.tsx
│   ├── home/                   # Landing page components
│   │   ├── background.tsx
│   │   ├── cta.tsx
│   │   ├── faq.tsx
│   │   ├── features.tsx
│   │   ├── hero.tsx
│   │   └── testimonials.tsx
│   └── layout/                 # Layout components
│       ├── footer.tsx
│       ├── loading.tsx
│       └── navbar.tsx
├── models/                      # MongoDB data models
│   ├── User.ts                 # User schema with role-based access
│   ├── Company.ts              # Company/Organization schema
│   ├── ApprovalRules.ts        # Approval workflow schema
│   ├── ApprovalRequest.ts      # Approval request tracking
│   └── expense.ts              # Expense data model
├── lib/                        # Utility libraries
│   ├── mongoose.ts             # Database connection management
│   ├── jwt.ts                  # JWT token handling and validation
│   ├── utils.ts                # General utilities and helpers
│   └── currencyUtils.ts        # Currency conversion utilities
├── constants/                   # Application constants
│   ├── home/                   # Homepage content constants
│   └── layout/                 # Layout-related constants
├── hooks/                      # Custom React hooks
│   └── use-mobile.ts           # Mobile detection hook
├── scripts/                    # Database migration and utility scripts
│   ├── migrate-approval-rules.js
│   ├── check-approval-rules.js
│   ├── clear-approval-rules.js
│   └── seed-approval-requests.js
├── public/                     # Static assets
│   └── images/                 # Application images and logos
├── docker-compose.yml          # Development Docker setup
├── docker-compose.prod.yml     # Production Docker setup
├── Dockerfile                  # Multi-stage Docker build
├── nginx.conf                  # Nginx reverse proxy configuration
└── env.example                 # Environment variables template
```

## 📊 Data Models

### User Model
```typescript
interface IUser {
  name: string;
  email: string;
  password: string;
  role: "admin" | "employee" | "manager";
  organization: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Company Model
```typescript
interface ICompany {
  name: string;
  adminId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Expense Model
```typescript
interface IExpense {
  expenseType: 'travel' | 'meal' | 'supplies' | 'software' | 'training' | 'other';
  amount: number;
  currency: {
    code: string;
    name: string;
    symbol?: string;
  };
  date: Date;
  description: string;
  receiptFile?: string;
  userId: ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  updatedAt: Date;
}
```

### Approval Rules Model
```typescript
interface IApprovalRule {
  organization: string;
  ruleName?: string;
  description?: string;
  appliesToUser?: ObjectId;
  manager?: ObjectId;
  isManagerApprover: boolean;
  approverSequence: boolean;
  minApprovalPercent: number;
  approvers: IApprover[];
  createdAt: Date;
}

interface IApprover {
  user: ObjectId;
  required: boolean;
  sequenceNo: number;
  autoApprove: boolean;
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login with JWT token generation
- `POST /api/auth/signup` - User registration with validation
- `POST /api/auth/logout` - User logout and token invalidation

### User Management
- `GET /api/users` - Get all users (admin only) with filtering
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user information
- `DELETE /api/users/[id]` - Delete user account

### Expense Management
- `POST /api/expenses` - Create new expense with validation
- `GET /api/expenses` - Get user expenses with filtering
- `PUT /api/expenses/[id]` - Update expense details
- `DELETE /api/expenses/[id]` - Delete expense

### OCR Processing
- `POST /api/ocr` - Process receipt image with Google Gemini AI

### Approval Rules
- `GET /api/approval-rules` - Get all approval rules
- `POST /api/approval-rules` - Create approval rule
- `GET /api/approval-rules/[id]` - Get specific rule
- `PUT /api/approval-rules/[id]` - Update approval rule
- `DELETE /api/approval-rules/[id]` - Delete approval rule

### Manager Operations
- `GET /api/manager/approvals` - Get pending approvals for manager
- `POST /api/manager/approvals/[id]/approve` - Approve expense
- `POST /api/manager/approvals/[id]/reject` - Reject expense

### Utility Endpoints
- `GET /api/countries` - Get country data for forms
- `GET /api/health` - Health check endpoint

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js 18+** (Recommended: Node.js 20 LTS)
- **pnpm** (recommended) or npm
- **MongoDB 7.0+** (Local or MongoDB Atlas)
- **Docker & Docker Compose** (for containerized setup)
- **Google Gemini API Key** (for OCR functionality)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Purv-Kabaria/Odoo-x-Amalthea
   cd odoo-x-amalthea
   ```

2. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application**
   ```bash
   # Development environment
   docker-compose up -d
   
   # Production environment
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Access the application**
   - **Application**: http://localhost:3000
   - **MongoDB Express**: http://localhost:8081 (admin/admin123)
   - **Health Check**: http://localhost:3000/api/health

### Option 2: Local Development Setup

1. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

2. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Create a database named `amalthea`
   - Ensure MongoDB is running on port 27017

3. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations** (optional)
   ```bash
   node scripts/migrate-approval-rules.js
   node scripts/seed-approval-requests.js
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Access the application**
   - **Application**: http://localhost:3000
   - **Health Check**: http://localhost:3000/api/health

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://admin:password123@localhost:27017/amalthea?authSource=admin

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Google Gemini AI API (for OCR functionality)
GEMINI_API_KEY=your-gemini-api-key-here

# Application Configuration
NODE_ENV=development
PORT=3000
HOSTNAME=0.0.0.0

# Optional: MongoDB Express Admin UI
MONGO_EXPRESS_USERNAME=admin
MONGO_EXPRESS_PASSWORD=admin123

# Production MongoDB (for docker-compose.prod.yml)
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-production-mongo-password
```

## 🐳 Docker Configuration

### Multi-Stage Dockerfile
The application uses a multi-stage Docker build for optimal performance:

- **deps**: Install dependencies with pnpm
- **builder**: Build the Next.js application
- **runner**: Production runtime with minimal footprint

### Docker Compose Services

#### Development (`docker-compose.yml`)
- **app**: Next.js application with hot reload
- **mongodb**: MongoDB 7.0 with persistent data
- **mongo-express**: Database admin UI (optional)

#### Production (`docker-compose.prod.yml`)
- **app**: Optimized Next.js application
- **mongodb**: MongoDB with security hardening
- **nginx**: Reverse proxy with rate limiting and security headers

### Docker Commands

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Clean up (remove volumes)
docker-compose down -v

# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Scale application (production)
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

### Docker Health Checks
The production setup includes health checks for:
- Application health endpoint
- Database connectivity
- Service availability

## 🚀 Deployment

### Production Deployment

1. **Update environment variables for production**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb://your-production-mongo-uri
   JWT_SECRET=your-production-jwt-secret
   GEMINI_API_KEY=your-production-gemini-key
   MONGO_ROOT_PASSWORD=your-secure-mongo-password
   ```

2. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Verify deployment**
   ```bash
   # Check service status
   docker-compose -f docker-compose.prod.yml ps
   
   # Check application health
   curl http://localhost:3000/api/health
   ```

### Environment-Specific Configurations

- **Development**: Local MongoDB, debug logging, hot reload
- **Production**: Optimized builds, production MongoDB, security headers, rate limiting

### Security Features
- **Rate Limiting**: API endpoints protected against abuse
- **Security Headers**: XSS protection, content type validation
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive data validation and sanitization
- **CORS Protection**: Configured for production security

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server with hot reload
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint for code quality

# Database Management
node scripts/migrate-approval-rules.js    # Migrate approval rules
node scripts/check-approval-rules.js      # Check approval rules status
node scripts/clear-approval-rules.js      # Clear approval rules
node scripts/seed-approval-requests.js    # Seed sample approval requests
```

### Code Structure Guidelines

- **Components**: Reusable UI components in `/components`
- **Pages**: Route components in `/app` using Next.js App Router
- **API Routes**: Backend logic in `/app/api`
- **Models**: Database schemas in `/models`
- **Utils**: Helper functions in `/lib`
- **Constants**: Application constants in `/constants`
- **Hooks**: Custom React hooks in `/hooks`

### Design System
The application uses a comprehensive design system with:
- **CSS Custom Properties**: For consistent theming and dark mode support
- **Tailwind CSS**: For utility-first styling
- **Radix UI**: For accessible component primitives
- **Lucide React**: For consistent iconography

## 🔒 Security Features

- **JWT-based Authentication**: Secure token-based authentication with configurable expiration
- **Password Hashing**: bcrypt for secure password storage
- **Role-based Access Control**: Granular permissions for different user types
- **Input Validation**: Comprehensive validation using Zod schemas
- **CORS Protection**: Configured for cross-origin request security
- **Rate Limiting**: API endpoints protected against abuse
- **Security Headers**: XSS protection, content type validation, frame options
- **Secure File Upload**: Validated file handling for receipts and documents
- **Environment Variable Protection**: Sensitive data stored in environment variables

## 📈 Performance Features

- **Next.js 15**: Latest Next.js with App Router for optimal performance
- **Standalone Output**: Optimized Docker builds with minimal runtime
- **Image Optimization**: Next.js Image component for optimized images
- **Code Splitting**: Automatic code splitting for faster page loads
- **Caching**: Strategic caching for API responses and static assets
- **Database Indexing**: Optimized MongoDB queries with proper indexing

## 🆘 Support

For support, email purvkabaria@gmail.com.

---

**Built with ❤️ by the Businessmen**