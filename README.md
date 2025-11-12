# HR-OS-Recruiter

A comprehensive HR Recruitment Operating System for managing the entire recruitment lifecycle.

## Features

### 1. CV Management & Filtering
- Upload and parse CVs (PDF, DOCX, TXT)
- Extract candidate information automatically
- Filter candidates based on criteria

### 2. CV-JD Matching
- AI-powered matching algorithm
- Score candidates against Job Descriptions
- Skill gap analysis
- Experience matching

### 3. Document & Email Templates
- Interview invitation emails
- Acceptance letters
- Onboarding documents
- Training schedules
- Outsourcing assignment letters

### 4. Candidate Workflow Management
- Interview scheduling and tracking
- Offer acceptance process
- Onboarding checklists
- Training program assignment
- Onsite deployment management

### 5. KPI Management
- Task assignment and tracking
- Performance metrics
- Goal setting and monitoring
- Individual and team KPIs

### 6. Reporting & Dashboard
- Real-time analytics
- Recruitment funnel visualization
- Time-to-hire metrics
- Source effectiveness
- Candidate pipeline status

## Technology Stack

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- PDF parsing (pdf-parse)
- Natural language processing

### Frontend
- React + TypeScript
- Material-UI / Ant Design
- Chart.js / Recharts
- Axios for API calls

### Template Engine
- Handlebars
- PDF generation (pdfkit)
- Email service (Nodemailer)

## Project Structure

```
HR-OS-Recruiter/
├── backend/              # Backend API server
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── models/       # Data models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Custom middleware
│   │   └── utils/        # Helper functions
│   ├── prisma/           # Database schema
│   └── uploads/          # Uploaded files
├── frontend/             # React frontend
│   └── src/
│       ├── components/   # Reusable components
│       ├── pages/        # Page components
│       ├── services/     # API services
│       └── utils/        # Helper functions
├── templates/            # Email & document templates
│   ├── email/
│   └── documents/
└── docs/                 # Documentation

```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd HR-OS-Recruiter
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd frontend
npm install
```

4. Set up environment variables
```bash
cp backend/.env.example backend/.env
# Edit .env with your configuration
```

5. Run database migrations
```bash
cd backend
npx prisma migrate dev
```

6. Start the backend server
```bash
cd backend
npm run dev
```

7. Start the frontend development server
```bash
cd frontend
npm start
```

## API Endpoints

### Candidates
- `POST /api/candidates` - Upload CV and create candidate
- `GET /api/candidates` - List all candidates
- `GET /api/candidates/:id` - Get candidate details
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

### Job Descriptions
- `POST /api/job-descriptions` - Create JD
- `GET /api/job-descriptions` - List all JDs
- `GET /api/job-descriptions/:id` - Get JD details
- `PUT /api/job-descriptions/:id` - Update JD

### Matching
- `POST /api/matching/score` - Score candidate against JD
- `GET /api/matching/candidates/:jdId` - Get matched candidates for JD

### Workflow
- `POST /api/workflow/interview` - Schedule interview
- `POST /api/workflow/accept` - Send acceptance letter
- `POST /api/workflow/onboarding` - Start onboarding process
- `POST /api/workflow/training` - Assign training
- `POST /api/workflow/outsource` - Assign to customer site

### KPIs
- `POST /api/kpis` - Create KPI
- `GET /api/kpis/candidate/:candidateId` - Get candidate KPIs
- `PUT /api/kpis/:id` - Update KPI

### Reports
- `GET /api/reports/dashboard` - Get dashboard data
- `GET /api/reports/funnel` - Get recruitment funnel
- `GET /api/reports/time-to-hire` - Get time-to-hire metrics

## License

MIT
