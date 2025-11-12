import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import candidateRoutes from './routes/candidate.routes';
import jobDescriptionRoutes from './routes/jobDescription.routes';
import matchingRoutes from './routes/matching.routes';
import workflowRoutes from './routes/workflow.routes';
import kpiRoutes from './routes/kpi.routes';
import reportRoutes from './routes/report.routes';
import templateRoutes from './routes/template.routes';
import authRoutes from './routes/auth.routes';
import geminiRoutes from './routes/gemini.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/job-descriptions', jobDescriptionRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/kpis', kpiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/gemini', geminiRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'HR-OS-Recruiter API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      candidates: '/api/candidates',
      jobDescriptions: '/api/job-descriptions',
      matching: '/api/matching',
      workflow: '/api/workflow',
      kpis: '/api/kpis',
      reports: '/api/reports',
      templates: '/api/templates',
      gemini: '/api/gemini'
    }
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✓ Database connected');

    app.listen(port, () => {
      console.log(`✓ Server running on port ${port}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
