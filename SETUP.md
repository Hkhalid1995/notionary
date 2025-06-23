# Notionary Notes App - Authentication Setup Guide

This guide will help you set up proper Gmail authentication and user data storage for your notes app.

## Prerequisites

- Node.js 18+ installed
- A Google Cloud Console account
- Basic knowledge of Next.js and Prisma

## Step 1: Google OAuth Setup

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API

### 1.2 Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Notionary Notes"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users (your email addresses)

### 1.3 Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
5. Copy the Client ID and Client Secret

## Step 2: Environment Configuration

### 2.1 Update .env File

Replace the placeholder values in your `.env` file:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here-change-in-production"

# Google OAuth
GOOGLE_CLIENT_ID="your-actual-google-client-id"
GOOGLE_CLIENT_SECRET="your-actual-google-client-secret"
```

### 2.2 Generate NEXTAUTH_SECRET

For production, generate a secure secret:

```bash
openssl rand -base64 32
```

## Step 3: Database Setup

### 3.1 Initialize Database

The database is already configured with SQLite for development. For production, consider using PostgreSQL:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 3.2 Database Schema

The app includes the following models:
- **User**: Authentication and user profile data
- **Account**: OAuth provider accounts
- **Session**: User sessions
- **Workspace**: User workspaces for organizing notes
- **Group**: Note groups within workspaces
- **Note**: Individual notes with rich content

## Step 4: Features Implemented

### 4.1 Authentication Features

✅ **Google OAuth Integration**
- Secure Google sign-in
- Automatic user creation
- Profile data sync

✅ **Email/Password Authentication**
- User registration with password hashing
- Secure login with bcrypt
- Password validation

✅ **Session Management**
- JWT-based sessions
- Automatic session renewal
- Secure logout

### 4.2 Data Storage Features

✅ **User Data Isolation**
- All data is user-specific
- Automatic user association
- Secure data access

✅ **Workspace Management**
- Multiple workspaces per user
- Default workspace creation
- Workspace switching

✅ **Note Organization**
- Notes within workspaces
- Group organization
- Drag-and-drop functionality

✅ **Real-time Updates**
- API-based data persistence
- Optimistic UI updates
- Error handling

## Step 5: Security Features

### 5.1 Authentication Security

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure session management
- **CSRF Protection**: Built-in NextAuth protection
- **Input Validation**: Server-side validation

### 5.2 Data Security

- **User Isolation**: All queries filtered by user ID
- **Authorization Checks**: Server-side permission validation
- **SQL Injection Protection**: Prisma ORM protection
- **XSS Protection**: Content Security Policy

## Step 6: Running the Application

### 6.1 Development

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

### 6.2 Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Step 7: Testing the Setup

### 7.1 Test Google OAuth

1. Visit `http://localhost:3000`
2. Click "Sign up" or "Sign in"
3. Click "Continue with Google"
4. Complete Google OAuth flow
5. Verify you're redirected to dashboard

### 7.2 Test Email Registration

1. Go to `/auth/signup`
2. Fill in registration form
3. Submit and verify account creation
4. Test login with created account

### 7.3 Test Data Persistence

1. Create notes and workspaces
2. Refresh the page
3. Verify data persists
4. Test with different users

## Step 8: Production Deployment

### 8.1 Environment Variables

For production, update your environment variables:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret"
GOOGLE_CLIENT_ID="your-production-client-id"
GOOGLE_CLIENT_SECRET="your-production-client-secret"
```

### 8.2 Database Migration

For production databases:

```bash
npx prisma migrate deploy
```

### 8.3 Security Considerations

- Use HTTPS in production
- Set secure cookie options
- Implement rate limiting
- Add monitoring and logging
- Regular security updates

## Troubleshooting

### Common Issues

1. **Google OAuth Error**: Check redirect URIs in Google Console
2. **Database Connection**: Verify DATABASE_URL format
3. **Session Issues**: Ensure NEXTAUTH_SECRET is set
4. **CORS Errors**: Check NEXTAUTH_URL configuration

### Debug Mode

Enable debug logging by adding to `.env`:

```env
DEBUG=next-auth:*
```

## Support

For issues or questions:
1. Check the NextAuth.js documentation
2. Review Prisma documentation
3. Check browser console for errors
4. Verify environment variables

## Next Steps

Consider implementing:
- Email verification
- Password reset functionality
- Two-factor authentication
- Social login providers (GitHub, LinkedIn)
- Advanced user permissions
- Data export/import features 