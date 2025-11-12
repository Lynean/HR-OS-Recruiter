import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import templateService from '../services/template.service';

const router = Router();
const prisma = new PrismaClient();

/**
 * Get all email templates
 */
router.get('/email', async (req: Request, res: Response) => {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(templates);
  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({ error: 'Failed to get email templates' });
  }
});

/**
 * Get email template by name
 */
router.get('/email/:name', async (req: Request, res: Response) => {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { name: req.params.name }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Get email template error:', error);
    res.status(500).json({ error: 'Failed to get email template' });
  }
});

/**
 * Create or update email template
 */
router.post('/email', async (req: Request, res: Response) => {
  try {
    const template = await prisma.emailTemplate.upsert({
      where: { name: req.body.name },
      update: req.body,
      create: req.body
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Create email template error:', error);
    res.status(500).json({ error: 'Failed to create email template' });
  }
});

/**
 * Get all document templates
 */
router.get('/document', async (req: Request, res: Response) => {
  try {
    const templates = await prisma.documentTemplate.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(templates);
  } catch (error) {
    console.error('Get document templates error:', error);
    res.status(500).json({ error: 'Failed to get document templates' });
  }
});

/**
 * Send email using template
 */
router.post('/send-email', async (req: Request, res: Response) => {
  try {
    const { to, templateName, variables } = req.body;

    await templateService.sendEmail(to, templateName, variables);
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

/**
 * Generate PDF from template
 */
router.post('/generate-pdf', async (req: Request, res: Response) => {
  try {
    const { templateName, variables, outputPath } = req.body;

    const pdfPath = await templateService.generatePDF(
      templateName,
      variables,
      outputPath || `/tmp/document_${Date.now()}.pdf`
    );

    res.json({ pdfPath, message: 'PDF generated successfully' });
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

/**
 * Initialize default templates
 */
router.post('/initialize', async (req: Request, res: Response) => {
  try {
    await templateService.createDefaultTemplates();
    res.json({ message: 'Default templates created successfully' });
  } catch (error) {
    console.error('Initialize templates error:', error);
    res.status(500).json({ error: 'Failed to initialize templates' });
  }
});

export default router;
