import fs from 'fs/promises';
import { injectable } from 'inversify';
import path from 'path';

import type { IService } from './service';

export interface IUploadService extends IService {
  uploadFile(file: File): Promise<string>;
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
  async uploadFile(file: File): Promise<string> {
    try {
      // Generate file name (random id + original filename with _ instead of special characters)
      const fileName = `${crypto.randomUUID()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;

      const pathFromPublic = path.join('/avatar/', fileName);

      const targetPath = path.join(__dirname, '../public/', pathFromPublic);

      // Convert to buffer
      const buffer = await file.arrayBuffer();

      // Save to storage
      fs.writeFile(targetPath, Buffer.from(buffer));

      return pathFromPublic;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete file from a given path (from public)
   *
   * @param pathFromPublic
   * @returns void
   * @throws Error
   */
  async deleteFile(pathFromPublic: string): Promise<void> {
    try {
      const targetPath = path.join(__dirname, '../public/', pathFromPublic);

      // Delete file
      fs.unlink(targetPath);
    } catch (error) {
      throw error;
    }
  }
}
