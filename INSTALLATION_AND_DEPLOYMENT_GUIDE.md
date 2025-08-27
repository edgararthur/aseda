# Installation and Deployment Guide - ASEDA Accounting System

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Development Environment Setup](#development-environment-setup)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: Latest version
- **Modern Web Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

### Development Tools (Recommended)
- **Visual Studio Code**: With TypeScript and React extensions
- **Postman**: For API testing
- **Git Client**: GitHub Desktop or command line

### Supabase Account
- Create a free account at [supabase.com](https://supabase.com)
- Create a new project for ASEDA

## Development Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/aseda-accounting.git
cd aseda-accounting
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify Installation
```bash
npm run dev --version
node --version
npm --version
```

## Database Setup

### 1. Supabase Project Setup
1. Log in to your Supabase dashboard
2. Create a new project
3. Wait for the project to be fully provisioned
4. Note down your project URL and API keys

### 2. Database Migration
Navigate to the SQL editor in your Supabase dashboard and run the migration file:

```sql
-- Run the complete production schema
-- Copy and paste the contents of:
-- supabase/migrations/20250110000000_complete_production_schema.sql
```

### 3. Enable Row Level Security
Ensure RLS is enabled on all tables:
```sql
-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 4. Set Up Storage Buckets
In Supabase Storage, create the following buckets:
- `invoices` - For invoice PDFs
- `receipts` - For receipt images
- `documents` - For general documents
- `logos` - For organization logos

## Environment Configuration

### 1. Create Environment File
Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Application Configuration
VITE_APP_NAME=ASEDA Accounting
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# Optional: Analytics and Monitoring
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
```

### 2. Environment Variables Explanation

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_APP_NAME` | Application display name | No |
| `VITE_APP_VERSION` | Application version | No |
| `VITE_APP_ENV` | Environment (development/production) | No |

### 3. Security Configuration
Never commit sensitive keys to version control. Use environment variables for:
- Database credentials
- API keys
- Secret tokens
- Third-party service keys

## Running the Application

### 1. Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### 2. Build for Production
```bash
npm run build
```

### 3. Preview Production Build
```bash
npm run preview
```

### 4. Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 5. Linting and Code Quality
```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Type checking
npm run type-check
```

## Production Deployment

### Option 1: Vercel Deployment

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Deploy to Vercel
```bash
vercel
```

#### 3. Configure Environment Variables
In Vercel dashboard, add environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_ENV=production`

#### 4. Custom Domain (Optional)
1. Add your domain in Vercel dashboard
2. Configure DNS settings
3. SSL certificate is automatically provisioned

### Option 2: Netlify Deployment

#### 1. Build Settings
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Deploy via Git
1. Connect your GitHub repository
2. Configure build settings
3. Add environment variables
4. Deploy automatically on push

### Option 3: Docker Deployment

#### 1. Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Docker Compose
```yaml
version: '3.8'
services:
  aseda-frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
```

#### 3. Deploy with Docker
```bash
docker-compose up -d
```

### Option 4: Traditional Web Server

#### 1. Build the Application
```bash
npm run build
```

#### 2. Server Configuration
For Apache, create `.htaccess` in the `dist` folder:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

For Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Database Migration in Production

### 1. Backup Existing Data
```sql
-- Create backup
pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Run Migrations
```bash
# Using Supabase CLI
npx supabase db push --linked

# Or manually in SQL editor
-- Run migration files in order
```

### 3. Verify Migration
```sql
-- Check table structure
\dt public.*

-- Verify data integrity
SELECT COUNT(*) FROM organizations;
SELECT COUNT(*) FROM profiles;
```

## Monitoring and Health Checks

### 1. Application Health Check
Create a health check endpoint:
```typescript
// src/api/health.ts
export const healthCheck = async () => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);
    
    return { status: 'healthy', database: !error };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};
```

### 2. Performance Monitoring
```typescript
// Performance monitoring
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});
observer.observe({ entryTypes: ['navigation', 'resource'] });
```

### 3. Error Tracking
```typescript
// Error boundary for React
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Application error:', error, errorInfo);
    // Send to error tracking service
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
**Issue**: `npm run build` fails
**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. Environment Variables Not Loading
**Issue**: Environment variables are undefined
**Solution**:
- Ensure variables start with `VITE_`
- Restart development server after changes
- Check `.env.local` file location

#### 3. Database Connection Issues
**Issue**: Cannot connect to Supabase
**Solution**:
- Verify Supabase URL and keys
- Check network connectivity
- Ensure RLS policies are correct

#### 4. Authentication Problems
**Issue**: Users cannot log in
**Solution**:
```typescript
// Check auth configuration
const { data, error } = await supabase.auth.getSession();
console.log('Auth session:', data, error);
```

#### 5. Performance Issues
**Issue**: Slow page loads
**Solution**:
- Enable code splitting
- Optimize images
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

### Debug Mode
Enable debug mode for detailed logging:
```bash
# Development
VITE_DEBUG=true npm run dev

# Check console for detailed logs
```

### Log Analysis
```typescript
// Custom logging
const logger = {
  debug: (message: string, data?: any) => {
    if (import.meta.env.VITE_DEBUG) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
  }
};
```

## Maintenance

### 1. Regular Updates
```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Update major versions carefully
npm install package@latest
```

### 2. Security Updates
```bash
# Audit for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### 3. Database Maintenance
```sql
-- Regular maintenance queries
VACUUM ANALYZE;
REINDEX DATABASE your_database;

-- Check database size
SELECT pg_size_pretty(pg_database_size('your_database'));
```

### 4. Backup Strategy
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump your_database > backups/backup_$DATE.sql
find backups/ -name "backup_*.sql" -mtime +30 -delete
```

### 5. Performance Monitoring
```bash
# Monitor application metrics
npm run build:analyze

# Check bundle size
npx webpack-bundle-analyzer dist/static/js/*.js
```

## Support and Documentation

### Getting Help
- **Documentation**: Check this guide and inline code comments
- **Issues**: Create GitHub issues for bugs and feature requests
- **Community**: Join our Discord/Slack community
- **Email**: support@aseda-accounting.com

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### License
This project is licensed under the MIT License. See LICENSE file for details.
