import { PrismaClient } from '@prisma/client';
import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export class TemplateService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Initialize email transporter
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Render email template with variables
   */
  async renderEmailTemplate(templateName: string, variables: any): Promise<{ subject: string; body: string }> {
    try {
      const template = await prisma.emailTemplate.findUnique({
        where: { name: templateName }
      });

      if (!template) {
        throw new Error(`Email template '${templateName}' not found`);
      }

      // Compile Handlebars templates
      const subjectTemplate = Handlebars.compile(template.subject);
      const bodyTemplate = Handlebars.compile(template.body);

      return {
        subject: subjectTemplate(variables),
        body: bodyTemplate(variables)
      };
    } catch (error) {
      console.error('Error rendering email template:', error);
      throw new Error('Failed to render email template');
    }
  }

  /**
   * Send email using template
   */
  async sendEmail(
    to: string,
    templateName: string,
    variables: any,
    attachments?: any[]
  ): Promise<boolean> {
    try {
      const { subject, body } = await this.renderEmailTemplate(templateName, variables);

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html: body,
        attachments
      });

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Render document template
   */
  async renderDocumentTemplate(templateName: string, variables: any): Promise<string> {
    try {
      const template = await prisma.documentTemplate.findUnique({
        where: { name: templateName }
      });

      if (!template) {
        throw new Error(`Document template '${templateName}' not found`);
      }

      const compiledTemplate = Handlebars.compile(template.content);
      return compiledTemplate(variables);
    } catch (error) {
      console.error('Error rendering document template:', error);
      throw new Error('Failed to render document template');
    }
  }

  /**
   * Generate PDF from document template
   */
  async generatePDF(templateName: string, variables: any, outputPath: string): Promise<string> {
    try {
      const content = await this.renderDocumentTemplate(templateName, variables);

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(outputPath);

        doc.pipe(stream);

        // Simple text rendering (for production, use better HTML-to-PDF conversion)
        doc.fontSize(12).text(content, {
          width: 500,
          align: 'left'
        });

        doc.end();

        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  /**
   * Create default templates
   */
  async createDefaultTemplates() {
    const emailTemplates = [
      {
        name: 'interview_invitation',
        subject: 'Interview Invitation - {{position}} at {{company}}',
        body: `
          <h2>Dear {{candidateName}},</h2>
          <p>We are pleased to invite you for an interview for the position of <strong>{{position}}</strong>.</p>
          <h3>Interview Details:</h3>
          <ul>
            <li><strong>Date:</strong> {{interviewDate}}</li>
            <li><strong>Time:</strong> {{interviewTime}}</li>
            <li><strong>Type:</strong> {{interviewType}}</li>
            <li><strong>Location/Link:</strong> {{location}}</li>
          </ul>
          <p>Please confirm your availability by replying to this email.</p>
          <p>Best regards,<br>{{recruiterName}}<br>{{company}}</p>
        `,
        type: 'INTERVIEW_INVITATION',
        variables: ['candidateName', 'position', 'company', 'interviewDate', 'interviewTime', 'interviewType', 'location', 'recruiterName']
      },
      {
        name: 'offer_letter',
        subject: 'Job Offer - {{position}} at {{company}}',
        body: `
          <h2>Dear {{candidateName}},</h2>
          <p>We are delighted to offer you the position of <strong>{{position}}</strong> at {{company}}.</p>
          <h3>Offer Details:</h3>
          <ul>
            <li><strong>Position:</strong> {{position}}</li>
            <li><strong>Department:</strong> {{department}}</li>
            <li><strong>Start Date:</strong> {{startDate}}</li>
            <li><strong>Salary:</strong> {{salary}}</li>
            <li><strong>Employment Type:</strong> {{employmentType}}</li>
          </ul>
          <p>Please review the attached offer letter and return a signed copy by {{responseDeadline}}.</p>
          <p>We look forward to having you on our team!</p>
          <p>Best regards,<br>{{recruiterName}}<br>{{company}}</p>
        `,
        type: 'OFFER_LETTER',
        variables: ['candidateName', 'position', 'company', 'department', 'startDate', 'salary', 'employmentType', 'responseDeadline', 'recruiterName']
      },
      {
        name: 'onboarding_welcome',
        subject: 'Welcome to {{company}} - Onboarding Information',
        body: `
          <h2>Welcome {{candidateName}}!</h2>
          <p>We're excited to have you join {{company}} as a {{position}}.</p>
          <h3>Your First Day:</h3>
          <ul>
            <li><strong>Date:</strong> {{startDate}}</li>
            <li><strong>Time:</strong> {{startTime}}</li>
            <li><strong>Location:</strong> {{location}}</li>
            <li><strong>Contact:</strong> {{contactPerson}} ({{contactEmail}})</li>
          </ul>
          <h3>What to Bring:</h3>
          <ul>
            {{#each documentsRequired}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          <p>If you have any questions before your start date, please don't hesitate to reach out.</p>
          <p>Best regards,<br>{{recruiterName}}<br>{{company}}</p>
        `,
        type: 'ONBOARDING_WELCOME',
        variables: ['candidateName', 'company', 'position', 'startDate', 'startTime', 'location', 'contactPerson', 'contactEmail', 'documentsRequired', 'recruiterName']
      },
      {
        name: 'training_assignment',
        subject: 'Training Assignment - {{trainingName}}',
        body: `
          <h2>Dear {{candidateName}},</h2>
          <p>You have been assigned to the following training program:</p>
          <h3>Training Details:</h3>
          <ul>
            <li><strong>Training:</strong> {{trainingName}}</li>
            <li><strong>Description:</strong> {{trainingDescription}}</li>
            <li><strong>Start Date:</strong> {{startDate}}</li>
            <li><strong>Duration:</strong> {{duration}}</li>
            <li><strong>Trainer:</strong> {{trainerName}}</li>
          </ul>
          <p>Please ensure you complete this training by {{endDate}}.</p>
          <p>Best regards,<br>{{company}}</p>
        `,
        type: 'TRAINING_ASSIGNMENT',
        variables: ['candidateName', 'trainingName', 'trainingDescription', 'startDate', 'duration', 'trainerName', 'endDate', 'company']
      },
      {
        name: 'outsourcing_assignment',
        subject: 'Client Assignment - {{clientName}}',
        body: `
          <h2>Dear {{candidateName}},</h2>
          <p>We are pleased to inform you of your assignment to our client:</p>
          <h3>Assignment Details:</h3>
          <ul>
            <li><strong>Client:</strong> {{clientName}}</li>
            <li><strong>Project:</strong> {{projectName}}</li>
            <li><strong>Role:</strong> {{role}}</li>
            <li><strong>Location:</strong> {{clientLocation}}</li>
            <li><strong>Start Date:</strong> {{startDate}}</li>
            <li><strong>Duration:</strong> {{duration}}</li>
          </ul>
          <h3>Client Contact:</h3>
          <ul>
            <li><strong>Name:</strong> {{contactPerson}}</li>
            <li><strong>Email:</strong> {{contactEmail}}</li>
          </ul>
          <p>Please reach out to the client contact for further details about your first day.</p>
          <p>Best regards,<br>{{recruiterName}}<br>{{company}}</p>
        `,
        type: 'OUTSOURCING_ASSIGNMENT',
        variables: ['candidateName', 'clientName', 'projectName', 'role', 'clientLocation', 'startDate', 'duration', 'contactPerson', 'contactEmail', 'recruiterName', 'company']
      }
    ];

    const documentTemplates = [
      {
        name: 'offer_letter_doc',
        content: `
OFFER LETTER

{{company}}
{{companyAddress}}

Date: {{date}}

Dear {{candidateName}},

We are pleased to offer you the position of {{position}} at {{company}}.

EMPLOYMENT DETAILS:
- Position: {{position}}
- Department: {{department}}
- Reports To: {{reportsTo}}
- Employment Type: {{employmentType}}
- Start Date: {{startDate}}

COMPENSATION:
- Base Salary: {{salary}}
- Benefits: {{benefits}}

This offer is contingent upon successful completion of background checks and verification of your eligibility to work.

Please sign and return this letter by {{responseDeadline}} to accept this offer.

Sincerely,

{{recruiterName}}
{{recruiterTitle}}
{{company}}

---
ACCEPTANCE

I, {{candidateName}}, accept the offer as outlined above.

Signature: ____________________
Date: ____________________
        `,
        type: 'OFFER_LETTER',
        variables: ['company', 'companyAddress', 'date', 'candidateName', 'position', 'department', 'reportsTo', 'employmentType', 'startDate', 'salary', 'benefits', 'responseDeadline', 'recruiterName', 'recruiterTitle']
      }
    ];

    try {
      for (const template of emailTemplates) {
        await prisma.emailTemplate.upsert({
          where: { name: template.name },
          update: template,
          create: template
        });
      }

      for (const template of documentTemplates) {
        await prisma.documentTemplate.upsert({
          where: { name: template.name },
          update: template,
          create: template
        });
      }

      console.log('✓ Default templates created');
    } catch (error) {
      console.error('Error creating default templates:', error);
    }
  }
}

export default new TemplateService();
