import { Injectable } from '@nestjs/common';
import { readFile } from 'fs';

@Injectable()
export class FileService {
  async readFile(filepath: string): Promise<any> {
    const fileInfo = await new Promise<string>((resolve, reject) => {
      readFile(filepath, 'utf8', (err, data) => {
        console.log("Hrllo");
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
