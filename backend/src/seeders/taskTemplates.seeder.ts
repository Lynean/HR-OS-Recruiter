import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const taskTemplates = [
  {
    name: 'Complete Recruitment Process',
    description: 'End-to-end recruitment for a new position',
    taskType: 'RECRUITMENT',
    category: 'Full Process',
    defaultPriority: 'HIGH',
    estimatedHours: 20,
    aiEnhanced: true,
    tags: ['recruitment', 'hiring', 'full-process'],
    checklist: []
  },
  {
    name: 'Phone Screening Interview',
    description: 'Conduct initial phone screening with candidate',
    taskType: 'INTERVIEW_PREP',
    category: 'Interview',
    defaultPriority: 'MEDIUM',
    estimatedHours: 2,
    aiEnhanced: true,
    tags: ['interview', 'screening', 'phone'],
    checklist: []
  },
  {
    name: 'Technical Interview Preparation',
    description: 'Prepare for technical interview assessment',
    taskType: 'INTERVIEW_PREP',
    category: 'Interview',
    defaultPriority: 'HIGH',
    estimatedHours: 3,
    aiEnhanced: true,
    tags: ['interview', 'technical', 'preparation'],
    checklist: []
  },
  {
    name: 'New Hire Onboarding',
    description: 'Complete onboarding process for new employee',
    taskType: 'ONBOARDING',
    category: 'Onboarding',
    defaultPriority: 'HIGH',
    estimatedHours: 16,
    aiEnhanced: true,
    tags: ['onboarding', 'new-hire', 'orientation'],
    checklist: []
  },
  {
    name: 'First Week Onboarding',
    description: 'First week orientation and setup for new hire',
    taskType: 'ONBOARDING',
    category: 'Onboarding',
    defaultPriority: 'URGENT',
    estimatedHours: 8,
    aiEnhanced: true,
    tags: ['onboarding', 'first-week', 'setup'],
    checklist: []
  },
  {
    name: 'Technical Skills Training',
    description: 'Organize technical skills training program',
    taskType: 'TRAINING',
    category: 'Training',
    defaultPriority: 'MEDIUM',
    estimatedHours: 40,
    aiEnhanced: true,
    tags: ['training', 'technical', 'upskilling'],
    checklist: []
  },
  {
    name: 'Soft Skills Development',
    description: 'Arrange soft skills and professional development training',
    taskType: 'TRAINING',
    category: 'Training',
    defaultPriority: 'MEDIUM',
    estimatedHours: 16,
    aiEnhanced: true,
    tags: ['training', 'soft-skills', 'development'],
    checklist: []
  },
  {
    name: 'Client Site Deployment',
    description: 'Deploy candidate to client site for outsourcing',
    taskType: 'CLIENT_DEPLOYMENT',
    category: 'Deployment',
    defaultPriority: 'HIGH',
    estimatedHours: 8,
    aiEnhanced: true,
    tags: ['client', 'deployment', 'outsourcing'],
    checklist: []
  },
  {
    name: 'Client Handover Process',
    description: 'Complete handover of candidate to client',
    taskType: 'CLIENT_DEPLOYMENT',
    category: 'Deployment',
    defaultPriority: 'HIGH',
    estimatedHours: 4,
    aiEnhanced: true,
    tags: ['client', 'handover', 'transition'],
    checklist: []
  },
  {
    name: 'Quarterly Performance Review',
    description: 'Conduct quarterly KPI review and assessment',
    taskType: 'KPI_REVIEW',
    category: 'Performance',
    defaultPriority: 'MEDIUM',
    estimatedHours: 3,
    aiEnhanced: true,
    tags: ['performance', 'review', 'quarterly'],
    checklist: []
  },
  {
    name: 'Annual Performance Evaluation',
    description: 'Complete annual performance evaluation process',
    taskType: 'KPI_REVIEW',
    category: 'Performance',
    defaultPriority: 'HIGH',
    estimatedHours: 5,
    aiEnhanced: true,
    tags: ['performance', 'annual', 'evaluation'],
    checklist: []
  },
  {
    name: 'Candidate Documentation Update',
    description: 'Update and organize candidate documentation',
    taskType: 'DOCUMENTATION',
    category: 'Admin',
    defaultPriority: 'LOW',
    estimatedHours: 2,
    aiEnhanced: false,
    tags: ['documentation', 'admin', 'records'],
    checklist: []
  },
  {
    name: 'Job Description Creation',
    description: 'Create new job description for open position',
    taskType: 'DOCUMENTATION',
    category: 'Recruitment',
    defaultPriority: 'MEDIUM',
    estimatedHours: 3,
    aiEnhanced: true,
    tags: ['job-description', 'recruitment', 'documentation'],
    checklist: []
  },
  {
    name: 'Post-Interview Follow-up',
    description: 'Follow up with candidate after interview',
    taskType: 'FOLLOW_UP',
    category: 'Communication',
    defaultPriority: 'MEDIUM',
    estimatedHours: 0.5,
    aiEnhanced: false,
    tags: ['follow-up', 'interview', 'communication'],
    checklist: []
  },
  {
    name: 'Offer Status Check',
    description: 'Check status of pending offer with candidate',
    taskType: 'FOLLOW_UP',
    category: 'Communication',
    defaultPriority: 'HIGH',
    estimatedHours: 0.5,
    aiEnhanced: false,
    tags: ['follow-up', 'offer', 'status-check'],
    checklist: []
  },
  {
    name: 'Client Satisfaction Survey',
    description: 'Conduct satisfaction survey with client',
    taskType: 'FOLLOW_UP',
    category: 'Client Relations',
    defaultPriority: 'MEDIUM',
    estimatedHours: 1,
    aiEnhanced: true,
    tags: ['follow-up', 'client', 'survey'],
    checklist: []
  }
];

export async function seedTaskTemplates() {
  console.log('Seeding task templates...');

  try {
    for (const template of taskTemplates) {
      await prisma.taskTemplate.upsert({
        where: { name: template.name },
        update: template,
        create: template
      });
    }

    console.log(`✓ ${taskTemplates.length} task templates seeded successfully`);
  } catch (error) {
    console.error('Error seeding task templates:', error);
    throw error;
  }
}

// Run seeder if executed directly
if (require.main === module) {
  seedTaskTemplates()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
