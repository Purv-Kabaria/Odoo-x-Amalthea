# Nodemailer Setup Guide for Amalthea

## 🔧 Environment Variables Setup

Create or update your `.env.local` file with the following variables:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Email Configuration (Gmail)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3001

# JWT Secret (if needed for other auth features)
JWT_SECRET=your_jwt_secret_key
```

## 📧 Gmail Setup Instructions

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click on "2-Step Verification"
3. Scroll down to "App passwords"
4. Click "App passwords"
5. Select "Mail" as the app
6. Select "Other" as the device and enter "Amalthea"
7. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update Environment Variables
```env
SMTP_USER=your_email@gmail.com
SMTP_PASS=abcdefghijklmnop  # Use the 16-character app password (no spaces)
```

## 🚀 Testing the Setup

### Test Email Configuration
The mailer will automatically verify the SMTP configuration on startup. Look for:
- ✅ `SMTP server is ready to take our messages` - Configuration is correct
- ❌ `SMTP configuration error:` - Check your credentials

### Test Forgot Password Flow
1. Go to `/login`
2. Click "Forgot your password?"
3. Enter a valid email address
4. Check your email for the reset link

## 🔍 Troubleshooting

### Common Issues:

1. **"Username and Password not accepted"**
   - Make sure you're using an App Password, not your regular Gmail password
   - Ensure 2-Factor Authentication is enabled
   - Check that the App Password is correct (16 characters, no spaces)

2. **"Less secure app access"**
   - This is deprecated. Use App Passwords instead.

3. **"Connection timeout"**
   - Check your internet connection
   - Verify firewall settings allow outbound SMTP connections

4. **"Invalid login"**
   - Double-check your email address and app password
   - Make sure there are no extra spaces in the environment variables

## 📁 Files Created/Modified

- ✅ `lib/mailer.ts` - Enhanced Nodemailer configuration
- ✅ `models/PasswordResetToken.ts` - MongoDB schema for reset tokens
- ✅ `app/api/auth/forgot-password/route.ts` - Forgot password API endpoint
- ✅ `app/api/auth/reset-password/route.ts` - Reset password API endpoint
- ✅ `app/(auth)/forgot-password/page.tsx` - Forgot password UI
- ✅ `app/(auth)/reset-password/page.tsx` - Reset password UI
- ✅ `app/(auth)/login/page.tsx` - Added forgot password link

## 🎯 Features Implemented

- ✅ Professional HTML email template
- ✅ Automatic token expiration (15 minutes)
- ✅ Secure password hashing with bcryptjs
- ✅ Input validation and error handling
- ✅ Responsive UI design
- ✅ TypeScript support with proper types
- ✅ MongoDB integration with TTL indexes
- ✅ One-time use tokens
