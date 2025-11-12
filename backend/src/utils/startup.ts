import fs from 'fs';
import path from 'path';

/**
 * Ensure required directories exist
 */
export function ensureDirectories() {
  const directories = [
    process.env.UPLOAD_DIR || './uploads',
    './temp',
  ];

  directories.forEach(dir => {
    const fullPath = path.resolve(dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✓ Created directory: ${fullPath}`);
    }
  });
}
