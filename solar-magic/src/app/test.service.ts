import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  public onNumberChange: ReplaySubject<number> = new ReplaySubject<number>();
  private num = 10;

  constructor() {

    setInterval(() => {
      this.onNumberChange.next(++this.num);
    }, 5000);
  }
}
