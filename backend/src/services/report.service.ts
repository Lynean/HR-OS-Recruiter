import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReportService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      const [
        totalCandidates,
        activeCandidates,
        totalJDs,
        activeJDs,
        interviewsThisMonth,
        offersThisMonth,
        onboardingInProgress
      ] = await Promise.all([
        prisma.candidate.count(),
        prisma.candidate.count({ where: { status: 'ACTIVE' } }),
        prisma.jobDescription.count(),
        prisma.jobDescription.count({ where: { status: 'ACTIVE' } }),
        this.getInterviewsCount('month'),
        this.getOffersCount('month'),
        prisma.onboarding.count({ where: { status: 'IN_PROGRESS' } })
      ]);

      const candidatesByStatus = await this.getCandidatesByStatus();
      const recentActivities = await this.getRecentActivities(10);

      return {
        summary: {
          totalCandidates,
          activeCandidates,
          totalJDs,
          activeJDs,
          interviewsThisMonth,
          offersThisMonth,
          onboardingInProgress
        },
        candidatesByStatus,
        recentActivities
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw new Error('Failed to get dashboard statistics');
    }
  }

  /**
   * Get recruitment funnel data
   */
  async getRecruitmentFunnel(jobDescriptionId?: string) {
    try {
      const where = jobDescriptionId ? { jobDescriptionId } : {};

      const funnel = {
        totalCandidates: await prisma.candidate.count(),
        screening: await prisma.candidate.count({ where: { status: 'SCREENING' } }),
        interviewed: await prisma.interview.count({ where: { ...where, status: 'COMPLETED' } }),
        offered: await prisma.offer.count({ where: { status: 'PENDING' } }),
        accepted: await prisma.offer.count({ where: { status: 'ACCEPTED' } }),
        onboarding: await prisma.onboarding.count({ where: { status: 'IN_PROGRESS' } }),
        active: await prisma.candidate.count({ where: { status: 'ACTIVE' } })
      };

      // Calculate conversion rates
      const conversionRates = {
        screeningToInterview: funnel.screening > 0 ? (funnel.interviewed / funnel.screening) * 100 : 0,
        interviewToOffer: funnel.interviewed > 0 ? (funnel.offered / funnel.interviewed) * 100 : 0,
        offerAcceptance: funnel.offered > 0 ? (funnel.accepted / funnel.offered) * 100 : 0,
        overall: funnel.totalCandidates > 0 ? (funnel.active / funnel.totalCandidates) * 100 : 0
      };

      return {
        funnel,
        conversionRates
      };
    } catch (error) {
      console.error('Error getting recruitment funnel:', error);
      throw new Error('Failed to get recruitment funnel');
    }
  }

  /**
   * Calculate time-to-hire metrics
   */
  async getTimeToHire(jobDescriptionId?: string) {
    try {
      const candidates = await prisma.candidate.findMany({
        where: {
          status: {
            in: ['ACCEPTED', 'ONBOARDING', 'ACTIVE']
          }
        },
        include: {
          interviews: {
            orderBy: { createdAt: 'asc' },
            take: 1
          },
          offers: {
            where: { status: 'ACCEPTED' },
            orderBy: { createdAt: 'asc' },
            take: 1
          }
        }
      });

      const timeToHireData = candidates.map(candidate => {
        const firstInterview = candidate.interviews[0];
        const acceptedOffer = candidate.offers[0];

        if (!firstInterview || !acceptedOffer) return null;

        const daysToHire = Math.ceil(
          (acceptedOffer.responseDate!.getTime() - candidate.createdAt.getTime()) /
          (1000 * 60 * 60 * 24)
        );

        return {
          candidateId: candidate.id,
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          daysToHire,
          createdAt: candidate.createdAt,
          acceptedAt: acceptedOffer.responseDate
        };
      }).filter(Boolean);

      const avgTimeToHire = timeToHireData.length > 0
        ? timeToHireData.reduce((sum, d) => sum + d!.daysToHire, 0) / timeToHireData.length
        : 0;

      return {
        avgTimeToHire: Math.round(avgTimeToHire),
        data: timeToHireData,
        totalHires: timeToHireData.length
      };
    } catch (error) {
      console.error('Error calculating time to hire:', error);
      throw new Error('Failed to calculate time to hire');
    }
  }

  /**
   * Get source effectiveness report
   */
  async getSourceEffectiveness() {
    try {
      // This would track where candidates came from (LinkedIn, referral, etc.)
      // For now, return mock data structure
      return {
        sources: [
          { name: 'LinkedIn', candidates: 45, hired: 12, effectiveness: 26.7 },
          { name: 'Referral', candidates: 30, hired: 15, effectiveness: 50.0 },
          { name: 'Job Board', candidates: 25, hired: 5, effectiveness: 20.0 },
          { name: 'Career Site', candidates: 20, hired: 8, effectiveness: 40.0 }
        ]
      };
    } catch (error) {
      console.error('Error getting source effectiveness:', error);
      throw new Error('Failed to get source effectiveness');
    }
  }

  /**
   * Get interview statistics
   */
  async getInterviewStats(period: 'week' | 'month' | 'year' = 'month') {
    try {
      const dateFilter = this.getDateFilter(period);

      const [total, completed, scheduled, cancelled, noShow] = await Promise.all([
        prisma.interview.count({ where: { createdAt: dateFilter } }),
        prisma.interview.count({ where: { createdAt: dateFilter, status: 'COMPLETED' } }),
        prisma.interview.count({ where: { createdAt: dateFilter, status: 'SCHEDULED' } }),
        prisma.interview.count({ where: { createdAt: dateFilter, status: 'CANCELLED' } }),
        prisma.interview.count({ where: { createdAt: dateFilter, status: 'NO_SHOW' } })
      ]);

      const interviewsByType = await prisma.interview.groupBy({
        by: ['interviewType'],
        where: { createdAt: dateFilter },
        _count: true
      });

      return {
        total,
        completed,
        scheduled,
        cancelled,
        noShow,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        byType: interviewsByType.map(item => ({
          type: item.interviewType,
          count: item._count
        }))
      };
    } catch (error) {
      console.error('Error getting interview stats:', error);
      throw new Error('Failed to get interview statistics');
    }
  }

  /**
   * Get candidates by status
   */
  private async getCandidatesByStatus() {
    const statusCounts = await prisma.candidate.groupBy({
      by: ['status'],
      _count: true
    });

    return statusCounts.map(item => ({
      status: item.status,
      count: item._count
    }));
  }

  /**
   * Get recent activities
   */
  private async getRecentActivities(limit: number = 20) {
    return await prisma.activity.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        candidate: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      }
    });
  }

  /**
   * Get interviews count for period
   */
  private async getInterviewsCount(period: 'week' | 'month' | 'year') {
    return await prisma.interview.count({
      where: {
        createdAt: this.getDateFilter(period)
      }
    });
  }

  /**
   * Get offers count for period
   */
  private async getOffersCount(period: 'week' | 'month' | 'year') {
    return await prisma.offer.count({
      where: {
        sentDate: this.getDateFilter(period)
      }
    });
  }

  /**
   * Get date filter for period
   */
  private getDateFilter(period: 'week' | 'month' | 'year') {
    const now = new Date();
    const date = new Date();

    switch (period) {
      case 'week':
        date.setDate(now.getDate() - 7);
        break;
      case 'month':
        date.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        date.setFullYear(now.getFullYear() - 1);
        break;
    }

    return { gte: date };
  }
}

export default new ReportService();
