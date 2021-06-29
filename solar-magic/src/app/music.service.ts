import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MusicResult } from './models/MusicResult';
import { map } from 'rxjs/operators'
import { parse } from 'node-html-parser';
import { FileService } from './file.service';
import { WorkspaceService } from './workspace.service';
import { SearchResult } from './models/SearchResult';
import { StringService } from './string.service';

const path = (<any>window).require('path');

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
    private http: HttpClient,
    private fileService: FileService,
    private workspaceService: WorkspaceService,
    private stringService: StringService
  ) { }

  /**
   * parses out the HTML from SMWCentral and returns a MusicResult[].
   */
  private parseResults(html: string, page: number): SearchResult<MusicResult> {
    const root = parse(html);

    // parse the table's metadata about pagination.
    const result = {} as SearchResult<MusicResult>;
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

    // parse out information.  Here's the example page:
    // https://www.smwcentral.net/?p=section&s=smwmusic
    const music: MusicResult[] = [];
    for (const item of items) {
      const tds = item.querySelectorAll('td');
      const result: MusicResult = {
        title: this.stringService.cleanString(tds[0]?.querySelector('.cell-icon-aside a')?.innerText),
        link: tds[0]?.querySelector('.cell-icon-aside a')?.attributes['href'],
        type: this.stringService.cleanString(tds[1]?.innerText),
        sampleUsage: this.stringService.cleanString(tds[2]?.innerText),
        source: this.stringService.cleanString(tds[3]?.innerText),
        duration: this.stringService.cleanString(tds[4]?.innerText),
        featured: this.stringService.cleanString(tds[5]?.innerText),
        description: this.stringService.cleanString(tds[6]?.innerText),
        authors: this.stringService.cleanString(tds[7]?.querySelector('.un-outer a')?.innerText),
        rating: this.stringService.cleanString(tds[8]?.innerText),
        size: this.stringService.cleanString(tds[9]?.innerText),
        downloadLink: `https:${tds[10]?.querySelector('a')?.attributes['href']}`,
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
  public searchMusic(name: string, tags: string, description: string, page: number) : Observable<SearchResult<MusicResult>> {
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


  /**
   * downloads a music item and moves it into the workspace.  
   * quite a lot of work is done here.
   */
  public downloadSongIntoWorkspace(item:MusicResult) {
    console.log(`music.component: downloading item: ${item.downloadLink}`);
    const zipfile = this.fileService.downloadFile(item.downloadLink, `${this.workspaceService.getMusicFolder()}/staging`);
    const unzippedFolder = `${this.workspaceService.getMusicFolder()}/staging/${item.spcId}`;
    // if the folder already exists, and we're re-downloading the same track because
    // we're a total moron, then we'll need to clean the folder up first.
    if(this.fileService.exists(unzippedFolder)) {
      this.fileService.delete(unzippedFolder);
    }

    this.fileService.unZipFile(zipfile, unzippedFolder);
    this.fileService.delete(zipfile);

    // at this point we have an un-zipped folder in root/music/id
    // inside that id folder there should be a txt file containing the music code, but 
    // sometimes there's _yet_ another folder containing the data. filthy wankers.
    let allfiles = this.fileService.getOnlyFiles(unzippedFolder);
    let allfolders = this.fileService.getOnlyDirectories(unzippedFolder);
    while ((!allfiles || allfiles.length === 0) && allfolders && allfolders.length === 1) {
      // all we have is a single folder in the unzipped directory, so we just move
      // everything back one folder. We'll continue doing this until the author of the
      // song gets their shit together.
      const internalfolder = allfolders[0];
      const backOneParent = path.join(internalfolder, '../');
      this.fileService.copy(internalfolder, backOneParent);
      this.fileService.delete(internalfolder);
      allfiles = this.fileService.getOnlyFiles(unzippedFolder);
      allfolders = this.fileService.getOnlyDirectories(unzippedFolder);
    }

    // allllllrighty.  finally we have some standardized folder structuring now.
    // at this point all we need to do is to move the text files into the music folder,
    // and the folders into the samples directory. 
    // i never understood why AddMusicK wanted you to split them up like this.
    const musicDir = this.workspaceService.getMusicFolder();
    const textFiles = allfiles.filter(f => f.endsWith('.txt'));
    textFiles.forEach((f) => this.fileService.copy(f, `${musicDir}/music/${path.basename(f)}`));
    allfolders.forEach((f) => this.fileService.copy(f, `${musicDir}/samples/${path.basename(f)}`));
  }
}
