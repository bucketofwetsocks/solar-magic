import { Injectable } from '@angular/core';
import { Workspace } from './models/Workspace';

const path = (<any>window).require('path');
const fs = (<any>window).require('fs');

declare var __dirname: string;

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  public workspaceConfig: Workspace | null = null;
  public currentWorkspace: string | null = null;

  public readonly DEFAULT_CONFIG: Workspace = {
    integrations: {
      music: {
        path: '{projectDir}/music',
      }
    }
  };

  constructor() {
    console.log(`workspace.service: working directory: ${__dirname}`);

    this.load();
    // if we couldn't load the workspace,
    // like, it's the firs time loading up the app,
    // then just add in some defaults and save the file.
    if (!this.workspaceConfig) {
      this.workspaceConfig = this.DEFAULT_CONFIG;
      this.save();
    }

    console.log(`workspace.service: constructor.`);
  }

  public save() {
    const path = `${__dirname}/solar-magic.json`;
    fs.writeFile(path, JSON.stringify(this.workspaceConfig), (err: string) => {
      if (err) {
        console.log(`workspace.service: error saving config file to '${path}'.`)
        console.error(err);
      }
    });
  }

  public load() {
    const path = `${__dirname}/solar-magic.json`;
    fs.readFile(path, 'utf8', (err: string, contents: string) => {
      if (err) {
        return;
      }
      console.log(`workspace.service: config contents`);
      console.dir(contents);
      this.workspaceConfig = JSON.parse(contents);
    });
  }

  /**
   * initializes a new workspace.  this creates a number of folders, files, and downloads
   * certain dependencies, like ASAR or AddMusicK.  
   */
  public new() {

  }
}
