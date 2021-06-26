import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MusicResult } from './models/MusicResult';
import { map } from 'rxjs/operators'
import { parse } from 'node-html-parser';
import { MusicSearch } from './models/MusicSearch';

/**
 * Handles searching for music out in smwcentral land.
 * 
 * SMWCENTRAL API WHEN!?!?!?!?!
 */
@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private readonly ROOT_URL = `https://www.smwcentral.net/?p=section&s=smwmusic&o=name&d=asc`;

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Values from SMWCentral come back with a lot of garbage it seems.
   * This just removes all of that.
   */
  private cleanString(val: string): string {
    if (!val)
      return val;
    return val
      .replace(/\n/g, '')
      .replace(/\t/g, '')
  }

  /**
   * parses out the HTML from SMWCentral and returns a MusicResult[].
   */
  private parseResults(html: string, page: number): MusicSearch {
    const root = parse(html);

    // parse the table's metadata about pagination.
    const result = {} as MusicSearch;
    const stats = root.querySelectorAll('.stats');

    const totalCount = parseInt(stats[2].innerText);
    const maxCount = parseInt(stats[1].innerText);
    const minCount = parseInt(stats[0].innerText);
    let totalLoaded = maxCount - minCount + 1;
    const totalPages = Math.ceil(totalCount / totalLoaded);
    result.pagination = {
      displayingMinNumber: parseInt(stats[0].innerText),
      displayingMaxNumber: maxCount,
      totalCount: totalCount,
      requestedPage: page,
      totalPages: totalPages
    };

    // parse the table out.
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
        title: this.cleanString(tds[0]?.querySelector('.cell-icon-aside a')?.innerText),
        link: tds[0]?.querySelector('.cell-icon-aside a')?.attributes['href'],
        type: this.cleanString(tds[1]?.innerText),
        sampleUsage: this.cleanString(tds[2]?.innerText),
        source: this.cleanString(tds[3]?.innerText),
        duration: this.cleanString(tds[4]?.innerText),
        featured: this.cleanString(tds[5]?.innerText),
        description: this.cleanString(tds[6]?.innerText),
        authors: this.cleanString(tds[7]?.querySelector('.un-outer a')?.innerText),
        rating: this.cleanString(tds[8]?.innerText),
        size: this.cleanString(tds[9]?.innerText),
        downloadLink: tds[10]?.querySelector('a')?.attributes['href'],
        spcId: tds[0]?.querySelector('.cell-icon-wrapper a')?.attributes['data-spc-file']
      };

      music.push(result);
    }

    result.results = music;
    return result;
  }

  /**
   * perform an HTTP request to swmcentral and parse the music results.
   */
  public searchMusic(name: string, tags: string, description: string, page: number) : Observable<MusicSearch> {
    return this.http.get(
        `${this.ROOT_URL}&f%5Bname%5D=${name}&f%5Bauthor%5D=&f%5Btags%5D=${tags}&f%5Bfeatured%5D=&f%5Bdescription%5D=${description}&n=${page}`,
        {responseType: 'text'}
      )
      .pipe(
        map((data: string) => this.parseResults(data, page))
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
