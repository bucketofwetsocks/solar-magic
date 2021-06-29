import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { AddMusicKService } from '../add-music-k.service';
import { MusicResult } from '../models/MusicResult';
import { SearchResult } from '../models/SearchResult';
import { MusicService } from '../music.service';
import { PaginationService } from '../pagination.service';

const M = (<any>window).M;
const path = (<any>window).require('path');

@Component({
  selector: 'app-music',
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.css']
})
export class MusicComponent implements OnInit {
  public musicSearch = {} as SearchResult<MusicResult>;
  public loading: boolean = false;
  public paginationList: number[] = [];
  
  public filterName: string = '';
  public filterDescription: string = '';
  public filterTags: string = '';

  public originalMusicList: string[] = [];
  public localMusicList: string[] = [];
  public workspaceMusicList: string[] = [];

  constructor(
    private musicService: MusicService,
    private addMusicKService: AddMusicKService,
    private paginationService: PaginationService
  ) { }

  ngOnInit(): void {
    console.log(`music.component: init.`);
    this.localMusicList = this.addMusicKService.getMusicList();
    this.originalMusicList = this.addMusicKService.getOriginalsList();
    this.workspaceMusicList = this.addMusicKService.getWorkspaceList();
    this.search(1);
  }

  public search(page?: number) {
    console.log(`music.component: searching...`);
    if (!page)
      page = 1;

    this.loading = true;
    this.musicService.searchMusic(this.filterName, this.filterDescription, this.filterTags, page)
      .subscribe((music) => {
        this.paginationList = this.paginationService.generatePaginationList(music);
        this.musicSearch = music;
        this.loading = false;
        console.log(`music.component: Loaded Music: ${this.musicSearch.results.length}`);
      });
  }

  public playSong(item: MusicResult) {
    console.log(`music.component: playing item: ${item.spcId}`);
    this.musicService.getSPC(item.spcId)
      .subscribe((data: any) => {
        // grab SPC player from the global scope.
        const localwindow = window as any;
        const spc = localwindow.SMWCentral.SPCPlayer;        
        spc.loadSong(data);
      });
  }

  public downloadSong(item: MusicResult) {
    this.musicService.downloadSongIntoWorkspace(item);
    this.workspaceMusicList = this.addMusicKService.getWorkspaceList();
    M.toast({html: `<span class="card-panel green lighten-2">File '<b>${item.title}</b>' downloaded to workspace.</span>`})
  }

  public clear() {
    this.filterTags = '';
    this.filterDescription = '';
    this.filterName = '';
  }

  public swapLocal(first: number, second: number) {
    const firstData = this.localMusicList[first];
    this.localMusicList[first] = this.localMusicList[second];
    this.localMusicList[second] = firstData;
  }

  public addToLocal(item: string) {
    this.localMusicList.push(item);
  }

  public removeLocal(index: number) {
    this.localMusicList.splice(index, 1);
  }

  public save() {
    this.addMusicKService.saveMusicList(this.localMusicList);
  }

  public saveAndRun() {
    this.save();
    const result = this.addMusicKService.runAddMusicK();
    if (result.success) {
      M.toast({html: `<span class="card-panel green lighten-2">Music insertion was successful!</span>`})
    }
    else {
      M.toast({html: `<span class="card-panel red lighten-2">${result.error}</span>`})
    }
  }

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.localMusicList, event.previousIndex, event.currentIndex);
  }


}
