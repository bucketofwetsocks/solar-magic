import { Component, OnInit } from '@angular/core';
import { WorkspaceService } from '../workspace.service';

const exec = (<any>window).require('child_process').exec;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private workspaceService: WorkspaceService
  ) { }

  public openGithub() {
    exec("start https://github.com/bresheske/solar-magic");
  }

  ngOnInit(): void {
  }

}
