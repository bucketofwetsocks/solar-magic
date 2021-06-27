import { Injectable } from '@angular/core';

const execSync = (<any>window).require('child_process').execSync;
const path = (<any>window).require('path');

/**
 * a stupid service, that didn't really belong anywhere else.
 */
@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor() { }

  public downloadFile(url:string, folderPath:string): string {
    const filepath = path.join(folderPath, path.basename(url));
    execSync(`curl.exe --output ${filepath} --url ${url}`);
    return filepath;
  }
}
