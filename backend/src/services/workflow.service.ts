import { PrismaClient, CandidateStatus, InterviewStatus, OfferStatus, OnboardingStatus } from '@prisma/client';
import templateService from './template.service';

const prisma = new PrismaClient();

export class WorkflowService {
  /**
   * Schedule interview and send invitation
   */
  async scheduleInterview(data: {
    candidateId: string;
    jobDescriptionId: string;
    scheduledBy: string;
    interviewDate: Date;
    interviewType: string;
    location?: string;
    meetingLink?: string;
  }) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { id: data.candidateId }
      });

      const jd = await prisma.jobDescription.findUnique({
        where: { id: data.jobDescriptionId },
        include: { creator: true }
      });

      if (!candidate || !jd) {
        throw new Error('Candidate or Job Description not found');
      }

      // Create interview record
      const interview = await prisma.interview.create({
        data: {
          candidateId: data.candidateId,
          jobDescriptionId: data.jobDescriptionId,
          scheduledBy: data.scheduledBy,
          interviewDate: data.interviewDate,
          interviewType: data.interviewType as any,
          location: data.location,
          meetingLink: data.meetingLink,
          status: 'SCHEDULED'
        }
      });

      // Update candidate status
      await prisma.candidate.update({
        where: { id: data.candidateId },
        data: { status: 'INTERVIEWED' }
      });

      // Send interview invitation email
      await templateService.sendEmail(
        candidate.email,
        'interview_invitation',
        {
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          position: jd.title,
          company: 'HR Recruiter Co.',
          interviewDate: data.interviewDate.toLocaleDateString(),
          interviewTime: data.interviewDate.toLocaleTimeString(),
          interviewType: data.interviewType,
          location: data.location || data.meetingLink || 'TBD',
          recruiterName: jd.creator.name
        }
      );

      // Log activity
      await prisma.activity.create({
        data: {
          candidateId: data.candidateId,
          userId: data.scheduledBy,
          activityType: 'INTERVIEW_SCHEDULED',
          description: `Interview scheduled for ${data.interviewDate.toLocaleDateString()}`
        }
      });

      return interview;
    } catch (error) {
      console.error('Error scheduling interview:', error);
      throw new Error('Failed to schedule interview');
    }
  }

  /**
   * Send offer letter to candidate
   */
  async sendOffer(data: {
    candidateId: string;
    position: string;
    department?: string;
    salary: number;
    startDate?: Date;
    employmentType: string;
    recruiterName: string;
    responseDeadline: Date;
  }) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { id: data.candidateId }
      });

      if (!candidate) {
        throw new Error('Candidate not found');
      }

      // Create offer record
      const offer = await prisma.offer.create({
        data: {
          candidateId: data.candidateId,
          position: data.position,
          department: data.department,
          salary: data.salary,
          startDate: data.startDate,
          status: 'PENDING'
        }
      });

      // Update candidate status
      await prisma.candidate.update({
        where: { id: data.candidateId },
        data: { status: 'OFFERED' }
      });

      // Send offer letter email
      await templateService.sendEmail(
        candidate.email,
        'offer_letter',
        {
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          position: data.position,
          company: 'HR Recruiter Co.',
          department: data.department || 'N/A',
          startDate: data.startDate?.toLocaleDateString() || 'TBD',
          salary: `$${data.salary.toLocaleString()}`,
          employmentType: data.employmentType,
          responseDeadline: data.responseDeadline.toLocaleDateString(),
          recruiterName: data.recruiterName
        }
      );

      // Log activity
      await prisma.activity.create({
        data: {
          candidateId: data.candidateId,
          userId: 'system', // Should be actual user ID
          activityType: 'OFFER_SENT',
          description: `Offer sent for position: ${data.position}`
        }
      });

      return offer;
    } catch (error) {
      console.error('Error sending offer:', error);
      throw new Error('Failed to send offer');
    }
  }

  /**
   * Accept offer and start onboarding
   */
  async acceptOffer(offerId: string) {
    try {
      const offer = await prisma.offer.findUnique({
        where: { id: offerId },
        include: { candidate: true }
      });

      if (!offer) {
        throw new Error('Offer not found');
      }

      // Update offer status
      await prisma.offer.update({
        where: { id: offerId },
        data: {
          status: 'ACCEPTED',
          responseDate: new Date()
        }
      });

      // Update candidate status
      await prisma.candidate.update({
        where: { id: offer.candidateId },
        data: { status: 'ACCEPTED' }
      });

      // Log activity
      await prisma.activity.create({
        data: {
          candidateId: offer.candidateId,
          userId: 'system',
          activityType: 'OFFER_ACCEPTED',
          description: 'Candidate accepted the offer'
        }
      });

      return offer;
    } catch (error) {
      console.error('Error accepting offer:', error);
      throw new Error('Failed to accept offer');
    }
  }

  /**
   * Start onboarding process
   */
  async startOnboarding(data: {
    candidateId: string;
    startDate: Date;
    checklist: any;
    documents: any;
  }) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { id: data.candidateId }
      });

      if (!candidate) {
        throw new Error('Candidate not found');
      }

      // Create onboarding record
      const onboarding = await prisma.onboarding.create({
        data: {
          candidateId: data.candidateId,
          startDate: data.startDate,
          status: 'IN_PROGRESS',
          checklist: data.checklist,
          documents: data.documents
        }
      });

      // Update candidate status
      await prisma.candidate.update({
        where: { id: data.candidateId },
        data: { status: 'ONBOARDING' }
      });

      // Send onboarding welcome email
      await templateService.sendEmail(
        candidate.email,
        'onboarding_welcome',
        {
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          company: 'HR Recruiter Co.',
          position: 'Position', // Should be from offer
          startDate: data.startDate.toLocaleDateString(),
          startTime: '9:00 AM',
          location: 'Office Address',
          contactPerson: 'HR Manager',
          contactEmail: 'hr@company.com',
          documentsRequired: Object.keys(data.documents),
          recruiterName: 'HR Team'
        }
      );

      // Log activity
      await prisma.activity.create({
        data: {
          candidateId: data.candidateId,
          userId: 'system',
          activityType: 'ONBOARDING_STARTED',
          description: 'Onboarding process started'
        }
      });

      return onboarding;
    } catch (error) {
      console.error('Error starting onboarding:', error);
      throw new Error('Failed to start onboarding');
    }
  }

  /**
   * Assign training to candidate
   */
  async assignTraining(data: {
    candidateId: string;
    trainingName: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
  }) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { id: data.candidateId }
      });

      if (!candidate) {
        throw new Error('Candidate not found');
      }

      // Create training record
      const training = await prisma.training.create({
        data: {
          candidateId: data.candidateId,
          trainingName: data.trainingName,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          status: 'SCHEDULED'
        }
      });

      // Update candidate status if not already active
      if (candidate.status !== 'ACTIVE') {
        await prisma.candidate.update({
          where: { id: data.candidateId },
          data: { status: 'TRAINING' }
        });
      }

      // Send training assignment email
      await templateService.sendEmail(
        candidate.email,
        'training_assignment',
        {
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          trainingName: data.trainingName,
          trainingDescription: data.description || '',
          startDate: data.startDate.toLocaleDateString(),
          duration: 'TBD',
          trainerName: 'Training Department',
          endDate: data.endDate?.toLocaleDateString() || 'TBD',
          company: 'HR Recruiter Co.'
        }
      );

      // Log activity
      await prisma.activity.create({
        data: {
          candidateId: data.candidateId,
          userId: 'system',
          activityType: 'TRAINING_ASSIGNED',
          description: `Training assigned: ${data.trainingName}`
        }
      });

      return training;
    } catch (error) {
      console.error('Error assigning training:', error);
      throw new Error('Failed to assign training');
    }
  }

  /**
   * Assign candidate to client site (outsourcing)
   */
  async assignOutsourcing(data: {
    candidateId: string;
    clientName: string;
    clientLocation?: string;
    projectName: string;
    role: string;
    startDate: Date;
    endDate?: Date;
    responsibilities?: string;
    contactPerson?: string;
    contactEmail?: string;
    recruiterName: string;
  }) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { id: data.candidateId }
      });

      if (!candidate) {
        throw new Error('Candidate not found');
      }

      // Create outsourcing record
      const outsourcing = await prisma.outsourcing.create({
        data: {
          candidateId: data.candidateId,
          clientName: data.clientName,
          clientLocation: data.clientLocation,
          projectName: data.projectName,
          role: data.role,
          startDate: data.startDate,
          endDate: data.endDate,
          status: 'ASSIGNED',
          responsibilities: data.responsibilities,
          contactPerson: data.contactPerson,
          contactEmail: data.contactEmail
        }
      });

      // Update candidate status
      await prisma.candidate.update({
        where: { id: data.candidateId },
        data: { status: 'OUTSOURCED' }
      });

      // Send outsourcing assignment email
      await templateService.sendEmail(
        candidate.email,
        'outsourcing_assignment',
        {
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          clientName: data.clientName,
          projectName: data.projectName,
          role: data.role,
          clientLocation: data.clientLocation || 'TBD',
          startDate: data.startDate.toLocaleDateString(),
          duration: data.endDate ? `Until ${data.endDate.toLocaleDateString()}` : 'Ongoing',
          contactPerson: data.contactPerson || 'TBD',
          contactEmail: data.contactEmail || 'TBD',
          recruiterName: data.recruiterName,
          company: 'HR Recruiter Co.'
        }
      );

      // Log activity
      await prisma.activity.create({
        data: {
          candidateId: data.candidateId,
          userId: 'system',
          activityType: 'OUTSOURCING_ASSIGNED',
          description: `Assigned to ${data.clientName} - ${data.projectName}`
        }
      });

      return outsourcing;
    } catch (error) {
      console.error('Error assigning outsourcing:', error);
      throw new Error('Failed to assign outsourcing');
    }
  }
}

export default new WorkflowService();
