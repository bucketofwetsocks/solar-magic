import { Injectable } from '@angular/core';

const execSync = (<any>window).require('child_process').execSync;
const path = (<any>window).require('path');
const zip = (<any>window).require('adm-zip');
const glob = (<any>window).require('glob');
const fs = (<any>window).require('fs');
const fse = (<any>window).require('fs-extra');

/**
 * a stupid service, that didn't really belong anywhere else.
 */
@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor() { }

  /**
   * downloads a file from a URL and returns the filepath once done.
   */
  public downloadFile(url:string, folderPath:string): string {
    const filepath = path.join(folderPath, path.basename(url));
    execSync(`curl.exe --output ${filepath} --url ${url}`);
    return filepath;
  }

  /**
   * unzips a file and returns all of the files extracted to the folderpath.
   */
  public unZipFile(path:string, folderPath:string): string[] {
    const zipfile = new zip(path);
    zipfile.extractAllTo(folderPath, true);
    return glob.sync(`${folderPath}/**/*`);
  }

  public delete(path:string) {
    fse.removeSync(path);
  }

  public getOnlyDirectories(folderPath:string): string[] {
    return glob.sync(`${folderPath}/*([^\.])`);
  }

  public getOnlyFiles(folderPath:string): string[] {
    return glob.sync(`${folderPath}/*.*`);
  }

  public exists(path: string): boolean {
    return fs.existsSync(path);
  }

  /**
   * copies either a file or a whole folder.
   */
  public copy(path: string, dest: string) {
    fse.copySync(path, dest);
  }
}
