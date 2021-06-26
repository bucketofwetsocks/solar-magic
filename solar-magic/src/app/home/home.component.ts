import { Component, OnInit } from '@angular/core';
import { TestService } from '../test.service';
import { WorkspaceService } from '../workspace.service';

const exec = (<any>window).require('child_process').exec;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public workspaceChange: string = '';
  public currentLoadedWorkspace: string = '';

  constructor(
    public workspaceService: WorkspaceService,
    public testService: TestService
  ) {

  }

  ngOnInit(): void {
    console.log(`home.component: init.`);
    this.workspaceService.onWorkspaceLoaded
      .subscribe((workspace) => {
        this.currentLoadedWorkspace = workspace;
        this.workspaceChange = workspace;
        console.log(`home.component: workspace loaded: ${workspace}`);
      });

  }

  public openGithub() {
    exec("start https://github.com/bresheske/solar-magic");
  }

  public newWorkspace() {
    try {
      this.workspaceService.newWorkspace(this.workspaceChange);
    }
    catch (ex) {
      alert(ex);
    }
  }

  public loadWorkspace() {
    try {
      this.workspaceService.loadWorkspace(this.workspaceChange);
    }
    catch (ex) {
      alert(ex);
    }
  }
}
