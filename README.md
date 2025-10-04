# Odoo x Amalthea - Expense Management System

A modern, full-stack expense management application built with Next.js 15, TypeScript, and MongoDB. This application provides comprehensive expense tracking, approval workflows, and AI-powered OCR capabilities for receipt processing.

# Team Details

Purv Kabaria (2027) - purvkabaria@gmail.com
Jay Pipaliya (2027) - jaypipaliya0101@gmail.com
Chetan Kalsariya (2027)- lost.alchemist69@gmail.com
Om Satodiya (2027) - omsatodiya96@gmail.com

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**: Secure JWT-based authentication with role-based access control
- **Expense Management**: Create, track, and manage expense submissions
- **AI-Powered OCR**: Automatic expense extraction from receipts using Google Gemini AI
- **Approval Workflows**: Configurable approval rules and multi-level approval processes
- **Admin Dashboard**: Comprehensive admin panel for user and system management
- **Multi-Organization Support**: Isolated data and workflows per organization

### User Roles
- **Admin**: Full system access, user management, approval rule configuration
- **Manager**: Team oversight, approval capabilities
- **Employee**: Expense submission, personal dashboard

### Technical Features
- **Modern UI**: Built with Radix UI components and Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-first, responsive interface
- **Real-time Updates**: Dynamic data updates without page refresh
- **File Upload**: Secure file handling for receipts and documents

## 🏗️ Project Structure

```
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/               # Login page
│   │   └── signup/              # Registration page
│   ├── admin/                   # Admin-only routes
│   │   ├── dashboard/           # Admin dashboard
│   │   ├── users/               # User management
│   │   ├── approvals/           # Approval management
│   │   └── admin-approval/      # Admin approval interface
│   ├── dashboard/               # Main user dashboard
│   ├── expenseSubmission/       # Expense submission form
│   ├── upload/                  # File upload interface
│   ├── api/                     # API routes
│   │   ├── users/              # User management API
│   │   ├── expenses/           # Expense management API
│   │   ├── ocr/                # OCR processing API
│   │   └── approval-rules/     # Approval rules API
│   └── actions/                 # Server actions
├── components/                   # Reusable UI components
│   ├── ui/                     # Base UI components (Radix UI)
│   ├── admin-approval/         # Admin-specific components
│   ├── home/                   # Landing page components
│   └── layout/                 # Layout components
├── models/                      # MongoDB data models
│   ├── User.ts                 # User schema
│   ├── Company.ts              # Company/Organization schema
│   └── ApprovalRules.ts        # Approval workflow schema
├── lib/                        # Utility libraries
│   ├── mongoose.ts             # Database connection
│   ├── jwt.ts                  # JWT token handling
│   └── utils.ts                # General utilities
├── constants/                   # Application constants
├── hooks/                      # Custom React hooks
├── scripts/                    # Database migration scripts
└── public/                     # Static assets
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
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Expense Management
- `POST /api/expenses` - Create new expense
- `GET /api/expenses` - Get user expenses
- `PUT /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense

### OCR Processing
- `POST /api/ocr` - Process receipt image with AI

### Approval Rules
- `GET /api/approval-rules` - Get all approval rules
- `POST /api/approval-rules` - Create approval rule
- `GET /api/approval-rules/[id]` - Get specific rule
- `PUT /api/approval-rules/[id]` - Update approval rule
- `DELETE /api/approval-rules/[id]` - Delete approval rule

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- MongoDB 7.0+
- Docker & Docker Compose (for containerized setup)

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
   docker-compose up -d
   ```

4. **Access the application**
   - Application: http://localhost:3000
   - MongoDB Express: http://localhost:8081 (admin/admin123)

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

3. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations** (optional)
   ```bash
   node scripts/migrate-users.js
   node scripts/migrate-approval-rules.js
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Access the application**
   - Application: http://localhost:3000

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
```

## 🐳 Docker Configuration

### Dockerfile
The application uses a multi-stage Docker build:
- **deps**: Install dependencies
- **builder**: Build the application
- **runner**: Production runtime

### Docker Compose Services
- **app**: Next.js application
- **mongodb**: MongoDB database
- **mongo-express**: Database admin UI (optional)

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
```

## 🚀 Deployment

### Production Deployment

1. **Update environment variables for production**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb://your-production-mongo-uri
   JWT_SECRET=your-production-jwt-secret
   GEMINI_API_KEY=your-production-gemini-key
   ```

2. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment-Specific Configurations

- **Development**: Uses local MongoDB, debug logging
- **Production**: Optimized builds, production MongoDB, security headers

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Database
node scripts/migrate-users.js           # Migrate user data
node scripts/migrate-approval-rules.js  # Migrate approval rules
node scripts/check-approval-rules.js    # Check approval rules
node scripts/clear-approval-rules.js    # Clear approval rules
```

### Code Structure Guidelines

- **Components**: Reusable UI components in `/components`
- **Pages**: Route components in `/app`
- **API Routes**: Backend logic in `/app/api`
- **Models**: Database schemas in `/models`
- **Utils**: Helper functions in `/lib`

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS protection
- Secure file upload handling