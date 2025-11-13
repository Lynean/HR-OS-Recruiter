import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import geminiService from './gemini.service';

export class CVParserService {
  /**
   * Remove null bytes and other problematic characters from string
   * PostgreSQL doesn't allow null bytes in text fields
   */
  private sanitizeText(text: string): string {
    if (!text) return '';

    // Remove null bytes and other control characters except newlines and tabs
    return text
      .replace(/\x00/g, '') // Remove null bytes
      .replace(/[\x01-\x08\x0B-\x0C\x0E-\x1F]/g, '') // Remove other control chars
      .trim();
  }

  /**
   * Sanitize all string fields in an object recursively
   */
  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeText(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      }
      return sanitized;
    }

    return obj;
  }
  /**
   * Parse CV file and extract text
   */
  async parseCV(filePath: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
      case '.pdf':
        return this.parsePDF(filePath);
      case '.txt':
        return this.parseTXT(filePath);
      case '.doc':
      case '.docx':
        // For production, use mammoth or similar library
        return this.parseTXT(filePath); // Fallback
      default:
        throw new Error('Unsupported file format');
    }
  }

  /**
   * Parse PDF file
   */
  private async parsePDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      // Sanitize the extracted text to remove null bytes and control characters
      return this.sanitizeText(data.text);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF file');
    }
  }

  /**
   * Parse text file
   */
  private async parseTXT(filePath: string): Promise<string> {
    try {
      const text = fs.readFileSync(filePath, 'utf-8');
      // Sanitize the text to remove null bytes and control characters
      return this.sanitizeText(text);
    } catch (error) {
      console.error('Error parsing text file:', error);
      throw new Error('Failed to parse text file');
    }
  }

  /**
   * Extract structured information from CV text using AI
   */
  async extractCVInformation(cvText: string) {
    try {
      // Use Gemini to extract structured data
      const skills = await geminiService.extractSkillsFromCV(cvText);

      // Extract basic info using regex patterns
      const emailMatch = cvText.match(/[\w.-]+@[\w.-]+\.\w+/);
      const phoneMatch = cvText.match(/[\d\s()+-]{10,}/);

      // Extract years of experience
      const experienceMatch = cvText.match(/(\d+)\+?\s*(years?|yrs?)\s*(of\s*)?experience/i);
      const experience = experienceMatch ? parseInt(experienceMatch[1]) : null;

      const basicData = {
        email: emailMatch ? emailMatch[0] : null,
        phone: phoneMatch ? phoneMatch[0].trim() : null,
        experience: experience,
        skills: skills,
        rawText: cvText
      };

      // Sanitize all string fields
      return this.sanitizeObject(basicData);
    } catch (error) {
      console.error('Error extracting CV information:', error);
      return null;
    }
  }

  /**
   * Extract comprehensive candidate information from CV using AI
   */
  async extractComprehensiveCVData(cvText: string) {
    try {
      const prompt = `
You are an expert CV/Resume parser. Analyze the following CV text and extract all relevant information in a structured JSON format.

Extract the following fields:
1. firstName: First name of the candidate
2. lastName: Last name of the candidate
3. email: Email address
4. phone: Phone number (with country code if available)
5. location: Current location/city/country
6. skills: Array of technical and soft skills (be comprehensive)
7. experience: Total years of professional experience (as a number)
8. education: Array of education entries with format: { degree: string, institution: string, year: string, field: string }
9. workHistory: Array of work experience with format: { title: string, company: string, duration: string, description: string }
10. certifications: Array of certifications with format: { name: string, issuer: string, year: string }
11. languages: Array of languages with proficiency levels
12. summary: Professional summary or objective (2-3 sentences)
13. linkedIn: LinkedIn profile URL if mentioned
14. github: GitHub profile URL if mentioned
15. portfolio: Portfolio or personal website URL if mentioned

IMPORTANT RULES:
- Return ONLY valid JSON, no markdown formatting, no code blocks
- If a field is not found, use null for strings, [] for arrays, or 0 for numbers
- For skills, extract ALL mentioned skills including programming languages, frameworks, tools, soft skills
- For experience (years), calculate the total based on work history dates
- Be thorough and accurate

CV Text:
${cvText}

Return the extracted data as a JSON object:`;

      const result = await geminiService.generateContent(prompt);

      // Parse the response as JSON
      let extractedData;
      try {
        // Remove markdown code blocks if present
        let cleanedResult = result.trim();
        if (cleanedResult.startsWith('```json')) {
          cleanedResult = cleanedResult.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanedResult.startsWith('```')) {
          cleanedResult = cleanedResult.replace(/```\n?/g, '');
        }

        extractedData = JSON.parse(cleanedResult);
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError);
        console.error('Response was:', result);

        // Fallback to basic extraction
        return this.extractCVInformation(cvText);
      }

      // Validate and clean the data
      const cleanData = {
        firstName: extractedData.firstName || null,
        lastName: extractedData.lastName || null,
        email: extractedData.email || null,
        phone: extractedData.phone || null,
        location: extractedData.location || null,
        skills: Array.isArray(extractedData.skills) ? extractedData.skills : [],
        experience: typeof extractedData.experience === 'number' ? extractedData.experience : 0,
        education: Array.isArray(extractedData.education) ? extractedData.education : [],
        workHistory: Array.isArray(extractedData.workHistory) ? extractedData.workHistory : [],
        certifications: Array.isArray(extractedData.certifications) ? extractedData.certifications : [],
        languages: Array.isArray(extractedData.languages) ? extractedData.languages : [],
        summary: extractedData.summary || null,
        linkedIn: extractedData.linkedIn || null,
        github: extractedData.github || null,
        portfolio: extractedData.portfolio || null,
        rawText: cvText
      };

      // Sanitize all string fields to remove null bytes
      return this.sanitizeObject(cleanData);
    } catch (error) {
      console.error('Error extracting comprehensive CV data:', error);
      // Fallback to basic extraction
      return this.extractCVInformation(cvText);
    }
  }

  /**
   * Full CV processing pipeline with comprehensive AI extraction
   */
  async processCV(filePath: string, candidateName: string) {
    try {
      console.log('Starting CV processing for:', candidateName);

      // 1. Parse CV to extract text
      const cvText = await this.parseCV(filePath);
      console.log('CV text extracted, length:', cvText.length);

      // 2. Extract comprehensive structured information using AI
      const extractedInfo = await this.extractComprehensiveCVData(cvText);
      console.log('Comprehensive data extracted:', {
        firstName: extractedInfo.firstName,
        lastName: extractedInfo.lastName,
        email: extractedInfo.email,
        skillsCount: extractedInfo.skills?.length || 0,
        workHistoryCount: extractedInfo.workHistory?.length || 0
      });

      // 3. Upload to Gemini for file search
      const geminiUpload = await geminiService.uploadCV(filePath, candidateName);
      console.log('CV uploaded to Gemini:', geminiUpload.fileId);

      return {
        cvText,
        extractedInfo,
        geminiFileId: geminiUpload.fileId,
      };
    } catch (error) {
      console.error('Error processing CV:', error);
      throw new Error('Failed to process CV');
    }
  }

  /**
   * Parse CV and extract all fields for auto-filling candidate form
   */
  async parseAndExtractAllFields(filePath: string) {
    try {
      console.log('Parsing CV for auto-fill:', filePath);

      // 1. Parse CV to extract text (already sanitized in parseCV)
      const cvText = await this.parseCV(filePath);

      // 2. Extract comprehensive data (already sanitized in extractComprehensiveCVData)
      const extractedData = await this.extractComprehensiveCVData(cvText);

      // 3. Format for candidate creation
      const formattedData = {
        // Basic Information
        firstName: extractedData.firstName,
        lastName: extractedData.lastName,
        email: extractedData.email,
        phone: extractedData.phone,
        location: extractedData.location,

        // Professional Information
        skills: extractedData.skills,
        experience: extractedData.experience,

        // Additional Information (stored as JSON in education field)
        education: JSON.stringify({
          education: extractedData.education,
          workHistory: extractedData.workHistory,
          certifications: extractedData.certifications,
          languages: extractedData.languages,
          summary: extractedData.summary,
          linkedIn: extractedData.linkedIn,
          github: extractedData.github,
          portfolio: extractedData.portfolio
        }),

        // Raw CV text
        cvText: cvText
      };

      // Double-check sanitization (defensive programming)
      return this.sanitizeObject(formattedData);
    } catch (error) {
      console.error('Error parsing CV for auto-fill:', error);
      throw error;
    }
  }
}

export default new CVParserService();
