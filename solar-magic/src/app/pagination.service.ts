import { Injectable } from '@angular/core';
import { SearchResult } from './models/SearchResult';

@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  constructor() { }


  public generatePaginationList(searchResult: SearchResult<any>) {
    const RADIUS = 4;
    const MIN = 1;
    const result = [];

    // first go down
    let current = searchResult.pagination.requestedPage - RADIUS;
    while (current !== searchResult.pagination.requestedPage) {
      if (current >= MIN)
        result.push(current);
      current++;
    }

    // now push the current page
    result.push(current);
    
    // now go up
    current++;
    const end = current + RADIUS;
    while (current !== end) {
      if (current <= searchResult.pagination.totalPages)
        result.push(current);
      current++;
    }

    console.log(`music.component: pagination list: ${result}`);
    console.log(`music.component: pagination values: `);
    console.dir(searchResult.pagination);

    return result;
  }

}
