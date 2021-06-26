import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

const fs = (<any>window).require('fs');

@Injectable({
  providedIn: 'root'
})
export class TestService {

  public onNumberChange: ReplaySubject<number> = new ReplaySubject<number>();
  private num = 10;

  constructor() {

    setInterval(() => {
      fs.access('./', (error: string) => {
        this.onNumberChange.next(++this.num);
      });
    }, 5000);
  }
}
