import fs from 'fs/promises';
import { inject, injectable } from 'inversify';
import path from 'path';
import { fileURLToPath } from 'url';

import { Config } from './config';

export interface IBucket {
  uploadFile(directoryFromBucket: string, file: File): Promise<string>;
  deleteFile(pathFromPublic: string): Promise<void>;
}

@injectable()
export class Bucket implements IBucket {
  // IoC Key
  static readonly Key = Symbol.for('Bucket');

  // Dependencies
  constructor(@inject(Config.Key) private readonly config: Config) {}

  /**
   * uploads a file and returns the the path (complete with the host name)
   *
   * @param file
   * @returns string
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

      const fullURL = `${this.config.get('BE_URL')}${pathFromPublic}`;

      return fullURL;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete file from a full url
   *
   * @param pathFromBucket
   * @returns void
   * @throws Error
   */
  async deleteFile(fullURL: string): Promise<void> {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      const pathFromBucket = fullURL.replace(`${this.config.get('BE_URL')}`, '');
      const targetPath = path.join(__dirname, '../public/bucket', pathFromBucket);

      // Delete file
      fs.unlink(targetPath);
    } catch (error) {
      throw error;
    }
  }
}
