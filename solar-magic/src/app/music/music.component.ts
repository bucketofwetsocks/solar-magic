import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FileService } from '../file.service';
import { MusicResult } from '../models/MusicResult';
import { MusicSearch } from '../models/MusicSearch';
import { MusicService } from '../music.service';
import { WorkspaceService } from '../workspace.service';

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

  constructor(
    private musicService: MusicService,
    private fileService: FileService,
    private workspaceService: WorkspaceService
  ) { }

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

  /**
   * todo: this needs to move to music service, or file service, or workspace service.
   * something else. perhaps the go fuck yourself service.
   */
  public downloadSong(item: MusicResult) {
    console.log(`music.component: downloading item: ${item.downloadLink}`);
    const zipfile = this.fileService.downloadFile(item.downloadLink, `${this.workspaceService.getMusicFolder()}/staging`);
    const unzippedFolder = `${this.workspaceService.getMusicFolder()}/staging/${item.spcId}`;
    // if the folder already exists, and we're re-downloading the same track because
    // we're a total moron, then we'll need to clean the folder up first.
    if(this.fileService.exists(unzippedFolder)) {
      this.fileService.delete(unzippedFolder);
    }
    

    this.fileService.unZipFile(zipfile, unzippedFolder);
    this.fileService.delete(zipfile);

    // at this point we have an un-zipped folder in root/music/id
    // inside that id folder there should be a txt file containing the music code, but 
    // sometimes there's _yet_ another folder containing the data. filthy wankers.
    let allfiles = this.fileService.getOnlyFiles(unzippedFolder);
    let allfolders = this.fileService.getOnlyDirectories(unzippedFolder);
    while ((!allfiles || allfiles.length === 0) && allfolders && allfolders.length === 1) {
      // all we have is a single folder in the unzipped directory, so we just move
      // everything back one folder. We'll continue doing this until the author of the
      // song gets their shit together.
      const internalfolder = allfolders[0];
      const backOneParent = path.join(internalfolder, '../');
      this.fileService.copy(internalfolder, backOneParent);
      this.fileService.delete(internalfolder);
      allfiles = this.fileService.getOnlyFiles(unzippedFolder);
      allfolders = this.fileService.getOnlyDirectories(unzippedFolder);
    }

    // allllllrighty.  finally we have some standardized folder structuring now.
    // at this point all we need to do is to move the text files into the music folder,
    // and the folders into the samples directory. 
    // i never understood why AddMusicK wanted you to split them up like this.
    const musicDir = this.workspaceService.getMusicFolder();
    const textFiles = allfiles.filter(f => f.endsWith('.txt'));
    textFiles.forEach((f) => this.fileService.copy(f, `${musicDir}/music/${path.basename(f)}`));
    allfolders.forEach((f) => this.fileService.copy(f, `${musicDir}/samples/${path.basename(f)}`));

    M.toast({html: `<span class="card-panel green lighten-2">File '<b>${item.title}</b>' downloaded to workspace.</span>`})
  }

  public clear() {
    this.filterTags = '';
    this.filterDescription = '';
    this.filterName = '';
  }

  ngOnInit(): void {
    console.log(`music.component: init.`);
    this.search(1);
  }

}
