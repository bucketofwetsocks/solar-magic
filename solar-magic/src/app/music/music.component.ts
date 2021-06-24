import { Component, OnInit } from '@angular/core';
import { MusicService } from '../music.service';

@Component({
  selector: 'app-music',
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.css']
})
export class MusicComponent implements OnInit {

  constructor(
    private musicService: MusicService
  ) { }

  ngOnInit(): void {
    this.musicService.searchMusic('', '', '', 1)
      .subscribe((music) => {
        console.dir(music);
      });
  }

}
