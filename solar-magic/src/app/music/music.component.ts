import { Component, OnInit } from '@angular/core';
import { MusicResult } from '../models/MusicResult';
import { MusicService } from '../music.service';

@Component({
  selector: 'app-music',
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.css']
})
export class MusicComponent implements OnInit {
  public musicList: MusicResult[] = [];
  public loading: boolean = false;

  constructor(
    private musicService: MusicService
  ) { }

  public search() {
    console.log(`music.component: searching...`);
    this.loading = true;
    this.musicService.searchMusic('', '', '', 1)
      .subscribe((music) => {
        this.musicList = music;
        this.loading = false;
        console.log(`music.component: Loaded Music: ${this.musicList.length}`);
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

  ngOnInit(): void {
    this.search();
  }

}
