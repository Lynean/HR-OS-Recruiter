import { PrismaClient, TaskType, Priority, TaskStatus } from '@prisma/client';
import geminiService from './gemini.service';

const prisma = new PrismaClient();

export class TaskService {
  /**
   * Create a task with AI-generated subtasks
   */
  async createTaskWithSubtasks(data: {
    title: string;
    description?: string;
    taskType: TaskType;
    priority?: Priority;
    candidateId?: string;
    assignedTo?: string;
    createdBy: string;
    dueDate?: Date;
    generateSubtasks?: boolean;
    tags?: string[];
  }) {
    try {
      // Create the main task
      const mainTask = await prisma.task.create({
        data: {
          title: data.title,
          description: data.description,
          taskType: data.taskType,
          priority: data.priority || 'MEDIUM',
          status: 'TODO',
          candidateId: data.candidateId,
          assignedTo: data.assignedTo,
          createdBy: data.createdBy,
          dueDate: data.dueDate,
          tags: data.tags || [],
          metadata: {}
        }
      });

      // Generate subtasks using AI if requested
      if (data.generateSubtasks) {
        const subtasks = await this.generateSubtasks(
          mainTask.id,
          data.title,
          data.description || '',
          data.taskType,
          data.createdBy
        );

        return {
          ...mainTask,
          subtasks
        };
      }

      return mainTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  /**
   * Generate subtasks using AI
   */
  async generateSubtasks(
    parentTaskId: string,
    taskTitle: string,
    taskDescription: string,
    taskType: TaskType,
    createdBy: string
  ) {
    try {
      const subtasksData = await this.generateSubtasksWithAI(
        taskTitle,
        taskDescription,
        taskType
      );

      // Create subtasks in database
      const subtasks = [];
      for (const subtaskData of subtasksData) {
        const subtask = await prisma.task.create({
          data: {
            title: subtaskData.title,
            description: subtaskData.description,
            taskType: taskType,
            priority: subtaskData.priority as Priority,
            status: 'TODO',
            parentTaskId: parentTaskId,
            createdBy: createdBy,
            estimatedHours: subtaskData.estimatedHours,
            tags: subtaskData.tags || [],
            aiGenerated: true,
            metadata: subtaskData.metadata || {}
          }
        });
        subtasks.push(subtask);
      }

      // Log activity
      await prisma.activity.create({
        data: {
          userId: createdBy,
          activityType: 'STATUS_CHANGED',
          description: `Generated ${subtasks.length} subtasks using AI for "${taskTitle}"`,
          metadata: { parentTaskId, subtaskCount: subtasks.length }
        }
      });

      return subtasks;
    } catch (error) {
      console.error('Error generating subtasks:', error);
      return [];
    }
  }

  /**
   * Use Gemini AI to generate subtask breakdown
   */
  private async generateSubtasksWithAI(
    taskTitle: string,
    taskDescription: string,
    taskType: TaskType
  ): Promise<any[]> {
    try {
      const prompt = `
You are an expert HR manager and project manager. Break down the following task into detailed, actionable subtasks.

MAIN TASK: ${taskTitle}
DESCRIPTION: ${taskDescription}
TASK TYPE: ${taskType}

Generate a comprehensive list of subtasks that would help complete this main task efficiently.
Consider the HR context and include all necessary steps.

Return your response as a JSON array with the following structure:
[
  {
    "title": "<subtask title>",
    "description": "<detailed description>",
    "priority": "<LOW|MEDIUM|HIGH|URGENT>",
    "estimatedHours": <number>,
    "tags": ["<tag1>", "<tag2>"],
    "metadata": {
      "order": <sequence number>,
      "dependencies": ["<task title>"],
      "skillsRequired": ["<skill1>", "<skill2>"]
    }
  }
]

Guidelines:
- Create 3-10 subtasks depending on complexity
- Make subtasks specific and actionable
- Assign appropriate priority levels
- Provide realistic time estimates
- Include relevant tags
- Order tasks logically (use order field)
- Identify dependencies between tasks
- Consider the candidate's journey through recruitment/onboarding

Examples of good subtasks for different task types:

RECRUITMENT:
- "Review and screen CVs against job requirements"
- "Schedule initial phone screening calls"
- "Prepare interview questions and evaluation criteria"

INTERVIEW_PREP:
- "Research candidate background and experience"
- "Prepare technical assessment materials"
- "Coordinate with interview panel members"

ONBOARDING:
- "Send welcome email with first day details"
- "Set up workstation and equipment"
- "Schedule orientation sessions"

CLIENT_DEPLOYMENT:
- "Prepare client introduction materials"
- "Brief candidate on client expectations"
- "Arrange site visit or kickoff meeting"

Be thorough and professional. Generate the JSON array now.
`;

      const response = await geminiService.generateContent(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
        const subtasks = JSON.parse(jsonMatch[0]);
        return subtasks;
      }

      // Fallback to basic subtasks if AI fails
      return this.getDefaultSubtasks(taskType);
    } catch (error) {
      console.error('Error generating subtasks with AI:', error);
      return this.getDefaultSubtasks(taskType);
    }
  }

  /**
   * Get default subtasks if AI generation fails
   */
  private getDefaultSubtasks(taskType: TaskType): any[] {
    const defaults: { [key in TaskType]: any[] } = {
      RECRUITMENT: [
        {
          title: 'Review applications',
          description: 'Screen CVs and applications against job requirements',
          priority: 'HIGH',
          estimatedHours: 2,
          tags: ['screening'],
          metadata: { order: 1 }
        },
        {
          title: 'Shortlist candidates',
          description: 'Create shortlist of top candidates for interviews',
          priority: 'HIGH',
          estimatedHours: 1,
          tags: ['screening'],
          metadata: { order: 2, dependencies: ['Review applications'] }
        },
        {
          title: 'Schedule interviews',
          description: 'Contact shortlisted candidates and schedule interviews',
          priority: 'MEDIUM',
          estimatedHours: 1,
          tags: ['communication'],
          metadata: { order: 3, dependencies: ['Shortlist candidates'] }
        }
      ],
      INTERVIEW_PREP: [
        {
          title: 'Review candidate profile',
          description: 'Thoroughly review CV and application materials',
          priority: 'HIGH',
          estimatedHours: 0.5,
          tags: ['preparation'],
          metadata: { order: 1 }
        },
        {
          title: 'Prepare interview questions',
          description: 'Create tailored questions based on role and candidate background',
          priority: 'HIGH',
          estimatedHours: 1,
          tags: ['preparation'],
          metadata: { order: 2 }
        },
        {
          title: 'Coordinate interview panel',
          description: 'Confirm availability with all interviewers',
          priority: 'MEDIUM',
          estimatedHours: 0.5,
          tags: ['coordination'],
          metadata: { order: 3 }
        }
      ],
      ONBOARDING: [
        {
          title: 'Send welcome package',
          description: 'Email welcome information and first day details',
          priority: 'HIGH',
          estimatedHours: 0.5,
          tags: ['communication'],
          metadata: { order: 1 }
        },
        {
          title: 'Prepare workstation',
          description: 'Set up desk, computer, and necessary equipment',
          priority: 'HIGH',
          estimatedHours: 2,
          tags: ['logistics'],
          metadata: { order: 2 }
        },
        {
          title: 'Schedule orientation',
          description: 'Book orientation sessions and training',
          priority: 'MEDIUM',
          estimatedHours: 1,
          tags: ['training'],
          metadata: { order: 3 }
        },
        {
          title: 'Complete paperwork',
          description: 'Process employment contracts and documentation',
          priority: 'HIGH',
          estimatedHours: 1,
          tags: ['documentation'],
          metadata: { order: 4 }
        }
      ],
      TRAINING: [
        {
          title: 'Identify training needs',
          description: 'Assess skill gaps and training requirements',
          priority: 'HIGH',
          estimatedHours: 1,
          tags: ['assessment'],
          metadata: { order: 1 }
        },
        {
          title: 'Select training programs',
          description: 'Choose appropriate courses and materials',
          priority: 'MEDIUM',
          estimatedHours: 1,
          tags: ['planning'],
          metadata: { order: 2 }
        },
        {
          title: 'Schedule training sessions',
          description: 'Book training dates and arrange logistics',
          priority: 'MEDIUM',
          estimatedHours: 0.5,
          tags: ['scheduling'],
          metadata: { order: 3 }
        }
      ],
      CLIENT_DEPLOYMENT: [
        {
          title: 'Prepare candidate briefing',
          description: 'Create overview of client, project, and expectations',
          priority: 'HIGH',
          estimatedHours: 2,
          tags: ['preparation'],
          metadata: { order: 1 }
        },
        {
          title: 'Client introduction meeting',
          description: 'Arrange meeting between candidate and client',
          priority: 'HIGH',
          estimatedHours: 1,
          tags: ['coordination'],
          metadata: { order: 2 }
        },
        {
          title: 'Site access and logistics',
          description: 'Arrange access cards, parking, and other logistics',
          priority: 'MEDIUM',
          estimatedHours: 1,
          tags: ['logistics'],
          metadata: { order: 3 }
        }
      ],
      KPI_REVIEW: [
        {
          title: 'Collect performance data',
          description: 'Gather all relevant KPI metrics and data',
          priority: 'HIGH',
          estimatedHours: 1,
          tags: ['data-collection'],
          metadata: { order: 1 }
        },
        {
          title: 'Analyze performance',
          description: 'Review metrics against targets and goals',
          priority: 'HIGH',
          estimatedHours: 2,
          tags: ['analysis'],
          metadata: { order: 2 }
        },
        {
          title: 'Prepare feedback',
          description: 'Create feedback report and recommendations',
          priority: 'MEDIUM',
          estimatedHours: 1,
          tags: ['documentation'],
          metadata: { order: 3 }
        }
      ],
      DOCUMENTATION: [
        {
          title: 'Gather information',
          description: 'Collect all necessary information and materials',
          priority: 'HIGH',
          estimatedHours: 1,
          tags: ['research'],
          metadata: { order: 1 }
        },
        {
          title: 'Create documentation',
          description: 'Write and format the required documents',
          priority: 'MEDIUM',
          estimatedHours: 3,
          tags: ['writing'],
          metadata: { order: 2 }
        },
        {
          title: 'Review and finalize',
          description: 'Review for accuracy and completeness',
          priority: 'MEDIUM',
          estimatedHours: 1,
          tags: ['review'],
          metadata: { order: 3 }
        }
      ],
      FOLLOW_UP: [
        {
          title: 'Prepare follow-up message',
          description: 'Draft email or message for follow-up',
          priority: 'MEDIUM',
          estimatedHours: 0.5,
          tags: ['communication'],
          metadata: { order: 1 }
        },
        {
          title: 'Send follow-up',
          description: 'Send message to relevant parties',
          priority: 'MEDIUM',
          estimatedHours: 0.25,
          tags: ['communication'],
          metadata: { order: 2 }
        },
        {
          title: 'Track responses',
          description: 'Monitor and record responses',
          priority: 'LOW',
          estimatedHours: 0.5,
          tags: ['tracking'],
          metadata: { order: 3 }
        }
      ],
      GENERAL: [
        {
          title: 'Define task requirements',
          description: 'Clearly outline what needs to be accomplished',
          priority: 'HIGH',
          estimatedHours: 1,
          tags: ['planning'],
          metadata: { order: 1 }
        },
        {
          title: 'Execute task',
          description: 'Complete the main work',
          priority: 'MEDIUM',
          estimatedHours: 2,
          tags: ['execution'],
          metadata: { order: 2 }
        },
        {
          title: 'Review and verify',
          description: 'Check work is completed to standard',
          priority: 'MEDIUM',
          estimatedHours: 0.5,
          tags: ['review'],
          metadata: { order: 3 }
        }
      ]
    };

    return defaults[taskType] || defaults.GENERAL;
  }

  /**
   * Get all tasks for a user (assigned or created)
   */
  async getUserTasks(userId: string, filters?: {
    status?: TaskStatus;
    priority?: Priority;
    candidateId?: string;
  }) {
    try {
      const where: any = {
        OR: [
          { assignedTo: userId },
          { createdBy: userId }
        ]
      };

      if (filters?.status) where.status = filters.status;
      if (filters?.priority) where.priority = filters.priority;
      if (filters?.candidateId) where.candidateId = filters.candidateId;

      const tasks = await prisma.task.findMany({
        where,
        include: {
          subtasks: {
            orderBy: [
              { metadata: 'asc' }, // Order by metadata.order
              { createdAt: 'asc' }
            ]
          },
          candidate: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          assignee: {
            select: {
              name: true,
              email: true
            }
          },
          creator: {
            select: {
              name: true,
              email: true
            }
          },
          comments: {
            include: {
              user: {
                select: {
                  name: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' }
        ]
      });

      return tasks;
    } catch (error) {
      console.error('Error getting user tasks:', error);
      throw new Error('Failed to get user tasks');
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: TaskStatus, userId: string) {
    try {
      const updateData: any = { status };

      if (status === 'IN_PROGRESS' && !updateData.startDate) {
        updateData.startDate = new Date();
      }

      if (status === 'COMPLETED') {
        updateData.completedDate = new Date();
      }

      const task = await prisma.task.update({
        where: { id: taskId },
        data: updateData
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId,
          activityType: 'STATUS_CHANGED',
          description: `Task "${task.title}" status changed to ${status}`,
          metadata: { taskId, newStatus: status }
        }
      });

      return task;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw new Error('Failed to update task status');
    }
  }

  /**
   * Get task statistics for dashboard
   */
  async getTaskStatistics(userId?: string) {
    try {
      const where = userId ? {
        OR: [
          { assignedTo: userId },
          { createdBy: userId }
        ]
      } : {};

      const [total, todo, inProgress, completed, overdue] = await Promise.all([
        prisma.task.count({ where: { ...where, parentTaskId: null } }),
        prisma.task.count({ where: { ...where, status: 'TODO', parentTaskId: null } }),
        prisma.task.count({ where: { ...where, status: 'IN_PROGRESS', parentTaskId: null } }),
        prisma.task.count({ where: { ...where, status: 'COMPLETED', parentTaskId: null } }),
        prisma.task.count({
          where: {
            ...where,
            parentTaskId: null,
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
            dueDate: { lt: new Date() }
          }
        })
      ]);

      const byType = await prisma.task.groupBy({
        by: ['taskType'],
        where: { ...where, parentTaskId: null },
        _count: true
      });

      const byPriority = await prisma.task.groupBy({
        by: ['priority'],
        where: { ...where, parentTaskId: null, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
        _count: true
      });

      return {
        total,
        todo,
        inProgress,
        completed,
        overdue,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        byType: byType.map(item => ({
          type: item.taskType,
          count: item._count
        })),
        byPriority: byPriority.map(item => ({
          priority: item.priority,
          count: item._count
        }))
      };
    } catch (error) {
      console.error('Error getting task statistics:', error);
      throw new Error('Failed to get task statistics');
    }
  }

  /**
   * Add comment to task
   */
  async addComment(taskId: string, userId: string, comment: string) {
    try {
      return await prisma.taskComment.create({
        data: {
          taskId,
          userId,
          comment
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  }
}

export default new TaskService();
