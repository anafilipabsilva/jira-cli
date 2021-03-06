import { Injectable } from '@nestjs/common';
import { readFile } from 'fs';

@Injectable()
export class FileService {
  async readFile<T>(filepath: string): Promise<T> {
    const fileInfo = await new Promise<string>((resolve, reject) => {
      readFile(filepath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    return JSON.parse(fileInfo);
  }
}
