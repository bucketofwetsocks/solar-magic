import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { WorkspaceService } from '../workspace.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  public currentLoadedWorkspace: string = '';
  constructor(
    public workspaceService: WorkspaceService
  ) {

  }

  ngOnInit(): void {
    this.workspaceService.onWorkspaceLoaded.subscribe((workspace) => {
      this.currentLoadedWorkspace = workspace;
      console.log(`nav.component: workspace loaded: ${workspace}`);
    });

  }

}
