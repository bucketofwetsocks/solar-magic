import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MusicResult } from './models/MusicResult';
import { map } from 'rxjs/operators'

/**
 * Handles searching for music out in smwcentral land.
 * 
 * SMWCENTRAL API WHEN!?!?!?!?!
 */
@Injectable({
  providedIn: 'any'
})
export class MusicService {
  private readonly ROOT_URL = `https://www.smwcentral.net/?p=section&s=smwmusic`;

  constructor(
    private http: HttpClient
  ) { }

  /**
   * parses out the HTML from SMWCentral and returns a MusicResult[].
   */
  private parseResults(html: string): MusicResult[] {
    console.log('zomg');
    console.dir(html);
    // const root = parse(html);
    // console.log(root.querySelector('#list_content'));
    return [];
  }

  /**
   * perform an HTTP request to swmcentral and parse the music results.
   */
  public searchMusic(name: string, tags: string, description: string, page: number) : Observable<MusicResult> {
    return this.http.get(
        `${this.ROOT_URL}&f%5Bname%5D=${name}&f%5Bauthor%5D=&f%5Btags%5D=${tags}&f%5Bfeatured%5D=&f%5Bdescription%5D=${description}&n=${page}`,
        {responseType: 'text'}
      )
      .pipe(
        map((data: string) => this.parseResults(data))
      );
  }
}
