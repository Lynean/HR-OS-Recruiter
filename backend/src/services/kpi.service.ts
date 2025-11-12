import { PrismaClient, KPIStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class KPIService {
  /**
   * Create KPI for a candidate
   */
  async createKPI(data: {
    candidateId: string;
    assignedBy: string;
    title: string;
    description?: string;
    metric: string;
    target: number;
    unit?: string;
    startDate: Date;
    endDate: Date;
  }) {
    try {
      const kpi = await prisma.kPI.create({
        data: {
          candidateId: data.candidateId,
          assignedBy: data.assignedBy,
          title: data.title,
          description: data.description,
          metric: data.metric,
          target: data.target,
          current: 0,
          unit: data.unit,
          startDate: data.startDate,
          endDate: data.endDate,
          status: 'NOT_STARTED'
        }
      });

      // Log activity
      await prisma.activity.create({
        data: {
          candidateId: data.candidateId,
          userId: data.assignedBy,
          activityType: 'KPI_CREATED',
          description: `KPI created: ${data.title}`,
          metadata: { kpiId: kpi.id }
        }
      });

      return kpi;
    } catch (error) {
      console.error('Error creating KPI:', error);
      throw new Error('Failed to create KPI');
    }
  }

  /**
   * Update KPI progress
   */
  async updateKPIProgress(kpiId: string, current: number, userId: string) {
    try {
      const kpi = await prisma.kPI.findUnique({
        where: { id: kpiId }
      });

      if (!kpi) {
        throw new Error('KPI not found');
      }

      // Determine status based on progress
      let status: KPIStatus = 'IN_PROGRESS';
      const progress = (current / kpi.target) * 100;

      if (progress >= 100) {
        status = 'COMPLETED';
      } else if (new Date() > kpi.endDate) {
        status = 'OVERDUE';
      }

      const updatedKPI = await prisma.kPI.update({
        where: { id: kpiId },
        data: {
          current,
          status
        }
      });

      // Log activity
      await prisma.activity.create({
        data: {
          candidateId: kpi.candidateId,
          userId: userId,
          activityType: 'KPI_UPDATED',
          description: `KPI updated: ${kpi.title} - Progress: ${progress.toFixed(1)}%`,
          metadata: { kpiId, current, target: kpi.target }
        }
      });

      return updatedKPI;
    } catch (error) {
      console.error('Error updating KPI:', error);
      throw new Error('Failed to update KPI');
    }
  }

  /**
   * Get KPIs for a candidate
   */
  async getCandidateKPIs(candidateId: string) {
    try {
      const kpis = await prisma.kPI.findMany({
        where: { candidateId },
        include: {
          assigner: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return kpis.map(kpi => ({
        ...kpi,
        progress: (kpi.current / kpi.target) * 100
      }));
    } catch (error) {
      console.error('Error getting candidate KPIs:', error);
      throw new Error('Failed to get candidate KPIs');
    }
  }

  /**
   * Get KPI summary statistics
   */
  async getKPISummary(candidateId?: string) {
    try {
      const where = candidateId ? { candidateId } : {};

      const [total, inProgress, completed, overdue] = await Promise.all([
        prisma.kPI.count({ where }),
        prisma.kPI.count({ where: { ...where, status: 'IN_PROGRESS' } }),
        prisma.kPI.count({ where: { ...where, status: 'COMPLETED' } }),
        prisma.kPI.count({ where: { ...where, status: 'OVERDUE' } })
      ]);

      const avgCompletion = await prisma.kPI.aggregate({
        where,
        _avg: {
          current: true
        }
      });

      return {
        total,
        inProgress,
        completed,
        overdue,
        notStarted: total - inProgress - completed - overdue,
        avgCompletion: avgCompletion._avg.current || 0,
        completionRate: total > 0 ? (completed / total) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting KPI summary:', error);
      throw new Error('Failed to get KPI summary');
    }
  }
}

export default new KPIService();
