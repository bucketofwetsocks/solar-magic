import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MusicResult } from '../models/MusicResult';
import { MusicSearch } from '../models/MusicSearch';
import { MusicService } from '../music.service';

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
    private musicService: MusicService
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
    console.log(`music.component: total pages: ${searchResult.pagination.totalPages}, total count: ${searchResult.pagination.totalCount}`);

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
