import { Injectable } from '@nestjs/common';
import { readFile } from 'fs';
import { JiraTest } from './../entities/jiraTest.entity';

@Injectable()
export class FileService {
  async readFile(filepath: string): Promise<JiraTest> {
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
