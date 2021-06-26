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
      const me = this;
      fs.existsSync('./');
      me.onNumberChange.next(++this.num);
      // fs.access('./', fs.constants.F_OK, (error: string) => {
    }, 5000);
  }
}
