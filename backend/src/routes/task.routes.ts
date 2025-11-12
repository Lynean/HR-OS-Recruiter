import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import taskService from '../services/task.service';

const router = Router();
const prisma = new PrismaClient();

/**
 * Create task with optional AI-generated subtasks
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const task = await taskService.createTaskWithSubtasks(req.body);
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

/**
 * Generate subtasks for existing task
 */
router.post('/:id/generate-subtasks', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const subtasks = await taskService.generateSubtasks(
      id,
      task.title,
      task.description || '',
      task.taskType,
      userId || task.createdBy
    );

    res.json({ task, subtasks, count: subtasks.length });
  } catch (error) {
    console.error('Generate subtasks error:', error);
    res.status(500).json({ error: 'Failed to generate subtasks' });
  }
});

/**
 * Get all tasks for a user
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status, priority, candidateId } = req.query;

    const tasks = await taskService.getUserTasks(userId, {
      status: status as any,
      priority: priority as any,
      candidateId: candidateId as string
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ error: 'Failed to get user tasks' });
  }
});

/**
 * Get task by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        subtasks: {
          orderBy: [
            { status: 'asc' },
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
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        attachments: true
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to get task' });
  }
});

/**
 * Update task
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

/**
 * Update task status
 */
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, userId } = req.body;

    const task = await taskService.updateTaskStatus(
      req.params.id,
      status,
      userId || 'system'
    );

    res.json(task);
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

/**
 * Delete task
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

/**
 * Add comment to task
 */
router.post('/:id/comments', async (req: Request, res: Response) => {
  try {
    const { userId, comment } = req.body;

    const taskComment = await taskService.addComment(
      req.params.id,
      userId,
      comment
    );

    res.status(201).json(taskComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

/**
 * Get task statistics
 */
router.get('/statistics/summary', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    const stats = await taskService.getTaskStatistics(userId as string);
    res.json(stats);
  } catch (error) {
    console.error('Get task statistics error:', error);
    res.status(500).json({ error: 'Failed to get task statistics' });
  }
});

/**
 * Get task templates
 */
router.get('/templates/all', async (req: Request, res: Response) => {
  try {
    const { taskType, category } = req.query;

    const where: any = {};
    if (taskType) where.taskType = taskType;
    if (category) where.category = category;

    const templates = await prisma.taskTemplate.findMany({
      where,
      orderBy: { usageCount: 'desc' }
    });

    res.json(templates);
  } catch (error) {
    console.error('Get task templates error:', error);
    res.status(500).json({ error: 'Failed to get task templates' });
  }
});

/**
 * Create task template
 */
router.post('/templates', async (req: Request, res: Response) => {
  try {
    const template = await prisma.taskTemplate.create({
      data: req.body
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Create task template error:', error);
    res.status(500).json({ error: 'Failed to create task template' });
  }
});

/**
 * Create task from template
 */
router.post('/templates/:templateId/create-task', async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const { candidateId, assignedTo, createdBy, dueDate } = req.body;

    const template = await prisma.taskTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Create task from template
    const task = await taskService.createTaskWithSubtasks({
      title: template.name,
      description: template.description || '',
      taskType: template.taskType,
      priority: template.defaultPriority,
      candidateId,
      assignedTo,
      createdBy,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      generateSubtasks: template.aiEnhanced,
      tags: template.tags
    });

    // Update template usage count
    await prisma.taskTemplate.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task from template error:', error);
    res.status(500).json({ error: 'Failed to create task from template' });
  }
});

export default router;
