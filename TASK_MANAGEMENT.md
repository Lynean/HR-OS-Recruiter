# Task Management Feature

## Overview

The Task Management system in HR-OS-Recruiter is a powerful AI-powered feature that helps managers break down complex HR tasks into manageable subtasks automatically. This feature saves managers significant time by leveraging Google Gemini AI to intelligently generate context-aware subtasks based on the main task description.

## Key Benefits

### For Managers
- **Save Time**: Generate comprehensive task breakdowns in seconds instead of spending minutes creating them manually
- **Consistency**: AI ensures all important steps are included based on industry best practices
- **Flexibility**: Choose from templates or create custom tasks with AI assistance
- **Visibility**: Track progress at both task and subtask levels
- **Prioritization**: Automatically get estimated hours and priority suggestions

### For the Organization
- **Standardization**: Consistent processes across all HR workflows
- **Knowledge Capture**: Best practices encoded in task templates
- **Metrics**: Track time estimates vs actuals, completion rates
- **Scalability**: Handle more candidates without proportional increase in management overhead

## Features

### 1. AI-Powered Subtask Generation

When you create a task, the system can automatically generate detailed subtasks using Google Gemini AI.

**How it works:**
1. You provide a task title and description
2. Select task type (Recruitment, Onboarding, Training, etc.)
3. Enable "Generate subtasks using AI"
4. AI analyzes the task and generates 3-10 actionable subtasks

**AI considers:**
- Task type and context
- Industry best practices
- Logical order of operations
- Dependencies between subtasks
- Estimated time for each subtask
- Required skills and resources
- Priority levels

**Example:**

**Input:**
```
Title: Onboard new software engineer
Type: ONBOARDING
Description: New senior developer starting next Monday
```

**AI-Generated Subtasks:**
1. Send welcome email with first day details (0.5h, HIGH priority)
2. Set up workstation and equipment (2h, HIGH priority)
3. Create system accounts and access credentials (1h, HIGH priority)
4. Schedule orientation sessions (1h, MEDIUM priority)
5. Assign mentor and schedule first meeting (0.5h, MEDIUM priority)
6. Prepare project onboarding documentation (2h, MEDIUM priority)
7. Schedule team introduction meeting (0.5h, LOW priority)
8. Complete employment paperwork (1h, HIGH priority)

### 2. Task Templates

Pre-configured templates for common HR processes that can be instantly created with or without AI enhancement.

**Available Templates:**
- Complete Recruitment Process
- Phone Screening Interview
- Technical Interview Preparation
- New Hire Onboarding
- First Week Onboarding
- Technical Skills Training
- Soft Skills Development
- Client Site Deployment
- Client Handover Process
- Quarterly Performance Review
- Annual Performance Evaluation
- Job Description Creation
- Post-Interview Follow-up
- Offer Status Check
- Client Satisfaction Survey

**Using Templates:**
1. Click "Use Template"
2. Select desired template
3. System creates task with appropriate settings
4. AI generates detailed subtasks (if template is AI-enhanced)

### 3. Task Management Dashboard

Comprehensive view of all tasks with:
- **Statistics**: Total, To-Do, In Progress, Completed, Overdue tasks
- **Completion Rate**: Track overall task completion percentage
- **Filters**: Filter by status, priority, candidate
- **Quick Actions**: Change status, generate subtasks, view details
- **Subtask Tracking**: See completion percentage for each main task

### 4. Task Types

- **RECRUITMENT**: Hiring process tasks
- **INTERVIEW_PREP**: Interview preparation and scheduling
- **ONBOARDING**: New hire onboarding processes
- **TRAINING**: Training program management
- **CLIENT_DEPLOYMENT**: Client site deployment tasks
- **KPI_REVIEW**: Performance review and KPI evaluation
- **DOCUMENTATION**: Documentation creation and updates
- **FOLLOW_UP**: Follow-up communications
- **GENERAL**: General tasks

### 5. Priority Levels

