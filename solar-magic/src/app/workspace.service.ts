import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Workspace } from './models/Workspace';

const fs = (<any>window).require('fs');
const fse = (<any>window).require('fs-extra');
const path = (<any>window).require('path');
declare var __dirname: string;

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  public workspaceConfig: Workspace | undefined ;

  // things we can subscribe to.
  public onWorkspaceLoaded: ReplaySubject<string> = new ReplaySubject<string>();

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
  
  public getWorkspaceFolder(): string | undefined {
    if (!this.workspaceConfig?.currentWorkspace)
      return undefined;
    return path.dirname(this.workspaceConfig?.currentWorkspace);
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

  /**
   * just returns the music folder of the current workspace.
   */
  public getMusicFolder(): string {
    const root = this.getWorkspaceFolder();
    if (!root)
      throw new Error(`getMusicFolder(): No music folder. Workspace not loaded.`);
    return path.normalize(this.workspaceConfig?.integrations.music.path.replace('{projectDir}', root));
  }

  /**
   * check's the music folder for addMusicK, and overall health.
   */
  public checkMusicFolder(): string[] {
    if (!this.workspaceConfig?.currentWorkspace)
      return [];
    const musicFolder = this.getMusicFolder();
    const addMusicK = path.join(musicFolder, 'AddmusicK.exe');
    const errors: string[] = [];
    if (!fs.existsSync(musicFolder))
      errors.push(`The music path '${musicFolder}' does not exist.`);
    if (!fs.existsSync(addMusicK))
      errors.push(`AddMusicK at location '${addMusicK}' does not exist.`);

    return errors;
  }

  /**
   * builds the music folder as needed.
   */
  public buildMusicFolder() {
    const root = this.getWorkspaceFolder()
    if (!root)
      return;
    const musicResourceFolder = path.join(__dirname, 'resources/workspaceTemplates/music');
    const dest =  path.normalize(this.workspaceConfig?.integrations.music.path.replace('{projectDir}', root));
    fse.copySync(musicResourceFolder, dest);
  }

}
