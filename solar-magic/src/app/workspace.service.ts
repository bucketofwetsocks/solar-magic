import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Workspace } from './models/Workspace';

const fs = (<any>window).require('fs');

declare var __dirname: string;

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  public workspaceConfig: Workspace | undefined ;

  // things we can subscribe to.
  public onWorkspaceLoaded: Subject<string> = new Subject<string>();

  public readonly DEFAULT_CONFIG: Workspace = {
    currentWorkspace: undefined,
    integrations: {
      music: {
        path: '{projectDir}/music',
      }
    }
  };

  constructor() {
    console.log(`workspace.service: constructor.`);

    this.load((success) => {
      if (!success) {
        // if we couldn't load the workspace,
        // like, it's the first time loading up the app,
        // then just add in some defaults and save the file.
        if (!this.workspaceConfig) {
          this.workspaceConfig = this.DEFAULT_CONFIG;
          this.save();
        }
      }
      console.log(`workspace.service: first-time load complete. workspace: ${this.workspaceConfig?.currentWorkspace}`);
    });

  }

  /**
   * Saves the current configuration to file.
   */
  public save() {
    const path = `${__dirname}/solar-magic.json`;
    fs.writeFile(path, JSON.stringify(this.workspaceConfig), (err: string) => {
      if (err) {
        console.log(`workspace.service: error saving config file to '${path}'.`)
        console.error(err);
      }
    });
    console.log(`workspace.service: config saved. current workspace: ${this.workspaceConfig?.currentWorkspace}`);
  }

  /**
   * loads basic config for the service.
   */
  public load(cb: (success: boolean) => void) {
    const path = `${__dirname}/solar-magic.json`;
    fs.readFile(path, 'utf8', (err: string, contents: string) => {
      if (err) {
        cb(false);
        return;
      }
      this.workspaceConfig = JSON.parse(contents);
      this.loadWorkspace(this.workspaceConfig?.currentWorkspace);
      cb(true);
      console.log(`workspace.service: config loaded`);
    });
  }
  
  /**
   * loads a workspace folder and kicks off an event when successful.
   */
  public loadWorkspace(path: string | undefined) {
    if (!path)
      return;
    
    // first check if the path exists as a folder.
    fs.access(path, (error: string) => {
      if (error) {
        throw new Error(`Directory ${path} does not exist.`);
      } else {
        console.log(`workspace.service.new: Folder '${path}' exists.`);

        // after loading, set the value.
        (<Workspace>this.workspaceConfig).currentWorkspace = path;

        // save the current configuration, so we can auto-reload next time.
        this.save();
        this.onWorkspaceLoaded.next(this.workspaceConfig?.currentWorkspace);
      }
    });
  }

  /**
   * initializes a new workspace.  this creates a number of folders, files, and downloads
   * certain dependencies, like ASAR or AddMusicK.  
   */
  public newWorkspace(path: string) {
    // first check if the path exists as a folder.
    fs.access(path, (error: string) => {
      if (error) {
        throw new Error("Directory does not exist.");
      } else {
        console.log(`workspace.service.new: Folder '${path}' exists.`)
      }
    });

  }
}
