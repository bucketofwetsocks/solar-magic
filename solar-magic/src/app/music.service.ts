import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MusicResult } from './models/MusicResult';
import { map } from 'rxjs/operators'
import { parse } from 'node-html-parser';

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
   * Values from SMWCentral come back with a lot of garbage it seems.
   * This just removes all of that.
   */
  private cleanString(val: string): string {
    return val
      .replace(/\n/g, '')
      .replace(/\t/g, '')
  }

  /**
   * parses out the HTML from SMWCentral and returns a MusicResult[].
   */
  private parseResults(html: string): MusicResult[] {
    const root = parse(html);
    const table = root.querySelector('#list_content');

    // remove the first tr, as it's nothing more than the header.
    const items = table.querySelectorAll('tr');
    items.shift();

    // parse out information.  Here's the example page:
    // https://www.smwcentral.net/?p=section&s=smwmusic
    const music: MusicResult[] = [];
    for (const item of items) {
      const tds = item.querySelectorAll('td');
      const result: MusicResult = {
        title: this.cleanString(tds[0].querySelector('.cell-icon-aside a').innerText),
        link: tds[0].querySelector('.cell-icon-aside a').attributes['href'],
        type: this.cleanString(tds[1].innerText),
        sampleUsage: this.cleanString(tds[2].innerText),
        source: this.cleanString(tds[3].innerText),
        duration: this.cleanString(tds[4].innerText),
        featured: this.cleanString(tds[5].innerText),
        description: this.cleanString(tds[6].innerText),
        authors: this.cleanString(tds[7].querySelector('.un-outer a').innerText),
        rating: this.cleanString(tds[8].innerText),
        size: this.cleanString(tds[9].innerText),
        downloadLink: tds[10].querySelector('a').attributes['href'],
        spcId: tds[0].querySelector('.cell-icon-wrapper a').attributes['data-spc-file']
      };

      music.push(result);
    }

    return music;
  }

  /**
   * perform an HTTP request to swmcentral and parse the music results.
   */
  public searchMusic(name: string, tags: string, description: string, page: number) : Observable<MusicResult[]> {
    return this.http.get(
        `${this.ROOT_URL}&f%5Bname%5D=${name}&f%5Bauthor%5D=&f%5Btags%5D=${tags}&f%5Bfeatured%5D=&f%5Bdescription%5D=${description}&n=${page}`,
        {responseType: 'text'}
      )
      .pipe(
        map((data: string) => this.parseResults(data))
      );
  }

  /**
   * returns actual SPC data from a JSON object out in SMWCentral.
   */
  public getSPC(id:string) : Observable<any> {
    return this.http.get(
        `https://www.smwcentral.net/ajax.php?a=getfilepreview&s=smwmusic&id=${id}&index=0`,
      )
  }
}
