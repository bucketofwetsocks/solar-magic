import { Injectable } from '@angular/core';

const path = (<any>window).require('path');
const fs = (<any>window).require('fs');

declare var __dirname: string;



@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {

  constructor() {
    fs.readdir(__dirname, (err: string, files: string[]) => {
      console.dir(files);
    });


    console.log(`workspace.service: constructor.`);
  }

  public save() {
   
  }

  public load() {

  }
}
