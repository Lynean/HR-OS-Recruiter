# HR-OS-Recruiter Setup Guide

## Quick Start

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn
- Google Gemini API key (get from https://ai.google.dev/)

### Environment Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd HR-OS-Recruiter
```

2. **Set up the backend**

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your configuration:
# - DATABASE_URL: Your PostgreSQL connection string
# - GEMINI_API_KEY: Your Google Gemini API key
# - SMTP credentials for email functionality
```

3. **Initialize the database**

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view/edit database
npm run prisma:studio
```

4. **Start the backend server**

```bash
npm run dev
# Server will run on http://localhost:3001
```

5. **Set up the frontend**

```bash
cd ../frontend
npm install

# Create .env file for frontend
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env
```

6. **Start the frontend**

```bash
npm start
# Frontend will run on http://localhost:3000
```

## Configuration

### Backend Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hr_recruiter?schema=public"

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key-here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=HR Recruiter <noreply@hrrecruiter.com>

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# AI/Matching
MATCHING_THRESHOLD=0.6
```

### Creating PostgreSQL Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE hr_recruiter;

-- Create user (optional)
CREATE USER hr_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hr_recruiter TO hr_user;
```

## Initial Setup

### 1. Create First User

```bash
# Use the register endpoint
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword",
    "name": "Admin User",
    "role": "ADMIN"
  }'
```

### 2. Initialize Email Templates

```bash
curl -X POST http://localhost:3001/api/templates/initialize
```

### 3. Add Skills to Database (Optional)

```bash
curl -X POST http://localhost:3001/api/gemini/skills \
  -H "Content-Type: application/json" \
  -d '{
    "skillName": "JavaScript",
    "category": "Programming",
    "description": "JavaScript programming language",
    "relatedSkills": ["TypeScript", "Node.js", "React"]
  }'
```

## Usage Examples

### Upload a CV

```bash
curl -X POST http://localhost:3001/api/candidates/upload \
  -F "cv=@path/to/cv.pdf" \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "email=john.doe@example.com"
```

### Create a Job Description

```bash
curl -X POST http://localhost:3001/api/job-descriptions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Software Engineer",
    "department": "Engineering",
    "location": "Remote",
    "employmentType": "FULL_TIME",
    "description": "We are looking for a senior software engineer...",
    "requirements": "5+ years of experience with Node.js...",
    "responsibilities": "Design and develop scalable applications...",
    "requiredSkills": ["JavaScript", "Node.js", "React", "PostgreSQL"],
    "preferredSkills": ["TypeScript", "AWS", "Docker"],
    "minExperience": 5,
    "maxExperience": 10,
    "createdBy": "user-id-here"
  }'
```

### Match Candidate with Job

```bash
curl -X POST http://localhost:3001/api/matching/score \
  -H "Content-Type: application/json" \
  -d '{
    "candidateId": "candidate-id",
    "jobDescriptionId": "jd-id"
  }'
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Verify DATABASE_URL in .env file
- Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-14-main.log`

### Gemini API Issues

- Verify GEMINI_API_KEY is set correctly
- Check API quota: https://aistudio.google.com/app/apikey
- Ensure network connectivity to Google APIs

### Email Issues

- For Gmail, use App Password instead of regular password
- Enable "Less secure app access" if needed
- Check SMTP settings match your provider

### File Upload Issues

- Check UPLOAD_DIR exists and has write permissions
- Verify MAX_FILE_SIZE is appropriate
- Ensure file types are allowed in multer configuration

## Production Deployment

### Environment Preparation

1. Set NODE_ENV=production
2. Use strong JWT_SECRET
3. Configure production database
4. Set up HTTPS/SSL
5. Configure proper CORS settings
6. Set up file storage (S3, etc.)
7. Configure production email service

### Build Commands

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Serve the build folder with nginx or similar
```

## API Documentation

Once running, you can explore the API at:
- Base URL: http://localhost:3001/api
- Health check: http://localhost:3001/health

### Main Endpoints

- `/api/auth` - Authentication
- `/api/candidates` - Candidate management
- `/api/job-descriptions` - Job description management
- `/api/matching` - CV-JD matching
- `/api/workflow` - Workflow management
- `/api/kpis` - KPI tracking
- `/api/reports` - Analytics and reports
- `/api/templates` - Template management
- `/api/gemini` - AI features

## Support

For issues and questions:
- Check the README.md
- Review the API documentation
- Check server logs
- Verify environment configuration
