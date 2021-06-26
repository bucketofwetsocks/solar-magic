import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  public onChange: Subject<number> = new Subject<number>();
  private num: number = 0;

  constructor() { 
    setInterval(() => this.onChange.next(this.num++), 2000);
  }
}
