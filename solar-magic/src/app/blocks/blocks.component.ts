import { Component, OnInit } from '@angular/core';
import { BlocksService } from '../blocks.service';
import { BlocksResult } from '../models/BlocksResult';
import { SearchResult } from '../models/SearchResult';
import { PaginationService } from '../pagination.service';

@Component({
  selector: 'app-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.css']
})
export class BlocksComponent implements OnInit {
  public filterName: string = '';
  public filterDescription: string = '';
  public filterTags: string = '';
  public blocksSearch = {} as SearchResult<BlocksResult>;


  public loading: boolean = false;
  public paginationList: number[] = [];



  constructor(
    private blocksService: BlocksService,
    private paginationService: PaginationService
  ) {}

  ngOnInit(): void {
    this.search(1);
  }

  public clear() {
    this.filterTags = '';
    this.filterDescription = '';
    this.filterName = '';
  }

  public search(page?: number) {
    console.log(`blocks.component: searching...`);
    if (!page)
      page = 1;

    this.loading = true;
    this.blocksService.search(this.filterName, this.filterDescription, this.filterTags, page)
      .subscribe((blocks) => {
        this.paginationList = this.paginationService.generatePaginationList(blocks);
        this.blocksSearch = blocks;
        this.loading = false;
        console.log(`blocks.component: Loaded Blocks: ${this.blocksSearch.results.length}`);
      });
  }

  public save() {

  }

  public saveAndRun() {
    
  }


}
