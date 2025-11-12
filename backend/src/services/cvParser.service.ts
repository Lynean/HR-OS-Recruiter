import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import geminiService from './gemini.service';

export class CVParserService {
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
      return data.text;
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
      return fs.readFileSync(filePath, 'utf-8');
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

      return {
        email: emailMatch ? emailMatch[0] : null,
        phone: phoneMatch ? phoneMatch[0].trim() : null,
        experience: experience,
        skills: skills,
        rawText: cvText
      };
    } catch (error) {
      console.error('Error extracting CV information:', error);
      return null;
    }
  }

  /**
   * Full CV processing pipeline
   */
  async processCV(filePath: string, candidateName: string) {
    try {
      // 1. Parse CV to extract text
      const cvText = await this.parseCV(filePath);

      // 2. Extract structured information
      const extractedInfo = await this.extractCVInformation(cvText);

      // 3. Upload to Gemini for file search
      const geminiUpload = await geminiService.uploadCV(filePath, candidateName);

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
}

export default new CVParserService();
