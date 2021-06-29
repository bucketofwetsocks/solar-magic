import { Injectable } from '@angular/core';
import { BlocksResult } from './models/BlocksResult';
import { SearchResult } from './models/SearchResult';
import { parse } from 'node-html-parser';
import { forkJoin, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { WorkspaceService } from './workspace.service';
import { FileService } from './file.service';


@Injectable({
  providedIn: 'root'
})
export class BlocksService {
  private readonly ROOT_URL = `https://www.smwcentral.net/?p=section&s=smwblocks&o=name&d=asc`;

  constructor(
    private http: HttpClient,
    private workspaceService: WorkspaceService,
    private fileService: FileService
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
  private parseResults(listHtml: string, galleryHtml: string, page: number): SearchResult<BlocksResult> {
    const root = parse(listHtml);

    // parse the table's metadata about pagination.
    const result = {} as SearchResult<BlocksResult>;
    const stats = root.querySelectorAll('.stats');

    const totalCount = parseInt(stats[2].innerText);
    const maxCount = parseInt(stats[1].innerText);
    const minCount = parseInt(stats[0].innerText);
    let totalLoaded = maxCount - minCount + 1;
    let totalPages = Math.ceil(totalCount / totalLoaded);
    // a quick fix - since we don't know the exact number of results
    // to be returned, we have to check for the last page. 
    if (maxCount === totalCount)
      totalPages = page;
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
    
    // parse out all of the gallery links from the gallery page.
    const groot = parse(galleryHtml);
    const allLinks = groot.querySelectorAll('td.cell1.center')
      .map((td) => td.querySelector('a').attributes['href']);

    // parse out information.  Here's the example page:
    // https://www.smwcentral.net/?p=section&s=smwblocks
    const music: BlocksResult[] = [];
    for (const item of items) {
      const tds = item.querySelectorAll('td');
      const result: BlocksResult = {
        title: this.cleanString(tds[0]?.querySelector('a')?.innerText),
        actAs: this.cleanString(tds[1]?.innerText),
        includesGfx: this.cleanString(tds[2]?.innerText),
        description: this.cleanString(tds[3]?.innerText),
        authors: this.cleanString(tds[4]?.querySelector('a')?.innerText),
        rating: this.cleanString(tds[5]?.innerText),
        size: this.cleanString(tds[6]?.innerText),
        downloadLink: `https:${tds[7]?.querySelector('a')?.attributes['href']}`,
        id: tds[0]?.querySelector('a').attributes['href']?.split('=').pop() as string,
        previewLink: ''
      };

      // now we need to find the previewlink for the image display. 
      // it will be located in the gallery page.
      result.previewLink = allLinks.find((l) => l.indexOf(item.id)) as string;

      music.push(result);
    }

    result.results = music;
    console.log(`blocks.service: data`);
    console.dir(result);
    return result;
  }

  /**
   * perform an HTTP request to swmcentral and parse the music results.
   */
  public search(name: string, tags: string, description: string, page: number) : Observable<SearchResult<BlocksResult>> {
    // we need to make 2 calls here.  one for most of the data, one for the preview array. fun stuff.
    // if only there was like... an api or something we could call.
    return forkJoin([
        this.http.get(
          `${this.ROOT_URL}&f%5Bname%5D=${name}&f%5Bauthor%5D=&f%5Btags%5D=${tags}&f%5Bfeatured%5D=&f%5Bdescription%5D=${description}&n=${page}`,
          {responseType: 'text'}
        ),
        this.http.get(
          `${this.ROOT_URL}&f%5Bname%5D=${name}&f%5Bauthor%5D=&f%5Btags%5D=${tags}&f%5Bfeatured%5D=&f%5Bdescription%5D=${description}&n=${page}&g=1`,
          {responseType: 'text'}
        ),
      ]).pipe(map((results: string[]) => {
        const listResults = results[0];
        const galleryResults = results[1];
        return this.parseResults(listResults, galleryResults, page);
      }
    ));
  }

  /**
   * downloads a music item and moves it into the workspace.  
   * quite a lot of work is done here.
   */
  public downloadBlockIntoWorkspace(item:BlocksResult) {
    console.log(`blocks.component: downloading item: ${item.downloadLink}`);
    const zipfile = this.fileService.downloadFile(item.downloadLink, `${this.workspaceService.getBlocksFolder()}/staging`);
    const unzippedFolder = `${this.workspaceService.getBlocksFolder()}/staging/${item.id}`;
    // if the folder already exists, and we're re-downloading the same track because
    // we're a total moron, then we'll need to clean the folder up first.
    if(this.fileService.exists(unzippedFolder)) {
      this.fileService.delete(unzippedFolder);
    }

    this.fileService.unZipFile(zipfile, unzippedFolder);
    this.fileService.delete(zipfile);

    //todo - rest of the bloody code.
  }


}