- **LOW**: Can be done when time permits
- **MEDIUM**: Normal priority, complete within reasonable timeframe
- **HIGH**: Important, should be completed soon
- **URGENT**: Critical, immediate attention required

### 6. Task Status

- **TODO**: Not yet started
- **IN_PROGRESS**: Currently being worked on
- **BLOCKED**: Cannot proceed due to dependencies
- **REVIEW**: Completed and awaiting review
- **COMPLETED**: Finished successfully
- **CANCELLED**: No longer needed

## API Endpoints

### Create Task with AI Subtasks
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Onboard new software engineer",
  "description": "Senior developer starting next Monday",
  "taskType": "ONBOARDING",
  "priority": "HIGH",
  "generateSubtasks": true,
  "createdBy": "user-id",
  "dueDate": "2024-01-15"
}
```

### Generate Subtasks for Existing Task
```http
POST /api/tasks/:taskId/generate-subtasks
Content-Type: application/json

{
  "userId": "user-id"
}
```

### Get User Tasks
```http
GET /api/tasks/user/:userId?status=TODO&priority=HIGH
```

### Update Task Status
```http
PATCH /api/tasks/:taskId/status
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "userId": "user-id"
}
```

### Get Task Statistics
```http
GET /api/tasks/statistics/summary?userId=user-id
```

### Get Task Templates
```http
GET /api/tasks/templates/all?taskType=ONBOARDING
```

### Create Task from Template
```http
POST /api/tasks/templates/:templateId/create-task
Content-Type: application/json

{
  "candidateId": "candidate-id",
  "assignedTo": "user-id",
  "createdBy": "user-id",
  "dueDate": "2024-01-15"
}
```

## Usage Examples

### Example 1: Recruitment Process

**Scenario**: New job opening for Senior Backend Developer

**Steps:**
1. Create task: "Fill Senior Backend Developer Position"
2. Select type: RECRUITMENT
3. Enable AI subtask generation
4. Assign to recruiter

**AI-Generated Breakdown:**
- Create and publish job description (2h)
- Screen incoming applications (4h)
- Schedule phone screenings with top 10 candidates (2h)
- Conduct technical assessments (8h)
- Coordinate on-site interviews (4h)
- Collect and consolidate feedback (2h)
- Make hiring decision and send offer (1h)
- Follow up on offer acceptance (0.5h)

**Time Saved**: 15-20 minutes of manual planning

### Example 2: Client Deployment

**Scenario**: Deploy consultant to client site

**Steps:**
1. Use template: "Client Site Deployment"
2. Link to candidate profile
3. AI generates customized subtasks

**AI-Generated Breakdown:**
- Gather client requirements and expectations (1h)
- Prepare candidate briefing document (2h)
- Schedule introduction meeting with client (0.5h)
- Arrange site access and credentials (1h)
- Brief candidate on client culture and expectations (1h)
- Conduct first-day check-in (0.5h)
- Schedule weekly follow-ups (0.5h)

**Time Saved**: 10-15 minutes of manual planning

### Example 3: Performance Review

**Scenario**: Quarterly performance review for 5 team members

**Steps:**
1. Create task: "Q1 Performance Reviews"
2. Select type: KPI_REVIEW
3. Generate subtasks

**AI-Generated Breakdown:**
- Collect performance data and metrics (2h)
- Review KPIs against targets (3h)
- Prepare individual feedback reports (5h)
- Schedule review meetings (1h)
- Conduct review meetings (5h)
- Update performance records (1h)
- Set Q2 goals and objectives (2h)

**Time Saved**: 20-25 minutes of manual planning

## Best Practices

### 1. Be Specific in Task Titles
❌ Bad: "Interview stuff"
✅ Good: "Conduct technical interview for Senior React Developer position"

### 2. Provide Context in Descriptions
❌ Bad: "Onboard new hire"
✅ Good: "Onboard senior software engineer with 8 years experience, remote position, starting next Monday"

### 3. Choose Appropriate Task Types
- Helps AI generate more relevant subtasks
- Improves organization and filtering
- Better analytics and reporting

### 4. Use Templates When Available
- Faster than creating from scratch
- Based on proven processes
- Consistent across team

### 5. Review AI-Generated Subtasks
- AI is good but not perfect
- Add missing steps specific to your context
- Adjust priorities and time estimates as needed

### 6. Update Task Status Regularly
- Keep team informed of progress
- Accurate metrics for reporting
- Better planning for future tasks

### 7. Track Actual vs Estimated Time
- Improves future estimates
- Identifies bottlenecks
- Better resource planning

## Database Schema

### Task Model
```typescript
{
  id: string
  title: string
  description?: string
  taskType: TaskType
  priority: Priority
  status: TaskStatus
  candidateId?: string
  assignedTo?: string
  createdBy: string
  parentTaskId?: string  // For subtasks
  dueDate?: Date
  startDate?: Date
  completedDate?: Date
  estimatedHours?: number
  actualHours?: number
  tags: string[]
  metadata: Json
  aiGenerated: boolean
  subtasks: Task[]
  comments: TaskComment[]
  attachments: TaskAttachment[]
}
```

### TaskTemplate Model
```typescript
{
  id: string
  name: string
  description: string
  taskType: TaskType
  category?: string
  defaultPriority: Priority
  estimatedHours?: number
  checklist: Json
  tags: string[]
  aiEnhanced: boolean
  usageCount: number
}
```

## Integration with Other Modules

### Candidates
- Link tasks to specific candidates
- View candidate-specific tasks
- Track candidate journey

### Workflow
- Automatic task creation for workflow events
- Interview scheduling → Create interview prep task
- Offer acceptance → Create onboarding task

### KPIs
- Task completion rates as KPIs
- Time-to-complete metrics
- Manager productivity tracking

### Reports
- Task analytics in dashboard
- Bottleneck identification
- Team productivity metrics

## Configuration

### Enable/Disable AI Generation
Set in task creation or template:
```typescript
{
  generateSubtasks: true,  // Enable AI
  aiEnhanced: true  // For templates
}
```

### Customize AI Behavior
Modify prompts in `backend/src/services/task.service.ts`:
- Adjust number of subtasks (currently 3-10)
- Change priority weighting
- Modify time estimation logic
- Customize for your organization's needs

### Add New Templates
Use the seeder or API:
```bash
# Run seeder
ts-node backend/src/seeders/taskTemplates.seeder.ts

