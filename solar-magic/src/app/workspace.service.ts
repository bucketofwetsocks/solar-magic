import { Injectable } from '@angular/core';
const electron = (<any>window).require('electron');

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {

  constructor() {

    console.dir(electron);
    console.log(`workspace.service: constructor.`);
  }
}
