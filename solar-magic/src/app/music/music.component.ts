import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { AddMusicKService } from '../add-music-k.service';
import { MusicResult } from '../models/MusicResult';
import { MusicSearch } from '../models/MusicSearch';
import { MusicService } from '../music.service';

const M = (<any>window).M;
const path = (<any>window).require('path');

@Component({
  selector: 'app-music',
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.css']
})
export class MusicComponent implements OnInit {
  public musicSearch = {} as MusicSearch;
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
    private addMusicKService: AddMusicKService
  ) { }

  ngOnInit(): void {
    console.log(`music.component: init.`);
    this.localMusicList = this.addMusicKService.getMusicList();
    this.originalMusicList = this.addMusicKService.getOriginalsList();
    this.workspaceMusicList = this.addMusicKService.getWorkspaceList();
    this.search(1);
  }

  private generatePaginationList(searchResult: MusicSearch) {
    const RADIUS = 4;
    const MIN = 1;
    const result = [];

    // first go down
    let current = searchResult.pagination.requestedPage - RADIUS;
    while (current !== searchResult.pagination.requestedPage) {
      if (current >= MIN)
        result.push(current);
      current++;
    }

    // now push the current page
    result.push(current);
    
    // now go up
    current++;
    const end = current + RADIUS;
    while (current !== end) {
      if (current <= searchResult.pagination.totalPages)
        result.push(current);
      current++;
    }

    console.log(`music.component: pagination list: ${result}`);
    console.log(`music.component: pagination values: `);
    console.dir(searchResult.pagination);

    this.paginationList = result;
  }

  public search(page?: number) {
    console.log(`music.component: searching...`);
    if (!page)
      page = 1;

    this.loading = true;
    this.musicService.searchMusic(this.filterName, this.filterDescription, this.filterTags, page)
      .subscribe((music) => {
        this.generatePaginationList(music);
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
