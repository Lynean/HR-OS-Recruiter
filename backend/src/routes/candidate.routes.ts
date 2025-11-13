import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import cvParserService from '../services/cvParser.service';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cv-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
    }
  }
});

/**
 * Parse CV and extract data (for preview/auto-fill) - does NOT create candidate
 */
router.post('/parse-cv', upload.single('cv'), async (req: Request, res: Response) => {
  try {
    console.log('CV parse request received');

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse CV and extract all fields
    const extractedData = await cvParserService.parseAndExtractAllFields(req.file.path);

    console.log('CV parsed successfully:', {
      firstName: extractedData.firstName,
      lastName: extractedData.lastName,
      email: extractedData.email
    });

    res.json({
      success: true,
      data: extractedData,
      message: 'CV parsed successfully. Review and modify the extracted data before submitting.'
    });
  } catch (error: any) {
    console.error('CV parse error:', error);
    res.status(500).json({
      error: 'Failed to parse CV',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Upload CV and create candidate with comprehensive auto-filled data
 */
router.post('/upload', upload.single('cv'), async (req: Request, res: Response) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    console.log('Body:', req.body);

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { firstName, lastName, email, phone, location, skills, experience, education, source } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        error: 'Missing required fields: firstName, lastName, and email are required'
      });
    }

    // Process CV with comprehensive extraction
    const candidateName = `${firstName} ${lastName}`;
    console.log('Processing CV for:', candidateName);

    const processed = await cvParserService.processCV(req.file.path, candidateName);
    console.log('CV processed successfully with comprehensive data');

    // Use provided data or fall back to extracted data
    const finalSkills = skills
      ? (typeof skills === 'string' ? JSON.parse(skills) : skills)
      : (processed.extractedInfo?.skills || []);

    const finalExperience = experience !== undefined
      ? (typeof experience === 'string' ? parseFloat(experience) : experience)
      : (processed.extractedInfo?.experience || 0);

    const finalEducation = education
      ? (typeof education === 'string' ? education : JSON.stringify(education))
      : (processed.extractedInfo?.education || '{}');

    // Create candidate with all extracted fields
    const candidate = await prisma.candidate.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || processed.extractedInfo?.phone || null,
        location: location || processed.extractedInfo?.location || null,
        cvFilePath: req.file.path,
        cvText: processed.cvText,
        geminiFileId: processed.geminiFileId,
        skills: finalSkills,
        experience: finalExperience,
        education: finalEducation,
        source: source || 'UPLOAD',
        parsedData: processed.extractedInfo,
        status: 'NEW'
      }
    });

    console.log('Candidate created successfully:', candidate.id);

    res.status(201).json({
      success: true,
      candidate,
      message: 'Candidate created successfully with auto-filled data from CV'
    });
  } catch (error: any) {
    console.error('Upload error:', error);

    // Provide more specific error messages
    if (error.message?.includes('Unique constraint')) {
      return res.status(400).json({ error: 'A candidate with this email already exists' });
    }

    res.status(500).json({
      error: 'Failed to upload CV',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get all candidates
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, skills, minExperience, maxExperience, limit, offset } = req.query;

    const where: any = {};

    if (status) where.status = status;
    if (skills) {
      where.skills = {
        hasSome: (skills as string).split(',')
      };
    }
    if (minExperience) where.experience = { gte: parseFloat(minExperience as string) };
    if (maxExperience) where.experience = { ...where.experience, lte: parseFloat(maxExperience as string) };

    const candidates = await prisma.candidate.findMany({
      where,
      take: limit ? parseInt(limit as string) : 50,
      skip: offset ? parseInt(offset as string) : 0,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.candidate.count({ where });

    res.json({ candidates, total });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ error: 'Failed to get candidates' });
  }
});

/**
 * Get candidate by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: req.params.id },
      include: {
        matches: {
          include: {
            jobDescription: true
          }
        },
        interviews: true,
        offers: true,
        onboarding: true,
        training: true,
        outsourcing: true,
        kpis: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({ error: 'Failed to get candidate' });
  }
});

/**
 * Update candidate
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const candidate = await prisma.candidate.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(candidate);
  } catch (error) {
    console.error('Update candidate error:', error);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

/**
 * Delete candidate
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.candidate.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

export default router;
