import fs from 'fs/promises';
import { injectable } from 'inversify';
import path from 'path';
import { fileURLToPath } from 'url';

import type { IService } from './service';

export interface IUploadService extends IService {
  uploadFile(directoryFromBucket: string, file: File): Promise<string>;
  deleteFile(pathFromPublic: string): Promise<void>;
}

@injectable()
export class UploadService implements IUploadService {
  // IoC Key
  static readonly Key = Symbol.for('UploadService');

  // Dependencies
  constructor() {}

  /**
   * uploads a file and returns the path from public
   *
   * @param file
   * @returns
   * @throws Error
   */
  async uploadFile(pathFromBucket: string, file: File): Promise<string> {
    try {
      // Get current file directory
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      // Generate file name (random id + original filename with _ instead of special characters)
      const fileName = `${crypto.randomUUID()}_${file.name.replace(/[^a-zA-Z0-9.]|\.(?=.*\.)/g, '_')}`;
      const pathFromPublic = path.join('/bucket/', pathFromBucket, fileName);

      const targetDirectory = path.join(__dirname, '../../public/bucket/', pathFromBucket);
      const targetPath = path.join(targetDirectory, fileName);

      // Convert to buffer
      const buffer = await file.arrayBuffer();

      // Make directory if not exists
      await fs.mkdir(targetDirectory, { recursive: true });

      // Save to storage
      await fs.writeFile(targetPath, Buffer.from(buffer));

      return pathFromPublic;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete file from a given path (from public)
   *
   * @param pathFromBucket
   * @returns void
   * @throws Error
   */
  async deleteFile(pathFromBucket: string): Promise<void> {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      const targetPath = path.join(__dirname, '../public/bucket', pathFromBucket);

      // Delete file
      fs.unlink(targetPath);
    } catch (error) {
      throw error;
    }
  }
}
