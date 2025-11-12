# HR-OS-Recruiter Features

## Complete Feature List

### 1. CV Management & Filtering

#### CV Upload & Parsing
- **Multi-format Support**: PDF, DOC, DOCX, TXT
- **Automatic Text Extraction**: Parse CV content automatically
- **Google Gemini Integration**: Upload CVs to Gemini for semantic search
- **Structured Data Extraction**:
  - Contact information (email, phone)
  - Skills (technical, soft skills, tools, certifications)
  - Years of experience
  - Education background

#### Candidate Database
- Comprehensive candidate profiles
- Search and filter capabilities
- Status tracking (NEW, SCREENING, INTERVIEWED, OFFERED, ACCEPTED, etc.)
- Activity history

### 2. Job Description Management

- Create and manage job postings
- Define requirements and responsibilities
- Specify required and preferred skills
- Set experience range
- Track active/closed positions
- View candidate matches per JD

### 3. AI-Powered CV-JD Matching

#### Matching Algorithm
- **Hybrid Approach**: Combines traditional algorithms with AI
- **Google Gemini AI Analysis**: Deep semantic understanding
- **Multi-factor Scoring**:
  - Skill matching (50% weight)
  - Experience matching (30% weight)
  - Education matching (20% weight)

#### Matching Features
- Overall match score (0-100)
- Detailed breakdown by category
- AI-generated analysis and recommendations
- Skill gap identification
- Strength highlighting
- Batch matching (match all candidates with a JD)
- Top candidates ranking

### 4. Email & Document Templates

#### Template Types
- Interview invitations
- Interview confirmations
- Offer letters
- Acceptance letters
- Onboarding welcome emails
- Training assignments
- Outsourcing assignments
- KPI assignments

#### Template Features
- **Handlebars Template Engine**: Dynamic variable substitution
- **Email Sending**: Integrated SMTP support with Nodemailer
- **PDF Generation**: Create PDF documents from templates
- **Variable Support**: Customizable template variables
- **Template Management**: Create, update, and manage templates

### 5. Candidate Workflow Management

#### Interview Management
- Schedule interviews
- Automated email invitations
- Interview types: Phone Screen, Video, In-person, Technical, HR, Final
- Interview status tracking
- Feedback and rating collection
- Calendar integration-ready

#### Offer Management
- Send offer letters
- Track offer status (Pending, Accepted, Rejected, Negotiating)
- Response deadline tracking
- Automated email delivery
- Accept/reject workflow

#### Onboarding Process
- Start onboarding workflow
- Checklist management
- Document requirements tracking
- Progress monitoring
- Automated welcome emails
- Completion tracking

#### Training Assignment
- Assign training programs
- Track training progress
- Set start/end dates
- Completion rate monitoring
- Assessment recording
- Certificate management

### 6. Onsite Outsourcing Management

#### Client Assignment
- Assign candidates to client sites
- Project and role tracking
- Client contact management
- Assignment duration tracking
- Automated assignment emails
- Status monitoring (Assigned, Active, Completed, On-hold, Terminated)

#### Features
- Client information storage
- Project details
- Responsibility documentation
- Start/end date tracking
- Contact person management

### 7. KPI Management

#### KPI Creation & Tracking
- Define custom KPIs for candidates
- Set measurable targets
- Track current progress
- Automatic status calculation
- Multiple metric types supported

#### KPI Features
- Progress percentage calculation
- Status tracking (Not Started, In Progress, Completed, Overdue)
- Activity logging
- Candidate-level and system-level views
- KPI summary statistics
- Completion rate analytics

### 8. Reporting & Analytics

#### Dashboard
- Real-time statistics
- Total and active candidates
- Job description metrics
- Monthly interview count
- Monthly offers count
- Onboarding progress
- Recent activity feed
- Candidate status distribution

#### Recruitment Funnel
- Visualize candidate progression
- Stage-by-stage breakdown
- Conversion rate calculations
- Bottleneck identification

#### Time-to-Hire Metrics
- Average days to hire
- Individual hire tracking
- Historical trends
- Performance benchmarking

#### Interview Statistics
- Interview completion rates
- Interview types breakdown
- Cancellation tracking
- No-show monitoring
- Period-based filtering (week, month, year)

#### Source Effectiveness (Planned)
- Track recruitment sources
- Source conversion rates
- ROI analysis

### 9. Google Gemini AI Integration

#### File Search
- Upload CVs and JDs to Gemini
- Semantic search capabilities
- Store and search skills database
- Proposal generation from existing capabilities

#### AI Features
- **Skill Extraction**: Automatically extract skills from CV text
- **Similar Skill Search**: Find related skills and synonyms
- **CV-JD Matching**: Deep semantic matching analysis
- **Proposal Generation**: Generate client proposals based on:
  - Client requirements
  - Available skills in talent pool
  - Candidate profiles
  - Service type

#### Skill Database
- Centralized skill repository
- Skill categorization
- Related skills tracking
- Usage count monitoring
- Semantic search support

### 10. Template System

#### Email Templates
- Customizable email templates
- Variable substitution
- HTML formatting support
- Template versioning
- Template library

#### Document Templates
- Offer letter templates
- Contract templates
- Assignment letter templates
- PDF generation
- Variable support

### 11. Activity Tracking

- Complete audit trail
- Candidate-level activities
- User action tracking
- Timestamp recording
- Activity types:
  - CV uploads
  - Match generation
  - Interview scheduling
  - Offer management
  - Status changes
  - KPI updates

### 12. User Management

- Role-based access (Admin, Recruiter, Manager, HR Manager)
- JWT authentication
- Secure password hashing
- User activity tracking

## Technology Highlights

### Backend
- **Node.js + Express**: Fast, scalable API
- **TypeScript**: Type-safe development
- **Prisma ORM**: Type-safe database access
- **PostgreSQL**: Robust relational database
- **Google Gemini AI**: Advanced AI capabilities
- **Natural**: NLP processing
- **Handlebars**: Template engine
- **Nodemailer**: Email delivery
- **PDFKit**: PDF generation

### Frontend
- **React + TypeScript**: Modern UI framework
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Chart.js**: Data visualization
- **Responsive Design**: Mobile-friendly UI

### AI & ML
- **Google Gemini 1.5 Pro**: Advanced matching and analysis
- **File Search API**: Semantic search capabilities
- **Skill Extraction**: NLP-based skill identification
- **Proposal Generation**: AI-powered content creation

## Future Enhancements

- Calendar integration (Google Calendar, Outlook)
- Video interview integration (Zoom, Teams)
- Advanced analytics dashboards
- Mobile app
- Candidate portal
- Automated reference checks
- Background check integration
- Salary benchmarking
- Multi-language support
- Advanced reporting with export capabilities
- Integration with job boards
- ATS integration
- Chrome extension for LinkedIn parsing