# Or use API
POST /api/tasks/templates
```

## Performance Considerations

- **AI Generation**: Takes 2-5 seconds depending on complexity
- **Fallback**: If AI fails, uses default subtasks based on task type
- **Caching**: Consider caching common task patterns
- **Rate Limiting**: Google Gemini API has rate limits

## Future Enhancements

1. **Task Dependencies**: Visual dependency graph
2. **Gantt Charts**: Timeline visualization
3. **Task Automation**: Auto-create tasks based on triggers
4. **Recurring Tasks**: Support for recurring workflows
5. **Team Collaboration**: Real-time collaboration on tasks
6. **Mobile App**: Manage tasks on mobile devices
7. **Integrations**: Calendar, Slack, Microsoft Teams
8. **AI Learning**: Learn from your completions to improve suggestions
9. **Custom Templates**: Allow users to create their own templates
10. **Task Cloning**: Clone task structure for similar processes

## Troubleshooting

### AI Not Generating Subtasks
- Check GEMINI_API_KEY is set correctly
- Verify API quota hasn't been exceeded
- Check network connectivity
- Review logs for error messages

### Subtasks Not Showing
- Refresh the page
- Check if generateSubtasks was enabled
- Verify AI generation didn't fail (check logs)
- Look for subtasks under parent task

### Performance Issues
- Reduce number of tasks loaded at once
- Use filters to narrow down view
- Consider pagination for large task lists

## Support

For issues or questions:
- Check the SETUP.md for configuration
- Review API documentation
- Check server logs for errors
- Verify database migrations are complete

## Credits

- **AI Engine**: Google Gemini 1.5 Pro
- **Framework**: Node.js + Express + Prisma
- **Frontend**: React + TypeScript
