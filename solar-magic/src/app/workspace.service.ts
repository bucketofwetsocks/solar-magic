import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Workspace } from './models/Workspace';

const fs = (<any>window).require('fs');

declare var __dirname: string;

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  public workspaceConfig: Workspace | undefined ;

  // things we can subscribe to.
  public onWorkspaceLoaded: ReplaySubject<string> = new ReplaySubject<string>(1);

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
    fs.writeFileSync(path, JSON.stringify(this.workspaceConfig));
    console.log(`workspace.service: config saved. current workspace: ${this.workspaceConfig?.currentWorkspace}`);
  }

  /**
   * loads basic config for the service.
   */
  public load(cb: (success: boolean) => void) {
    try {
      const path = `${__dirname}/solar-magic.json`;
      const contents = fs.readFileSync(path, 'utf8');   
      this.workspaceConfig = JSON.parse(contents);
      this.loadWorkspace(this.workspaceConfig?.currentWorkspace);
      cb(true);
      console.log(`workspace.service: config loaded`);
    }
    catch (ex) {
      cb(false);
    }
  }
  
  /**
   * loads a workspace folder and kicks off an event when successful.
   */
  public loadWorkspace(path: string | undefined) {
    if (!path)
      return;
    
    // first check if the path exists as a folder.
    if (fs.existsSync(path)) {
      console.log(`workspace.service.new: Folder '${path}' exists.`);

      // after loading, set the value.
      (<Workspace>this.workspaceConfig).currentWorkspace = path;

      // save the current configuration, so we can auto-reload next time.
      this.save();
      if (this.workspaceConfig?.currentWorkspace)
        this.onWorkspaceLoaded.next(this.workspaceConfig?.currentWorkspace);

    }
    else {
      throw new Error(`Directory ${path} does not exist.`);
    }
  }

  /**
   * initializes a new workspace.  this creates a number of folders, files, and downloads
   * certain dependencies, like ASAR or AddMusicK.  
   */
  public newWorkspace(path: string) {
    // first check if the path exists as a folder.
    if (fs.existsSync(path)) {
      console.log(`workspace.service.new: Folder '${path}' exists.`)
    }
    else {
      throw new Error("Directory does not exist.");
    }
  }
}
