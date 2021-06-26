import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

const fs = (<any>window).require('fs');

@Injectable({
  providedIn: 'root'
})
export class TestService {

  public onChange: Subject<number> = new Subject<number>();
  public onFSChange: Subject<number> = new Subject<number>();
  private num: number = 0;
  private fsNum: number = 0;

  constructor() { 
    setInterval(() => this.onChange.next(++this.num), 2000);
    setInterval(() => {
      fs.access('./', (error: string) => {
          console.log(`test.service: accessed the folder.`);
          this.onFSChange.next(++this.fsNum);
      });
    }, 2000);
  }
}
